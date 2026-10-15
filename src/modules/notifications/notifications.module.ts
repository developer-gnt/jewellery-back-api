import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller.js';
import { NotificationsService } from './notifications.service.js';
import { FcmService } from './services/fcm.service.js';
import { UserDevice } from './entities/user-device.entity.js';
import { Notification } from './entities/notification.entity.js';
import { NotificationPreference } from '../users/entities/notification-preference.entity.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { AdminGuard } from '../../common/guards/admin.guard.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserDevice,
      Notification,
      NotificationPreference,
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, FcmService, JwtAuthGuard, AdminGuard],
  exports: [NotificationsService, FcmService],
})
export class NotificationsModule {}
