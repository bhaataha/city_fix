import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        primaryColor: true,
        secondaryColor: true,
        locale: true,
        timezone: true,
        contactEmail: true,
        contactPhone: true,
        website: true,
        address: true,
        slaConfig: true,
        settings: true,
      },
    });

    if (!tenant) return null;

    // Merge settings JSON with direct fields for a unified response
    const settings = (tenant.settings as Record<string, any>) || {};

    return {
      branding: {
        name: tenant.name,
        logo: tenant.logo,
        primaryColor: tenant.primaryColor,
        secondaryColor: tenant.secondaryColor,
      },
      sla: tenant.slaConfig || {
        categories: {
          roads: { responseHours: 4, resolutionHours: 72 },
          lighting: { responseHours: 8, resolutionHours: 48 },
          waste: { responseHours: 12, resolutionHours: 24 },
          parks: { responseHours: 24, resolutionHours: 120 },
          traffic: { responseHours: 2, resolutionHours: 48 },
        },
      },
      notifications: settings.notifications || {
        emailEnabled: true,
        smsEnabled: false,
        pushEnabled: true,
        citizenUpdates: true,
        staffAlerts: true,
      },
      general: {
        locale: tenant.locale,
        timezone: tenant.timezone,
        contactEmail: tenant.contactEmail,
        contactPhone: tenant.contactPhone,
        website: tenant.website,
        address: tenant.address,
        allowAnonymousReports: settings.allowAnonymousReports ?? true,
        requirePhotoOnReport: settings.requirePhotoOnReport ?? false,
        autoAssignEnabled: settings.autoAssignEnabled ?? true,
      },
    };
  }

  async updateSettings(tenantId: string, data: {
    branding?: any;
    sla?: any;
    notifications?: any;
    general?: any;
  }) {
    const updateData: any = {};

    if (data.branding) {
      if (data.branding.name) updateData.name = data.branding.name;
      if (data.branding.logo) updateData.logo = data.branding.logo;
      if (data.branding.primaryColor) updateData.primaryColor = data.branding.primaryColor;
      if (data.branding.secondaryColor) updateData.secondaryColor = data.branding.secondaryColor;
    }

    if (data.sla) {
      updateData.slaConfig = data.sla;
    }

    if (data.general) {
      if (data.general.locale) updateData.locale = data.general.locale;
      if (data.general.timezone) updateData.timezone = data.general.timezone;
      if (data.general.contactEmail) updateData.contactEmail = data.general.contactEmail;
      if (data.general.contactPhone) updateData.contactPhone = data.general.contactPhone;
      if (data.general.website) updateData.website = data.general.website;
      if (data.general.address) updateData.address = data.general.address;
    }

    // Store notification prefs and misc flags in the JSON settings column
    if (data.notifications || data.general) {
      const existing = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { settings: true },
      });
      const currentSettings = (existing?.settings as Record<string, any>) || {};

      updateData.settings = {
        ...currentSettings,
        ...(data.notifications ? { notifications: data.notifications } : {}),
        ...(data.general?.allowAnonymousReports !== undefined
          ? { allowAnonymousReports: data.general.allowAnonymousReports }
          : {}),
        ...(data.general?.requirePhotoOnReport !== undefined
          ? { requirePhotoOnReport: data.general.requirePhotoOnReport }
          : {}),
        ...(data.general?.autoAssignEnabled !== undefined
          ? { autoAssignEnabled: data.general.autoAssignEnabled }
          : {}),
      };
    }

    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: updateData,
    });
  }

  // ─── Transparency / Public Stats ──────────────────
  async getTransparencyStats(tenantId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalIssues,
      resolvedIssues,
      openIssues,
      recentIssues,
      departmentStats,
    ] = await Promise.all([
      this.prisma.issueReport.count({ where: { tenantId } }),
      this.prisma.issueReport.count({ where: { tenantId, status: 'RESOLVED' } }),
      this.prisma.issueReport.count({
        where: { tenantId, status: { notIn: ['RESOLVED', 'CLOSED'] } },
      }),
      this.prisma.issueReport.count({
        where: { tenantId, createdAt: { gte: thirtyDaysAgo } },
      }),
      this.prisma.issueReport.groupBy({
        by: ['assignedDeptId'],
        where: { tenantId, assignedDeptId: { not: null } },
        _count: true,
      }),
    ]);

    const resolutionRate = totalIssues > 0
      ? Math.round((resolvedIssues / totalIssues) * 100)
      : 0;

    return {
      totalIssues,
      resolvedIssues,
      openIssues,
      recentIssues,
      resolutionRate,
      departmentStats,
    };
  }
}
