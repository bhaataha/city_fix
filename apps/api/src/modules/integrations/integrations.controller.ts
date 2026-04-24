import { Body, Controller, Get, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Roles, RolesGuard } from '../../common/guards/roles.guard';
import { TenantId } from '../../common/decorators';
import { IntegrationsService, WebhookEvent } from './integrations.service';

class UpdateIntegrationsDto {
  @IsOptional()
  alerts?: {
    inApp?: boolean;
    email?: boolean;
    sms?: boolean;
    criticalOnly?: boolean;
  };

  @IsOptional()
  api?: {
    enabled?: boolean;
    name?: string;
    baseUrl?: string;
    apiKey?: string;
    docsUrl?: string;
  };

  @IsOptional()
  webhook?: {
    enabled?: boolean;
    url?: string;
    secret?: string;
    events?: WebhookEvent[];
    timeoutMs?: number;
    retries?: number;
  };
}

@ApiTags('Integrations')
@Controller(':tenant/integrations')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class IntegrationsController {
  constructor(private integrations: IntegrationsService) {}

  @Get()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get municipality integrations config' })
  async get(@TenantId() tenantId: string) {
    const data = await this.integrations.getConfig(tenantId);
    return { success: true, data };
  }

  @Patch()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Update municipality integrations config' })
  async update(
    @TenantId() tenantId: string,
    @Body() dto: UpdateIntegrationsDto,
  ) {
    const data = await this.integrations.updateConfig(tenantId, dto as any);
    return { success: true, data };
  }

  @Post('test-webhook')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Send test webhook to configured endpoint' })
  async testWebhook(@TenantId() tenantId: string) {
    const data = await this.integrations.testWebhook(tenantId);
    return { success: true, data };
  }

  @Get('deliveries')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'List recent webhook delivery logs' })
  async deliveries(
    @TenantId() tenantId: string,
    @Query('limit') limit?: string,
  ) {
    const data = await this.integrations.listWebhookDeliveries(
      tenantId,
      limit ? Number(limit) : 30,
    );
    return { success: true, data };
  }
}

