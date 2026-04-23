import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { IssuesService } from './issues.service';
import { CurrentUser, TenantId } from '../../common/decorators';
import { Roles, RolesGuard } from '../../common/guards/roles.guard';

class CreateIssueDto {
  @IsString()
  categoryId: string;

  @IsOptional()
  @IsString()
  subcategory?: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsString()
  urgency?: string;

  @IsOptional()
  @IsBoolean()
  isImmediateDanger?: boolean;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}

class UpdateStatusDto {
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

class AddCommentDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;
}

@ApiTags('Issues')
@Controller(':tenant/issues')
export class IssuesController {
  constructor(private issuesService: IssuesService) {}

  // ─── Public Endpoints (No Auth Required) ──────────────

  @Get()
  @ApiOperation({ summary: 'List issues (public map view)' })
  async findAll(
    @TenantId() tenantId: string,
    @Query('status') status?: string,
    @Query('categoryId') categoryId?: string,
    @Query('urgency') urgency?: string,
    @Query('departmentId') departmentId?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const result = await this.issuesService.findAll(tenantId, {
      status, categoryId, urgency, departmentId, search,
      page, perPage, sortBy, sortOrder,
    });
    return { success: true, data: result.issues, meta: result.meta };
  }

  @Get('map')
  @ApiOperation({ summary: 'Get issues for map view' })
  async getMapIssues(
    @TenantId() tenantId: string,
    @Query('north') north?: number,
    @Query('south') south?: number,
    @Query('east') east?: number,
    @Query('west') west?: number,
  ) {
    const bounds = north && south && east && west
      ? { north, south, east, west }
      : undefined;
    const issues = await this.issuesService.getMapIssues(tenantId, bounds);
    return { success: true, data: issues };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getStats(@TenantId() tenantId: string) {
    const stats = await this.issuesService.getDashboardStats(tenantId);
    return { success: true, data: stats };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get issue details' })
  async findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    const issue = await this.issuesService.findOne(tenantId, id);
    return { success: true, data: issue };
  }

  // ─── Authenticated Endpoints ──────────────────────────

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new issue report' })
  async create(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateIssueDto,
  ) {
    const result = await this.issuesService.create(tenantId, {
      ...dto,
      reporterId: user.id,
    });
    return { success: true, data: result };
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'DEPT_MANAGER', 'CALL_CENTER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update issue status' })
  async updateStatus(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateStatusDto,
  ) {
    const issue = await this.issuesService.updateStatus(tenantId, id, dto.status, user.id, dto.reason);
    return { success: true, data: issue };
  }

  @Patch(':id/assign')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'DEPT_MANAGER', 'CALL_CENTER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign issue to user' })
  async assign(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body('userId') userId: string,
  ) {
    const issue = await this.issuesService.assignToUser(tenantId, id, userId);
    return { success: true, data: issue };
  }

  @Post(':id/comments')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add comment to issue' })
  async addComment(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: AddCommentDto,
  ) {
    const comment = await this.issuesService.addComment(
      tenantId, id, user.id, dto.content, dto.isInternal,
    );
    return { success: true, data: comment };
  }
}
