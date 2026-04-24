import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ClaimsService } from './claims.service';
import { CurrentUser, TenantId } from '../../common/decorators';
import { Roles, RolesGuard } from '../../common/guards/roles.guard';

class CreateClaimDto {
  @IsString()
  claimType: string;

  @IsString()
  eventDescription: string;

  @IsDateString()
  eventDate: string;

  @IsOptional()
  @IsString()
  relatedIssueId?: string;

  @IsOptional()
  @IsString()
  eventAddress?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  vehiclePlate?: string;

  @IsOptional()
  @IsString()
  policyNumber?: string;

  @IsOptional()
  @IsNumber()
  claimedAmount?: number;

  @IsOptional()
  documents?: {
    fileUrl: string;
    fileName: string;
    fileSize?: number;
    mimeType?: string;
  }[];
}

class UpdateClaimStatusDto {
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

@ApiTags('Claims')
@Controller(':tenant/claims')
export class ClaimsController {
  constructor(private claimsService: ClaimsService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List claims' })
  async findAll(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    const claimantId = user.role === 'RESIDENT' ? user.id : undefined;

    const result = await this.claimsService.findAll(tenantId, {
      status, type, search, claimantId, page, perPage,
    });
    return { success: true, data: result.claims, meta: result.meta };
  }

  @Get('stats')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'DEPT_MANAGER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get claims statistics' })
  async getStats(@TenantId() tenantId: string) {
    const stats = await this.claimsService.getStats(tenantId);
    return { success: true, data: stats };
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get claim details' })
  async findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    const claim = await this.claimsService.findOne(tenantId, id);
    return { success: true, data: claim };
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new claim' })
  async create(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateClaimDto,
  ) {
    const result = await this.claimsService.create(tenantId, {
      ...dto,
      eventDate: new Date(dto.eventDate),
      claimantId: user.id,
    });
    return { success: true, data: result };
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'DEPT_MANAGER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update claim status' })
  async updateStatus(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateClaimStatusDto,
  ) {
    const claim = await this.claimsService.updateStatus(
      tenantId, id, dto.status, user.id, dto.notes,
    );
    return { success: true, data: claim };
  }
}
