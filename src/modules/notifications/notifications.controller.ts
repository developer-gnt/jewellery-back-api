import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service.js';
import { RegisterDeviceDto } from './dto/register-device.dto.js';
import { SendNotificationDto } from './dto/send-notification.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { AdminGuard } from '../../common/guards/admin.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Public } from '../../common/decorators/roles.decorator.js';

@ApiTags('notifications')
@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // ---------------------------------------------------------------------------
  // Customer Device & Notification Endpoints
  // ---------------------------------------------------------------------------

  @Post('notifications/devices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Register customer device FCM token for push notifications' })
  @ApiResponse({ status: 201, description: 'Device registered successfully' })
  registerDevice(
    @CurrentUser('sub') userId: string,
    @Body() dto: RegisterDeviceDto,
  ) {
    return this.notificationsService.registerDevice(userId, dto);
  }

  @Delete('notifications/devices/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unregister device token on logout or app uninstall' })
  @ApiResponse({ status: 200, description: 'Device removed successfully' })
  removeDevice(
    @CurrentUser('sub') userId: string,
    @Param('id') deviceId: string,
  ) {
    return this.notificationsService.removeDevice(userId, deviceId);
  }

  @Get('notifications')
  @Public()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Retrieve notifications for customer (authenticated or guest)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of in-app notifications with unread count' })
  getMyNotifications(
    @CurrentUser('sub') userId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.notificationsService.getMyNotifications(userId, page, limit);
  }

  @Patch('notifications/:id/read')
  @Public()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Mark specific notification (or "all") as read' })
  @ApiResponse({ status: 200, description: 'Notification(s) marked read' })
  markAsRead(
    @CurrentUser('sub') userId: string | undefined,
    @Param('id') notificationId: string,
  ) {
    return this.notificationsService.markAsRead(userId, notificationId);
  }

  // ---------------------------------------------------------------------------
  // Admin CMS Endpoints
  // ---------------------------------------------------------------------------

  @Post('admin/notifications/send')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Dispatch broadcast or targeted push notification (Admin)' })
  @ApiResponse({ status: 200, description: 'Push notification dispatched' })
  sendNotification(@Body() dto: SendNotificationDto) {
    return this.notificationsService.sendNotification(dto);
  }

  @Get('admin/notifications')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Retrieve push notification dispatch history (Admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Notification dispatch history' })
  getAdminNotificationHistory(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.notificationsService.getAdminNotificationHistory(page, limit);
  }
}
