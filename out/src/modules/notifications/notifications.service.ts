import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

/** Event types for internal categorization (stored in `data` JSON field) */
export enum NotificationEvent {
  ISSUE_CREATED = 'ISSUE_CREATED',
  ISSUE_STATUS_CHANGED = 'ISSUE_STATUS_CHANGED',
  ISSUE_ASSIGNED = 'ISSUE_ASSIGNED',
  CLAIM_CREATED = 'CLAIM_CREATED',
  CLAIM_STATUS_CHANGED = 'CLAIM_STATUS_CHANGED',
  SLA_WARNING = 'SLA_WARNING',
  SLA_BREACH = 'SLA_BREACH',
  SYSTEM = 'SYSTEM',
}

interface CreateNotificationDto {
  tenantId: string;
  userId: string;
  title: string;
  body: string;
  event?: NotificationEvent;
  data?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateNotificationDto) {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          tenantId: dto.tenantId,
          userId: dto.userId,
          type: 'IN_APP',
          title: dto.title,
          body: dto.body,
          data: dto.data
            ? JSON.parse(JSON.stringify({ ...dto.data, event: dto.event }))
            : dto.event ? { event: dto.event } : undefined,
        },
      });
      this.logger.log(`Notification created: ${notification.id} → user ${dto.userId}`);
      return notification;
    } catch (error) {
      this.logger.error(`Failed to create notification: ${error}`);
      throw error;
    }
  }

  async findAllForUser(tenantId: string, userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { tenantId, userId },
        orderBy: { sentAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where: { tenantId, userId } }),
    ]);

    const unreadCount = await this.prisma.notification.count({
      where: { tenantId, userId, isRead: false },
    });

    return {
      data,
      meta: { total, page, limit, unreadCount },
    };
  }

  async markAsRead(tenantId: string, userId: string, notificationId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, tenantId, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(tenantId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { tenantId, userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async notifyAdmins(
    tenantId: string,
    event: NotificationEvent,
    title: string,
    body: string,
    data?: Record<string, any>,
  ) {
    const admins = await this.prisma.user.findMany({
      where: { tenantId, role: { in: ['ADMIN', 'DEPT_MANAGER'] }, isActive: true },
      select: { id: true },
    });

    const notifications = admins.map((admin: { id: string }) =>
      this.create({ tenantId, userId: admin.id, title, body, event, data }),
    );

    return Promise.allSettled(notifications);
  }

  async onIssueCreated(tenantId: string, issue: any) {
    const categoryName = issue.category?.name || 'כללי';
    await this.notifyAdmins(
      tenantId,
      NotificationEvent.ISSUE_CREATED,
      'פנייה חדשה התקבלה',
      `${categoryName} — ${issue.address || 'ללא כתובת'}`,
      { issueId: issue.id, reportNumber: issue.reportNumber },
    );
  }

  async onIssueStatusChanged(tenantId: string, issue: any, oldStatus: string, newStatus: string) {
    if (issue.userId) {
      await this.create({
        tenantId,
        userId: issue.userId,
        event: NotificationEvent.ISSUE_STATUS_CHANGED,
        title: 'עדכון סטטוס פנייה',
        body: `פנייה ${issue.reportNumber || ''} עודכנה ל: ${newStatus}`,
        data: { issueId: issue.id, oldStatus, newStatus },
      });
    }
  }

  async onClaimCreated(tenantId: string, claim: any) {
    await this.notifyAdmins(
      tenantId,
      NotificationEvent.CLAIM_CREATED,
      'תביעה חדשה התקבלה',
      `${claim.title || 'תביעה חדשה'} — ₪${claim.amount?.toLocaleString() || '0'}`,
      { claimId: claim.id },
    );
  }
}
