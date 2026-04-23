import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, filters?: { role?: string; departmentId?: string }) {
    return this.prisma.user.findMany({
      where: {
        tenantId,
        ...(filters?.role && { role: filters.role as any }),
        ...(filters?.departmentId && { departmentId: filters.departmentId }),
      },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, phone: true, isActive: true, lastLoginAt: true,
        department: { select: { id: true, name: true } },
      },
      orderBy: { firstName: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.user.findFirst({
      where: { id, tenantId },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, phone: true, isActive: true, avatarUrl: true,
        lastLoginAt: true, preferredLang: true, addresses: true, vehicles: true,
        department: { select: { id: true, name: true } },
        _count: { select: { reportedIssues: true, assignedIssues: true } },
      },
    });
  }

  async getMyProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, phone: true, avatarUrl: true, preferredLang: true,
        addresses: true, vehicles: true, tenantId: true,
        tenant: { select: { id: true, name: true, slug: true, logo: true, primaryColor: true } },
        _count: { select: { reportedIssues: true, claimsFiled: true } },
      },
    });
  }

  async updateMyProfile(userId: string, data: any) {
    // Only allow updating safe fields
    const safeData = {
      ...(data.firstName && { firstName: data.firstName }),
      ...(data.lastName && { lastName: data.lastName }),
      ...(data.phone && { phone: data.phone }),
      ...(data.avatarUrl && { avatarUrl: data.avatarUrl }),
      ...(data.preferredLang && { preferredLang: data.preferredLang }),
      ...(data.addresses !== undefined && { addresses: data.addresses }),
      ...(data.vehicles !== undefined && { vehicles: data.vehicles }),
    };

    return this.prisma.user.update({
      where: { id: userId },
      data: safeData,
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, phone: true, avatarUrl: true, preferredLang: true,
        addresses: true, vehicles: true,
      },
    });
  }
}
