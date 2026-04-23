import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TenantId } from '../../common/decorators';

@ApiTags('Categories')
@Controller(':tenant/categories')
export class CategoriesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'List issue categories for this municipality' })
  async findAll(@TenantId() tenantId: string) {
    const categories = await this.prisma.serviceCategory.findMany({
      where: { tenantId, isActive: true, parentId: null },
      include: { children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' },
    });
    return { success: true, data: categories };
  }
}
