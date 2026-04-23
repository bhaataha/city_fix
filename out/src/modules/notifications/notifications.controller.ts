import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

@Controller(':tenant/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.notificationsService.findAllForUser(
      req.tenantId,
      req.user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
    return { success: true, ...result };
  }

  @Patch(':id/read')
  @UseGuards(AuthGuard('jwt'))
  async markAsRead(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    await this.notificationsService.markAsRead(req.tenantId, req.user.id, id);
    return { success: true };
  }

  @Patch('read-all')
  @UseGuards(AuthGuard('jwt'))
  async markAllAsRead(@Request() req: any) {
    await this.notificationsService.markAllAsRead(req.tenantId, req.user.id);
    return { success: true };
  }
}
