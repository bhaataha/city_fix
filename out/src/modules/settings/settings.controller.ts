import {
  Controller, Get, Patch, Body,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { TenantId } from '../../common/decorators';
import { Roles, RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Settings')
@Controller(':tenant/settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get tenant settings' })
  async getSettings(@TenantId() tenantId: string) {
    const settings = await this.settingsService.getSettings(tenantId);
    return { success: true, data: settings };
  }

  @Patch()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update tenant settings' })
  async updateSettings(
    @TenantId() tenantId: string,
    @Body() data: any,
  ) {
    const settings = await this.settingsService.updateSettings(tenantId, data);
    return { success: true, data: settings };
  }

  // ─── Public Transparency Endpoint ─────────────────
  @Get('transparency')
  @ApiOperation({ summary: 'Get public transparency stats' })
  async getTransparencyStats(@TenantId() tenantId: string) {
    const stats = await this.settingsService.getTransparencyStats(tenantId);
    return { success: true, data: stats };
  }
}
