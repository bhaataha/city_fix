import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { AdoptionService } from './adoption.service';
import { CurrentUser } from '../../common/decorators';
import { Roles, RolesGuard } from '../../common/guards/roles.guard';

class AdoptDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  issueIds?: string[];
}

@ApiTags('Adoption')
@Controller('admin/adoption')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class AdoptionController {
  constructor(private adoptionService: AdoptionService) {}

  /**
   * Preview every PUBLIC orphan that falls inside the current admin's tenant
   * boundary. The admin sees them on the "Claim your city" screen and can
   * accept all or pick a subset.
   */
  @Get('orphans')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'List adoptable orphan reports in your tenant boundary' })
  async preview(@CurrentUser() user: any) {
    return {
      success: true,
      data: await this.adoptionService.previewAdoptableIssues(user.tenantId),
    };
  }

  /** Same preview but explicit by tenant id (super-admin tooling). */
  @Get('orphans/:tenantId')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Preview orphans for any tenant (super admin)' })
  async previewByTenant(@Param('tenantId') tenantId: string) {
    return {
      success: true,
      data: await this.adoptionService.previewAdoptableIssues(tenantId),
    };
  }

  /**
   * Trigger adoption. With `issueIds` we adopt only that subset.
   * Without it, we adopt every matching orphan in the geographic area.
   */
  @Post('adopt')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Adopt orphan reports in your tenant boundary' })
  async adopt(@CurrentUser() user: any, @Body() dto: AdoptDto) {
    const result = await this.adoptionService.adoptOrphans(user.tenantId, user.id, dto.issueIds);
    return { success: true, data: result };
  }
}
