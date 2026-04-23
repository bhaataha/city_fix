import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Resolves tenant from URL path parameter /:tenant/...
 * Attaches tenantId to the request object.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const headerTenant = req.headers['x-tenant-id'];
    const rawSlug = req.params.tenant || (Array.isArray(headerTenant) ? headerTenant[0] : headerTenant);
    const tenantSlug: string | undefined = typeof rawSlug === 'string' ? rawSlug : undefined;

    if (!tenantSlug) {
      // No tenant context — allow public routes
      return next();
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      select: { id: true, slug: true, isActive: true },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant "${tenantSlug}" not found`);
    }

    if (!tenant.isActive) {
      throw new NotFoundException(`Tenant "${tenantSlug}" is not active`);
    }

    (req as any).tenantId = tenant.id;
    (req as any).tenantSlug = tenant.slug;

    next();
  }
}
