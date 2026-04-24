import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { generateReportNumber } from '@cityfix/shared';
import { Prisma } from '@cityfix/database';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { IssuesGateway } from './issues.gateway';
import { GeoResolverService } from '../../common/geo/geo-resolver.service';

@Injectable()
export class IssuesService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private notificationsService: NotificationsService,
    private geoResolver: GeoResolverService,
    @Inject(forwardRef(() => IssuesGateway))
    private issuesGateway: IssuesGateway,
  ) {}

  /**
   * Create a citizen-reported issue.
   *
   * - If `tenantId` is provided (the legacy `/:tenant/issues` endpoint),
   *   we keep the original behavior.
   * - Otherwise we resolve the responsible municipality from lat/lng and
   *   route there. If no municipality matches, the report is filed under
   *   the PUBLIC tenant as an *orphan* awaiting adoption.
   */
  async create(tenantId: string | null, data: {
    categoryId?: string;
    categoryName?: string;
    subcategory?: string;
    description: string;
    address?: string;
    latitude: number;
    longitude: number;
    urgency?: string;
    isImmediateDanger?: boolean;
    isAnonymous?: boolean;
    reporterId?: string;
    eventDate?: Date;
  }) {
    let resolvedTenantId = tenantId;
    let isOrphaned = false;
    let originalTenantId: string | null = null;
    let pendingMunicipality:
      | { tenantId: string; slug: string; name: string }
      | undefined;

    if (!resolvedTenantId) {
      const resolved = await this.geoResolver.resolve(data.latitude, data.longitude);

      // Claimed municipality => directly assigned tenant workflow.
      // Unclaimed municipality or no municipality => PUBLIC orphan workflow.
      if (resolved.matchType === 'public-fallback') {
        resolvedTenantId = resolved.tenantId;
        isOrphaned = true;
      } else if (!resolved.isClaimed) {
        const publicTenant = await this.geoResolver.getOrCreatePublicTenant();
        resolvedTenantId = publicTenant.id;
        originalTenantId = resolved.tenantId;
        isOrphaned = true;
        pendingMunicipality = {
          tenantId: resolved.tenantId,
          slug: resolved.slug,
          name: resolved.name,
        };
      } else {
        resolvedTenantId = resolved.tenantId;
      }
    }

    const finalTenantId = resolvedTenantId!;

    let categoryId = data.categoryId;
    if (!categoryId && data.categoryName) {
      categoryId = await this.resolveOrCreateCategory(finalTenantId, data.categoryName);
    }
    if (!categoryId) {
      throw new BadRequestException('categoryId or categoryName is required');
    }

    const count = await this.prisma.issueReport.count({ where: { tenantId: finalTenantId } });
    const reportNumber = generateReportNumber(finalTenantId, count + 1);

    // Check for duplicates within 50m radius (~0.00045 degrees)
    const nearbyIssues = await this.prisma.issueReport.findMany({
      where: {
        tenantId: finalTenantId,
        categoryId,
        status: { notIn: ['CLOSED', 'REJECTED', 'DUPLICATE'] },
        latitude: { gte: data.latitude - 0.00045, lte: data.latitude + 0.00045 },
        longitude: { gte: data.longitude - 0.00045, lte: data.longitude + 0.00045 },
      },
      select: { id: true, reportNumber: true, description: true },
      take: 5,
    });

    const category = await this.prisma.serviceCategory.findUnique({
      where: { id: categoryId },
      select: { departmentId: true, slaHours: true },
    });

    let slaDeadline: Date | undefined;
    if (category?.slaHours) {
      slaDeadline = new Date();
      slaDeadline.setHours(slaDeadline.getHours() + category.slaHours);
    }

    // Orphan / unclaimed reports stay NEW until a municipality adopts them.
    // Only a claimed municipality with a matching department gets auto-assigned.
    const initialStatus = !isOrphaned && category?.departmentId ? 'ASSIGNED' : 'NEW';

    const issue = await this.prisma.issueReport.create({
      data: {
        tenantId: finalTenantId,
        originalTenantId,
        reportNumber,
        categoryId,
        subcategory: data.subcategory,
        description: data.description,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        urgency: (data.urgency as any) || 'NORMAL',
        isImmediateDanger: data.isImmediateDanger || false,
        isAnonymous: data.isAnonymous || false,
        reporterId: data.isAnonymous ? null : data.reporterId,
        assignedDeptId: !isOrphaned ? category?.departmentId : undefined,
        eventDate: data.eventDate,
        slaDeadline: !isOrphaned ? slaDeadline : undefined,
        status: initialStatus,
        isOrphaned,
        visibility: 'PUBLIC',
        metadata: isOrphaned && pendingMunicipality
          ? {
              pendingMunicipalityId: pendingMunicipality.tenantId,
              pendingMunicipalitySlug: pendingMunicipality.slug,
              pendingMunicipalityName: pendingMunicipality.name,
            }
          : undefined,
        statusHistory: {
          create: {
            fromStatus: null,
            toStatus: initialStatus,
            reason: isOrphaned ? 'Orphan citizen report — awaiting municipal adoption' : 'Issue created',
          },
        },
      },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
        reporter: { select: { id: true, firstName: true, lastName: true, email: true } },
        assignedDept: { select: { id: true, name: true } },
        tenant: { select: { name: true, slug: true, kind: true, isClaimed: true } },
        attachments: true,
        _count: { select: { comments: true, upvotes: true } },
      },
    });

    this.issuesGateway.notifyIssueCreated(finalTenantId, issue);
    this.issuesGateway.notifyPublicFeed(issue);

    if (!isOrphaned) {
      this.notificationsService.onIssueCreated(finalTenantId, issue).catch(e => console.error('Failed to create notifications', e));
    }

    if (issue.reporter?.email && issue.tenant?.name) {
      this.mailService.sendIssueCreatedEmail(
        issue.reporter.email,
        issue.reportNumber,
        issue.category?.name || 'כללי',
        issue.tenant.name
      ).catch(e => console.error('Failed to send email', e));
    }

    return {
      issue,
      isOrphaned,
      adoptionStatus: isOrphaned
        ? pendingMunicipality
          ? `הדיווח נשמר לציבור וימתין לאימוץ של ${pendingMunicipality.name}`
          : `הדיווח נשמר לציבור וימתין לאימוץ עירייה`
        : undefined,
      nearbyDuplicates: nearbyIssues.length > 0 ? nearbyIssues : undefined,
    };
  }

  /**
   * Resolve a free-text category name to a category id, creating it if needed.
   * Used by the public reporting endpoint where citizens just pick a label.
   */
  private async resolveOrCreateCategory(tenantId: string, name: string): Promise<string> {
    const existing = await this.prisma.serviceCategory.findFirst({
      where: { tenantId, OR: [{ name }, { nameEn: name }, { nameAr: name }] },
      select: { id: true },
    });
    if (existing) return existing.id;

    const created = await this.prisma.serviceCategory.create({
      data: { tenantId, name, sortOrder: 999 },
      select: { id: true },
    });
    return created.id;
  }

  // ─── PUBLIC / GLOBAL FEED ─────────────────────────────────

  /**
   * Cross-tenant public feed — every PUBLIC-visibility report regardless
   * of which tenant currently owns it. Powers the global map and the
   * "civic timeline" on the landing page.
   */
  async findPublicFeed(filters: {
    bbox?: { north: number; south: number; east: number; west: number };
    status?: string;
    categoryName?: string;
    onlyOrphans?: boolean;
    page?: number;
    perPage?: number;
  }) {
    const page = filters.page || 1;
    const perPage = Math.min(filters.perPage || 50, 200);

    const where: Prisma.IssueReportWhereInput = {
      visibility: 'PUBLIC',
      ...(filters.status && { status: filters.status as any }),
      ...(filters.onlyOrphans && { isOrphaned: true }),
      ...(filters.bbox && {
        latitude: { gte: filters.bbox.south, lte: filters.bbox.north },
        longitude: { gte: filters.bbox.west, lte: filters.bbox.east },
      }),
      ...(filters.categoryName && {
        category: { name: { contains: filters.categoryName, mode: 'insensitive' } },
      }),
    };

    const [issues, total] = await Promise.all([
      this.prisma.issueReport.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          reportNumber: true,
          description: true,
          address: true,
          latitude: true,
          longitude: true,
          status: true,
          urgency: true,
          isOrphaned: true,
          adoptedAt: true,
          upvoteCount: true,
          commentCount: true,
          followerCount: true,
          createdAt: true,
          category: { select: { id: true, name: true, icon: true, color: true } },
          tenant: { select: { id: true, name: true, slug: true, kind: true, isClaimed: true } },
          reporter: { select: { id: true, firstName: true, lastName: true } },
          attachments: { select: { fileUrl: true, type: true }, take: 1 },
          _count: { select: { upvotes: true, comments: true } },
        },
      }),
      this.prisma.issueReport.count({ where }),
    ]);

    return {
      issues,
      meta: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
    };
  }

  // ─── CIVIC ENGAGEMENT ─────────────────────────────────────

  async upvote(issueId: string, userId: string) {
    const issue = await this.prisma.issueReport.findUnique({
      where: { id: issueId },
      select: { id: true, tenantId: true },
    });
    if (!issue) throw new NotFoundException('Issue not found');

    try {
      await this.prisma.issueUpvote.create({ data: { issueId, userId } });
      const updated = await this.prisma.issueReport.update({
        where: { id: issueId },
        data: { upvoteCount: { increment: 1 } },
        select: { id: true, upvoteCount: true },
      });
      this.issuesGateway.notifyIssueEngagement(issue.tenantId, issueId, {
        upvoteCount: updated.upvoteCount,
      });
      return { upvoted: true, upvoteCount: updated.upvoteCount };
    } catch (e: any) {
      if (e.code === 'P2002') {
        const cur = await this.prisma.issueReport.findUnique({
          where: { id: issueId },
          select: { upvoteCount: true },
        });
        return { upvoted: true, upvoteCount: cur?.upvoteCount ?? 0, alreadyUpvoted: true };
      }
      throw e;
    }
  }

  async removeUpvote(issueId: string, userId: string) {
    const deleted = await this.prisma.issueUpvote.deleteMany({ where: { issueId, userId } });
    if (deleted.count === 0) {
      const cur = await this.prisma.issueReport.findUnique({
        where: { id: issueId },
        select: { upvoteCount: true },
      });
      return { upvoted: false, upvoteCount: cur?.upvoteCount ?? 0 };
    }
    const updated = await this.prisma.issueReport.update({
      where: { id: issueId },
      data: { upvoteCount: { decrement: 1 } },
      select: { upvoteCount: true, tenantId: true },
    });
    this.issuesGateway.notifyIssueEngagement(updated.tenantId, issueId, {
      upvoteCount: Math.max(0, updated.upvoteCount),
    });
    return { upvoted: false, upvoteCount: Math.max(0, updated.upvoteCount) };
  }

  async follow(issueId: string, userId: string) {
    const issue = await this.prisma.issueReport.findUnique({
      where: { id: issueId },
      select: { id: true },
    });
    if (!issue) throw new NotFoundException('Issue not found');

    try {
      await this.prisma.issueFollow.create({ data: { issueId, userId } });
      const updated = await this.prisma.issueReport.update({
        where: { id: issueId },
        data: { followerCount: { increment: 1 } },
        select: { followerCount: true },
      });
      return { following: true, followerCount: updated.followerCount };
    } catch (e: any) {
      if (e.code === 'P2002') {
        const cur = await this.prisma.issueReport.findUnique({
          where: { id: issueId },
          select: { followerCount: true },
        });
        return { following: true, followerCount: cur?.followerCount ?? 0, alreadyFollowing: true };
      }
      throw e;
    }
  }

  async unfollow(issueId: string, userId: string) {
    const deleted = await this.prisma.issueFollow.deleteMany({ where: { issueId, userId } });
    if (deleted.count === 0) {
      const cur = await this.prisma.issueReport.findUnique({
        where: { id: issueId },
        select: { followerCount: true },
      });
      return { following: false, followerCount: cur?.followerCount ?? 0 };
    }
    const updated = await this.prisma.issueReport.update({
      where: { id: issueId },
      data: { followerCount: { decrement: 1 } },
      select: { followerCount: true },
    });
    return { following: false, followerCount: Math.max(0, updated.followerCount) };
  }

  async getEngagementStateForUser(issueId: string, userId: string) {
    const [up, follow] = await Promise.all([
      this.prisma.issueUpvote.findUnique({ where: { issueId_userId: { issueId, userId } } }),
      this.prisma.issueFollow.findUnique({ where: { issueId_userId: { issueId, userId } } }),
    ]);
    return { upvoted: !!up, following: !!follow };
  }

  async findAll(tenantId: string, filters: {
    status?: string;
    categoryId?: string;
    urgency?: string;
    departmentId?: string;
    search?: string;
    page?: number;
    perPage?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }, user?: any) {
    const page = filters.page || 1;
    const perPage = filters.perPage || 20;
    const skip = (page - 1) * perPage;

    const where: Prisma.IssueReportWhereInput = {
      tenantId,
      ...(filters.status && { status: filters.status as any }),
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.urgency && { urgency: filters.urgency as any }),
      ...((user?.role === 'DEPT_MANAGER' ? user.departmentId : filters.departmentId) && {
        assignedDeptId: user?.role === 'DEPT_MANAGER' ? user.departmentId : filters.departmentId,
      }),
      ...(filters.search && {
        OR: [
          { reportNumber: { contains: filters.search, mode: 'insensitive' as any } },
          { description: { contains: filters.search, mode: 'insensitive' as any } },
          { address: { contains: filters.search, mode: 'insensitive' as any } },
        ],
      }),
    };

    const orderBy: any = {};
    if (filters.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [issues, total] = await Promise.all([
      this.prisma.issueReport.findMany({
        where,
        skip,
        take: perPage,
        orderBy,
        include: {
          category: { select: { id: true, name: true, icon: true, color: true } },
          reporter: { select: { id: true, firstName: true, lastName: true } },
          assignedDept: { select: { id: true, name: true } },
          assignedUser: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { attachments: true, comments: true } },
        },
      }),
      this.prisma.issueReport.count({ where }),
    ]);

    return {
      issues,
      meta: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  async findOne(tenantId: string, id: string) {
    try {
      const issue = await this.prisma.issueReport.findFirst({
        where: { id, tenantId },
        include: {
          category: true,
          reporter: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
          assignedDept: true,
          assignedUser: { select: { id: true, firstName: true, lastName: true } },
          attachments: { orderBy: { createdAt: 'asc' } },
          comments: {
            orderBy: { createdAt: 'asc' },
            include: { author: { select: { id: true, firstName: true, lastName: true, role: true } } },
          },
          statusHistory: { orderBy: { createdAt: 'asc' } },
          workOrders: {
            include: { assignedTo: { select: { id: true, firstName: true, lastName: true } } },
          },
          _count: { select: { duplicates: true } },
        },
      });

      if (!issue) {
        throw new NotFoundException('Issue not found');
      }

      // Increment view count safely
      try {
        await this.prisma.issueReport.update({
          where: { id },
          data: { viewCount: { increment: 1 } },
        });
      } catch (updateError) {
        // Log but don't fail the request if viewCount increment fails
        console.error(`Failed to increment view count for issue ${id}:`, updateError);
      }

      return issue;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error fetching issue ${id}:`, error);
      throw new InternalServerErrorException('An error occurred while fetching the issue details');
    }
  }

  async updateStatus(tenantId: string, id: string, status: string, changedById?: string, reason?: string) {
    const issue = await this.prisma.issueReport.findFirst({
      where: { id, tenantId },
      include: { reporter: true, tenant: true },
    });

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    const updated = await this.prisma.issueReport.update({
      where: { id },
      data: {
        status: status as any,
        ...(status === 'RESOLVED' && { resolvedAt: new Date() }),
        ...(status === 'CLOSED' && { closedAt: new Date() }),
        statusHistory: {
          create: {
            fromStatus: issue.status,
            toStatus: status as any,
            changedById,
            reason,
          },
        },
      },
      include: {
        category: { select: { id: true, name: true } },
        assignedDept: { select: { id: true, name: true } },
      },
    });

    // Notify connected clients
    this.issuesGateway.notifyIssueStatusChange(tenantId, id, status, updated);

    // Notify user via in-app
    this.notificationsService.onIssueStatusChanged(tenantId, updated, issue.status, status).catch(e => console.error(e));

    if (issue.status !== status && issue.reporter?.email && issue.tenant) {
      await this.mailService.sendStatusUpdateEmail(
        issue.reporter.email,
        issue.id,
        status,
        issue.tenant.name
      );
    }

    return updated;
  }

  async assignToUser(tenantId: string, issueId: string, userId: string) {
    return this.prisma.issueReport.update({
      where: { id: issueId },
      data: { assignedUserId: userId },
    });
  }

  async assignToDepartment(tenantId: string, issueId: string, departmentId: string) {
    return this.prisma.issueReport.update({
      where: { id: issueId },
      data: {
        assignedDeptId: departmentId,
        status: 'ASSIGNED',
        statusHistory: {
          create: {
            toStatus: 'ASSIGNED',
            reason: `Assigned to department`,
          },
        },
      },
    });
  }

  async addComment(tenantId: string, issueId: string, authorId: string, content: string, isInternal = false) {
    return this.prisma.issueComment.create({
      data: {
        issueId,
        authorId,
        content,
        isInternal,
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
    });
  }

  async getMapIssues(tenantId: string, bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) {
    const where: Prisma.IssueReportWhereInput = {
      tenantId,
      status: { notIn: ['CLOSED', 'REJECTED', 'DUPLICATE'] },
      ...(bounds && {
        latitude: { gte: bounds.south, lte: bounds.north },
        longitude: { gte: bounds.west, lte: bounds.east },
      }),
    };

    return this.prisma.issueReport.findMany({
      where,
      select: {
        id: true,
        reportNumber: true,
        latitude: true,
        longitude: true,
        status: true,
        urgency: true,
        description: true,
        address: true,
        createdAt: true,
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
      take: 1000,
    });
  }

  async getDashboardStats(tenantId: string, user?: any) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const deptFilter = user?.role === 'DEPT_MANAGER' && user?.departmentId 
      ? { assignedDeptId: user.departmentId } 
      : {};

    const [
      totalOpen,
      newToday,
      resolvedThisWeek,
      slaBreached,
      byCategory,
      byStatus,
      byUrgency,
    ] = await Promise.all([
      this.prisma.issueReport.count({
        where: { tenantId, ...deptFilter, status: { notIn: ['CLOSED', 'REJECTED', 'DUPLICATE'] } },
      }),
      this.prisma.issueReport.count({
        where: { tenantId, ...deptFilter, createdAt: { gte: todayStart } },
      }),
      this.prisma.issueReport.count({
        where: { tenantId, ...deptFilter, status: 'RESOLVED', resolvedAt: { gte: weekAgo } },
      }),
      this.prisma.issueReport.count({
        where: { tenantId, ...deptFilter, slaBreached: true, status: { notIn: ['CLOSED', 'REJECTED'] } },
      }),
      this.prisma.issueReport.groupBy({
        by: ['categoryId'],
        where: { tenantId, ...deptFilter, status: { notIn: ['CLOSED', 'REJECTED', 'DUPLICATE'] } },
        _count: true,
        orderBy: { _count: { categoryId: 'desc' } },
        take: 10,
      }),
      this.prisma.issueReport.groupBy({
        by: ['status'],
        where: { tenantId, ...deptFilter },
        _count: true,
      }),
      this.prisma.issueReport.groupBy({
        by: ['urgency'],
        where: { tenantId, ...deptFilter, status: { notIn: ['CLOSED', 'REJECTED', 'DUPLICATE'] } },
        _count: true,
      }),
    ]);

    return {
      totalOpen,
      newToday,
      resolvedThisWeek,
      slaBreached,
      byCategory,
      byStatus,
      byUrgency,
    };
  }
}
