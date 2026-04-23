import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TenantId } from '../../common/decorators';
import { Roles, RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Departments')
@Controller(':tenant/departments')
export class DepartmentsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'List departments' })
  async findAll(@TenantId() tenantId: string) {
    const departments = await this.prisma.department.findMany({
      where: { tenantId, isActive: true },
      include: {
        manager: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { members: true, issues: true, categories: true } },
      },
      orderBy: { name: 'asc' },
    });
    return { success: true, data: departments };
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create department' })
  async create(
    @TenantId() tenantId: string,
    @Body() body: { name: string; description?: string; color?: string; icon?: string },
  ) {
    const dept = await this.prisma.department.create({
      data: { tenantId, ...body },
    });
    return { success: true, data: dept };
  }
}
