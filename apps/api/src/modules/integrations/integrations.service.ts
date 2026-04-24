import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Prisma } from '@cityfix/database';
import { createHmac, randomUUID } from 'crypto';

export type WebhookEvent =
  | 'ISSUE_CREATED'
  | 'ISSUE_STATUS_CHANGED'
  | 'CLAIM_CREATED'
  | 'CLAIM_STATUS_CHANGED'
  | 'TEST';

export interface TenantIntegrationsConfig {
  alerts: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
    criticalOnly: boolean;
  };
  api: {
    enabled: boolean;
    name: string;
    baseUrl: string;
    apiKey?: string;
    docsUrl?: string;
  };
  webhook: {
    enabled: boolean;
    url: string;
    secret?: string;
    events: WebhookEvent[];
    timeoutMs: number;
    retries: number;
  };
}

const DEFAULT_CONFIG: TenantIntegrationsConfig = {
  alerts: {
    inApp: true,
    email: true,
    sms: false,
    criticalOnly: false,
  },
  api: {
    enabled: false,
    name: '',
    baseUrl: '',
  },
  webhook: {
    enabled: false,
    url: '',
    events: ['ISSUE_CREATED', 'ISSUE_STATUS_CHANGED'],
    timeoutMs: 5000,
    retries: 1,
  },
};

@Injectable()
export class IntegrationsService {
  constructor(private prisma: PrismaService) {}

  async listWebhookDeliveries(tenantId: string, limit = 30) {
    const rows = await this.prisma.auditLog.findMany({
      where: {
        tenantId,
        entityType: 'WEBHOOK_DELIVERY',
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(limit, 1), 200),
      select: {
        id: true,
        action: true,
        entityId: true,
        newValues: true,
        createdAt: true,
      },
    });

    return rows.map((r) => ({
      id: r.id,
      action: r.action,
      deliveryId: r.entityId,
      data: r.newValues,
      createdAt: r.createdAt,
    }));
  }

  async getConfig(tenantId: string): Promise<TenantIntegrationsConfig> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const settings = (tenant.settings as Record<string, any>) || {};
    return this.normalizeConfig(settings.integrations);
  }

  async updateConfig(
    tenantId: string,
    partial: Partial<TenantIntegrationsConfig>,
  ): Promise<TenantIntegrationsConfig> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const settings = (tenant.settings as Record<string, any>) || {};
    const merged = this.normalizeConfig({
      ...settings.integrations,
      ...partial,
      alerts: {
        ...(settings.integrations?.alerts || {}),
        ...(partial.alerts || {}),
      },
      api: {
        ...(settings.integrations?.api || {}),
        ...(partial.api || {}),
      },
      webhook: {
        ...(settings.integrations?.webhook || {}),
        ...(partial.webhook || {}),
      },
    });

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        settings: {
          ...settings,
          integrations: merged,
        } as unknown as Prisma.InputJsonObject,
      },
    });

    return merged;
  }

  async testWebhook(tenantId: string) {
    const cfg = await this.getConfig(tenantId);
    if (!cfg.webhook.enabled || !cfg.webhook.url) {
      return { ok: false, reason: 'Webhook is disabled or URL is missing' };
    }

    const payload = {
      event: 'TEST',
      tenantId,
      timestamp: new Date().toISOString(),
      data: {
        message: 'CityFix webhook connectivity test',
      },
    };

    const result = await this.sendWebhook(tenantId, cfg, payload);
    return {
      ok: result.ok,
      status: result.status,
      body: result.body,
      attemptedUrl: cfg.webhook.url,
    };
  }

  async emitWebhookIfEnabled(
    tenantId: string,
    event: WebhookEvent,
    data: Record<string, any>,
  ) {
    const cfg = await this.getConfig(tenantId);
    if (!cfg.webhook.enabled || !cfg.webhook.url) return { skipped: true };
    if (!cfg.webhook.events.includes(event)) return { skipped: true };

    return this.sendWebhook(tenantId, cfg, {
      event,
      tenantId,
      timestamp: new Date().toISOString(),
      data,
    });
  }

  private normalizeConfig(input: any): TenantIntegrationsConfig {
    return {
      alerts: {
        ...DEFAULT_CONFIG.alerts,
        ...(input?.alerts || {}),
      },
      api: {
        ...DEFAULT_CONFIG.api,
        ...(input?.api || {}),
      },
      webhook: {
        ...DEFAULT_CONFIG.webhook,
        ...(input?.webhook || {}),
      },
    };
  }

  private async sendWebhook(
    tenantId: string,
    cfg: TenantIntegrationsConfig,
    payload: Record<string, any>,
  ): Promise<{ ok: boolean; status?: number; body?: string }> {
    const payloadJson = JSON.stringify(payload);
    const deliveryId = randomUUID();
    const timestamp = new Date().toISOString();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-CityFix-Event': String(payload.event || 'UNKNOWN'),
      'X-CityFix-Delivery-Id': deliveryId,
      'X-CityFix-Timestamp': timestamp,
    };
    if (cfg.webhook.secret) {
      const signature = createHmac('sha256', cfg.webhook.secret)
        .update(`${timestamp}.${payloadJson}`)
        .digest('hex');
      headers['X-CityFix-Signature'] = `sha256=${signature}`;
    }

    let lastResult: { ok: boolean; status?: number; body?: string } = {
      ok: false,
      body: 'no attempts',
    };

    const attempts = Math.max(1, cfg.webhook.retries + 1);
    for (let i = 0; i < attempts; i++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), cfg.webhook.timeoutMs);
      try {
        const response = await fetch(cfg.webhook.url, {
          method: 'POST',
          headers,
          body: payloadJson,
          signal: controller.signal,
        });
        const body = await response.text();
        lastResult = {
          ok: response.ok,
          status: response.status,
          body: body.slice(0, 1000),
        };
        await this.logWebhookDelivery(
          tenantId,
          response.ok ? 'WEBHOOK_DELIVERY_OK' : 'WEBHOOK_DELIVERY_FAILED',
          deliveryId,
          {
            event: payload.event,
            url: cfg.webhook.url,
            attempt: i + 1,
            status: response.status,
            ok: response.ok,
            responseBody: body.slice(0, 1000),
          },
        );
        if (response.ok) return lastResult;
      } catch (err: any) {
        lastResult = {
          ok: false,
          body: err?.message || 'network error',
        };
        await this.logWebhookDelivery(
          tenantId,
          'WEBHOOK_DELIVERY_FAILED',
          deliveryId,
          {
            event: payload.event,
            url: cfg.webhook.url,
            attempt: i + 1,
            ok: false,
            error: err?.message || 'network error',
          },
        );
      } finally {
        clearTimeout(timeout);
      }

      // Exponential backoff (200ms, 400ms, 800ms...) capped at 2s
      if (i < attempts - 1) {
        const waitMs = Math.min(200 * 2 ** i, 2000);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
    }
    return lastResult;
  }

  private async logWebhookDelivery(
    tenantId: string,
    action: string,
    deliveryId: string,
    values: Record<string, any>,
  ) {
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        action,
        entityType: 'WEBHOOK_DELIVERY',
        entityId: deliveryId,
        newValues: values as Prisma.InputJsonObject,
      },
    });
  }
}

