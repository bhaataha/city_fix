import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { Roles, RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Get()
  @ApiOperation({ summary: 'List all active tenants (municipalities)' })
  async findAll() {
    const tenants = await this.tenantsService.findAll();
    return { success: true, data: tenants };
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get tenant by slug' })
  async findBySlug(@Param('slug') slug: string) {
    const tenant = await this.tenantsService.findBySlug(slug);
    return { success: true, data: tenant };
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new tenant (Super Admin only)' })
  async create(@Body() body: { name: string; slug: string; contactEmail?: string; contactPhone?: string }) {
    const tenant = await this.tenantsService.create(body);
    return { success: true, data: tenant };
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update tenant settings' })
  async update(@Param('id') id: string, @Body() body: any) {
    const tenant = await this.tenantsService.update(id, body);
    return { success: true, data: tenant };
  }

  @Post('onboard')
  @ApiOperation({ summary: 'Self-service municipality onboarding' })
  async onboard(@Body() body: {
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
    const result = await this.tenantsService.onboard(body);
    return { success: true, data: result };
  }
}
