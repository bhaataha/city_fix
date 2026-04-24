import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GeoResolverService } from '../../common/geo/geo-resolver.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AdoptionService {
  private readonly logger = new Logger(AdoptionService.name);

  constructor(
    private prisma: PrismaService,
    private geoResolver: GeoResolverService,
    private notifications: NotificationsService,
  ) {}

  /**
   * Preview which PUBLIC orphan issues fall inside the given tenant's
   * geographic boundary. No state changes — used by the admin "claim
   * your city" screen.
   */
  async previewAdoptableIssues(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, name: true, slug: true, kind: true, boundary: true, centerLat: true, centerLng: true, radiusKm: true },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    if (tenant.kind === 'PUBLIC') {
      throw new ForbiddenException('PUBLIC tenant cannot adopt itself');
    }

    const orphanIds = await this.geoResolver.findOrphansInTenant(tenantId);
    if (orphanIds.length === 0) {
      return { tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug }, count: 0, issues: [] };
    }

    const issues = await this.prisma.issueReport.findMany({
      where: { id: { in: orphanIds } },
      orderBy: { createdAt: 'desc' },
      take: 200,
      select: {
        id: true,
        reportNumber: true,
        description: true,
        address: true,
        latitude: true,
        longitude: true,
        status: true,
        urgency: true,
        upvoteCount: true,
        commentCount: true,
        createdAt: true,
        category: { select: { id: true, name: true, icon: true, color: true } },
        attachments: { select: { fileUrl: true }, take: 1 },
      },
    });

    return {
      tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
      count: orphanIds.length,
      issues,
      hasGeometry: !!(tenant.boundary || (tenant.centerLat && tenant.centerLng && tenant.radiusKm)),
    };
  }

  /**
   * Move every matching orphan from the PUBLIC tenant to the adopting
   * municipality. Status is bumped to ASSIGNED if the resolved category
   * has a default department, otherwise stays NEW.
   *
   * Optionally adopt only a specific subset of ids (`onlyIds`).
   */
  async adoptOrphans(tenantId: string, adoptedById: string, onlyIds?: string[]) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, name: true, slug: true, kind: true, isClaimed: true },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    if (tenant.kind === 'PUBLIC') {
      throw new ForbiddenException('PUBLIC tenant cannot adopt issues');
    }

    let candidateIds = await this.geoResolver.findOrphansInTenant(tenantId);
    if (onlyIds && onlyIds.length > 0) {
      const allowed = new Set(candidateIds);
      candidateIds = onlyIds.filter((id) => allowed.has(id));
    }

    if (candidateIds.length === 0) {
      return { adopted: 0, tenantId };
    }

    const now = new Date();

    const result = await this.prisma.$transaction(async (tx) => {
      // Mark tenant as claimed on first successful adoption
      if (!tenant.isClaimed) {
        await tx.tenant.update({
          where: { id: tenantId },
          data: { isClaimed: true, claimedAt: now },
        });
      }

      // Re-fetch each orphan in the transaction so we can apply per-issue category routing
      const orphans = await tx.issueReport.findMany({
        where: { id: { in: candidateIds }, isOrphaned: true },
        select: { id: true, categoryId: true, category: { select: { name: true, slaHours: true } } },
      });

      let adopted = 0;
      for (const o of orphans) {
        // Find the matching category in the *adopting* tenant; create a clone if missing
        const localCategory = await this.findOrCloneCategory(tx, tenantId, o.categoryId);
        const slaHours = localCategory.slaHours ?? o.category.slaHours ?? null;
        const slaDeadline = slaHours ? new Date(now.getTime() + slaHours * 3600_000) : null;

        await tx.issueReport.update({
          where: { id: o.id },
          data: {
            tenantId,
            categoryId: localCategory.id,
            isOrphaned: false,
            adoptedAt: now,
            adoptedById,
            assignedDeptId: localCategory.departmentId ?? undefined,
            status: localCategory.departmentId ? 'ASSIGNED' : 'NEW',
            slaDeadline,
            statusHistory: {
              create: {
                fromStatus: 'NEW',
                toStatus: localCategory.departmentId ? 'ASSIGNED' : 'NEW',
                reason: `Adopted by ${tenant.name}`,
                changedById: adoptedById,
              },
            },
          },
        });
        adopted++;
      }

      return adopted;
    });

    this.logger.log(`Tenant ${tenant.slug} adopted ${result} orphan reports`);

    return { adopted: result, tenantId };
  }

  /**
   * Mirror a category from the PUBLIC tenant into the adopting tenant.
   * Keeps SLA hours, color, and icon in sync. Idempotent by `name`.
   */
  private async findOrCloneCategory(
    tx: any,
    tenantId: string,
    sourceCategoryId: string,
  ): Promise<{ id: string; departmentId: string | null; slaHours: number | null }> {
    const source = await tx.serviceCategory.findUnique({
      where: { id: sourceCategoryId },
      select: { name: true, nameEn: true, nameAr: true, icon: true, color: true, slaHours: true },
    });
    if (!source) throw new NotFoundException('Source category not found');

    const existing = await tx.serviceCategory.findFirst({
      where: { tenantId, name: source.name },
      select: { id: true, departmentId: true, slaHours: true },
    });
    if (existing) return existing;

    const created = await tx.serviceCategory.create({
      data: {
        tenantId,
        name: source.name,
        nameEn: source.nameEn,
        nameAr: source.nameAr,
        icon: source.icon,
        color: source.color,
        slaHours: source.slaHours,
      },
      select: { id: true, departmentId: true, slaHours: true },
    });
    return created;
  }
}
