import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { DEFAULT_CATEGORIES } from '@cityfix/shared';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tenant.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        primaryColor: true,
        population: true,
        _count: { select: { issues: true, users: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      include: {
        _count: { select: { issues: true, users: true, departments: true } },
      },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async create(data: {
    name: string;
    slug: string;
    contactEmail?: string;
    contactPhone?: string;
    primaryColor?: string;
    population?: number;
  }) {
    const existing = await this.prisma.tenant.findUnique({ where: { slug: data.slug } });
    if (existing) throw new ConflictException('Slug already taken');

    // Create tenant with default categories
    const tenant = await this.prisma.tenant.create({ data });

    // Seed default categories
    await this.prisma.serviceCategory.createMany({
      data: DEFAULT_CATEGORIES.map((cat, i) => ({
        tenantId: tenant.id,
        name: cat.name,
        nameEn: cat.nameEn,
        nameAr: cat.nameAr,
        icon: cat.icon,
        color: cat.color,
        sortOrder: i,
      })),
    });

    return tenant;
  }

  async update(id: string, data: Partial<{
    name: string;
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    contactEmail: string;
    contactPhone: string;
    slaConfig: any;
    settings: any;
  }>) {
    return this.prisma.tenant.update({ where: { id }, data });
  }

  /**
   * Self-service onboarding: creates tenant + admin + defaults in one tx.
   */
  async onboard(data: {
    municipalityName: string;
    slug: string;
    contactEmail: string;
    contactPhone?: string;
    primaryColor?: string;
    adminFirstName: string;
    adminLastName: string;
    adminEmail: string;
    adminPassword: string;
  }) {
    const existing = await this.prisma.tenant.findUnique({ where: { slug: data.slug } });
    if (existing) throw new ConflictException('Slug already taken');

    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash(data.adminPassword, 12);

    return this.prisma.$transaction(async (tx) => {
      // 1. Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: data.municipalityName,
          slug: data.slug,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          primaryColor: data.primaryColor || '#2563EB',
        },
      });

      // 2. Create default departments
      const defaultDepts = [
        { name: 'מחלקת תשתיות', icon: 'building', color: '#6366F1' },
        { name: 'מחלקת חשמל ותאורה', icon: 'zap', color: '#F59E0B' },
        { name: 'מחלקת תברואה', icon: 'trash', color: '#10B981' },
        { name: 'מחלקת גנים ונוף', icon: 'trees', color: '#22C55E' },
        { name: 'מחלקת תנועה', icon: 'traffic-cone', color: '#EF4444' },
      ];

      const depts = await Promise.all(
        defaultDepts.map((d) =>
          tx.department.create({ data: { tenantId: tenant.id, ...d } }),
        ),
      );

      // 3. Create default categories
      await tx.serviceCategory.createMany({
        data: DEFAULT_CATEGORIES.map((cat, i) => ({
          tenantId: tenant.id,
          name: cat.name,
          nameEn: cat.nameEn,
          nameAr: cat.nameAr,
          icon: cat.icon,
          color: cat.color,
          sortOrder: i,
          departmentId: depts[Math.min(i % depts.length, depts.length - 1)].id,
        })),
      });

      // 4. Create admin user
      const admin = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: data.adminEmail,
          firstName: data.adminFirstName,
          lastName: data.adminLastName,
          passwordHash,
          role: 'ADMIN',
        },
        select: { id: true, email: true, firstName: true, lastName: true, role: true },
      });

      return { tenant, admin, departmentsCreated: depts.length };
    });
  }
}
