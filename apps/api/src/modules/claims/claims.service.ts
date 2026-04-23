import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ClaimsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, filters: {
    status?: string;
    type?: string;
    search?: string;
    page?: number;
    perPage?: number;
  }) {
    const { status, type, search, page = 1, perPage = 20 } = filters;

    const where: any = { tenantId };

    if (status) where.status = status;
    if (type) where.claimType = type;
    if (search) {
      where.OR = [
        { eventDescription: { contains: search, mode: 'insensitive' } },
        { claimNumber: { contains: search, mode: 'insensitive' } },
        { eventAddress: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [claims, total] = await Promise.all([
      this.prisma.claimCase.findMany({
        where,
        include: {
          claimant: { select: { id: true, firstName: true, lastName: true, email: true } },
          handler: { select: { id: true, firstName: true, lastName: true } },
          relatedIssue: { select: { id: true, reportNumber: true, categoryId: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.claimCase.count({ where }),
    ]);

    return {
      claims,
      meta: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  async findOne(tenantId: string, id: string) {
    const claim = await this.prisma.claimCase.findFirst({
      where: { id, tenantId },
      include: {
        claimant: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        handler: { select: { id: true, firstName: true, lastName: true } },
        relatedIssue: { select: { id: true, reportNumber: true, categoryId: true, status: true } },
        documents: true,
        decisions: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!claim) throw new NotFoundException('Claim not found');
    return claim;
  }

  async create(tenantId: string, data: {
    claimantId: string;
    relatedIssueId?: string;
    claimType: string;
    eventDescription: string;
    eventDate: Date;
    eventAddress?: string;
    latitude?: number;
    longitude?: number;
    vehiclePlate?: string;
    policyNumber?: string;
    claimedAmount?: number;
  }) {
    // Generate claim number
    const count = await this.prisma.claimCase.count({ where: { tenantId } });
    const claimNumber = `CL-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    return this.prisma.claimCase.create({
      data: {
        tenantId,
        claimNumber,
        claimantId: data.claimantId,
        relatedIssueId: data.relatedIssueId,
        claimType: data.claimType as any,
        eventDescription: data.eventDescription,
        eventDate: data.eventDate,
        eventAddress: data.eventAddress,
        latitude: data.latitude,
        longitude: data.longitude,
        vehiclePlate: data.vehiclePlate,
        policyNumber: data.policyNumber,
        claimedAmount: data.claimedAmount,
        status: 'NEW',
      },
      include: {
        claimant: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async updateStatus(tenantId: string, id: string, status: string, userId: string, notes?: string) {
    const claim = await this.prisma.claimCase.findFirst({ where: { id, tenantId } });
    if (!claim) throw new NotFoundException('Claim not found');

    // Update the claim status
    const updated = await this.prisma.claimCase.update({
      where: { id },
      data: {
        status: status as any,
        ...(status === 'UNDER_REVIEW' && !claim.handlerId ? { handlerId: userId } : {}),
      },
    });

    // If it's a decision status, create a ClaimDecision record
    if (['APPROVED', 'REJECTED', 'PARTIALLY_APPROVED'].includes(status)) {
      await this.prisma.claimDecision.create({
        data: {
          claimId: id,
          decision: status,
          reasoning: notes,
          decidedById: userId,
        },
      });
    }

    return updated;
  }

  async getStats(tenantId: string) {
    const [total, byStatus, byType] = await Promise.all([
      this.prisma.claimCase.count({ where: { tenantId } }),
      this.prisma.claimCase.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: true,
      }),
      this.prisma.claimCase.groupBy({
        by: ['claimType'],
        where: { tenantId },
        _count: true,
      }),
    ]);

    const statusMap: Record<string, number> = {};
    byStatus.forEach((s) => { statusMap[s.status] = s._count; });

    const typeMap: Record<string, number> = {};
    byType.forEach((t) => { typeMap[t.claimType] = t._count; });

    return {
      total,
      byStatus: statusMap,
      byType: typeMap,
      new: statusMap['NEW'] || 0,
      underReview: statusMap['UNDER_REVIEW'] || 0,
      approved: statusMap['APPROVED'] || 0,
      rejected: statusMap['REJECTED'] || 0,
      closed: statusMap['CLOSED'] || 0,
    };
  }
}
