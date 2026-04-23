import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IssuesService } from '../issues/issues.service';
import { TenantId, CurrentUser } from '../../common/decorators';
import { Roles, RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Dashboard')
@Controller(':tenant/dashboard')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN', 'DEPT_MANAGER', 'CALL_CENTER')
@ApiBearerAuth()
export class DashboardController {
  constructor(private issuesService: IssuesService) {}

  @Get()
  @ApiOperation({ summary: 'Get dashboard KPIs and statistics' })
  async getStats(@TenantId() tenantId: string, @CurrentUser() user: any) {
    const stats = await this.issuesService.getDashboardStats(tenantId, user);
    return { success: true, data: stats };
  }
}
