import { Controller, Get, Param, Query, UseGuards, Patch, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser, TenantId } from '../../common/decorators';
import { Roles, RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Users')
@Controller(':tenant/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'DEPT_MANAGER', 'CALL_CENTER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List tenant users (staff only)' })
  async findAll(
    @TenantId() tenantId: string,
    @Query('role') role?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    const users = await this.usersService.findAll(tenantId, { role, departmentId });
    return { success: true, data: users };
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: any) {
    const profile = await this.usersService.getMyProfile(user.id);
    return { success: true, data: profile };
  }

  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(@CurrentUser() user: any, @Body() body: any) {
    const profile = await this.usersService.updateMyProfile(user.id, body);
    return { success: true, data: profile };
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'DEPT_MANAGER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user details' })
  async findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    const user = await this.usersService.findOne(tenantId, id);
    return { success: true, data: user };
  }
}
