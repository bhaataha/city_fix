import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { generateReportNumber } from '@cityfix/shared';
import { Prisma } from '@cityfix/database';
import { MailService } from '../mail/mail.service';
import { IssuesGateway } from './issues.gateway';

@Injectable()
export class IssuesService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    @Inject(forwardRef(() => IssuesGateway))
    private issuesGateway: IssuesGateway,
  ) {}

  async create(tenantId: string, data: {
    categoryId: string;
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
    // Generate sequential report number
    const count = await this.prisma.issueReport.count({ where: { tenantId } });
    const reportNumber = generateReportNumber(tenantId, count + 1);

    // Check for duplicates within 50m radius (~0.00045 degrees)
    const nearbyIssues = await this.prisma.issueReport.findMany({
      where: {
        tenantId,
        categoryId: data.categoryId,
        status: { notIn: ['CLOSED', 'REJECTED', 'DUPLICATE'] },
        latitude: { gte: data.latitude - 0.00045, lte: data.latitude + 0.00045 },
        longitude: { gte: data.longitude - 0.00045, lte: data.longitude + 0.00045 },
      },
      select: { id: true, reportNumber: true, description: true },
      take: 5,
    });

    // Auto-assign department based on category
    const category = await this.prisma.serviceCategory.findUnique({
      where: { id: data.categoryId },
      select: { departmentId: true, slaHours: true },
    });

    // Calculate SLA deadline
    let slaDeadline: Date | undefined;
    if (category?.slaHours) {
      slaDeadline = new Date();
      slaDeadline.setHours(slaDeadline.getHours() + category.slaHours);
    }

    const issue = await this.prisma.issueReport.create({
      data: {
        tenantId,
        reportNumber,
        categoryId: data.categoryId,
        subcategory: data.subcategory,
        description: data.description,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        urgency: (data.urgency as any) || 'NORMAL',
        isImmediateDanger: data.isImmediateDanger || false,
        isAnonymous: data.isAnonymous || false,
        reporterId: data.isAnonymous ? null : data.reporterId,
        assignedDeptId: category?.departmentId,
        eventDate: data.eventDate,
        slaDeadline,
        status: category?.departmentId ? 'ASSIGNED' : 'NEW',
        statusHistory: {
          create: {
            fromStatus: null,
            toStatus: category?.departmentId ? 'ASSIGNED' : 'NEW',
            reason: 'Issue created',
          },
        },
      },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
        reporter: { select: { id: true, firstName: true, lastName: true } },
        assignedDept: { select: { id: true, name: true } },
        attachments: true,
        _count: { select: { comments: true } },
      },
    });

    // Notify connected clients
    this.issuesGateway.notifyIssueCreated(tenantId, issue);

    return {
      issue,
      nearbyDuplicates: nearbyIssues.length > 0 ? nearbyIssues : undefined,
    };
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
  }) {
    const page = filters.page || 1;
    const perPage = filters.perPage || 20;
    const skip = (page - 1) * perPage;

    const where: Prisma.IssueReportWhereInput = {
      tenantId,
      ...(filters.status && { status: filters.status as any }),
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.urgency && { urgency: filters.urgency as any }),
      ...(filters.departmentId && { assignedDeptId: filters.departmentId }),
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

    // Increment view count
    await this.prisma.issueReport.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return issue;
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

  async getDashboardStats(tenantId: string) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

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
        where: { tenantId, status: { notIn: ['CLOSED', 'REJECTED', 'DUPLICATE'] } },
      }),
      this.prisma.issueReport.count({
        where: { tenantId, createdAt: { gte: todayStart } },
      }),
      this.prisma.issueReport.count({
        where: { tenantId, status: 'RESOLVED', resolvedAt: { gte: weekAgo } },
      }),
      this.prisma.issueReport.count({
        where: { tenantId, slaBreached: true, status: { notIn: ['CLOSED', 'REJECTED'] } },
      }),
      this.prisma.issueReport.groupBy({
        by: ['categoryId'],
        where: { tenantId, status: { notIn: ['CLOSED', 'REJECTED', 'DUPLICATE'] } },
        _count: true,
        orderBy: { _count: { categoryId: 'desc' } },
        take: 10,
      }),
      this.prisma.issueReport.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: true,
      }),
      this.prisma.issueReport.groupBy({
        by: ['urgency'],
        where: { tenantId, status: { notIn: ['CLOSED', 'REJECTED', 'DUPLICATE'] } },
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
