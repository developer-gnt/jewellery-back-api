import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { UserDevice } from './entities/user-device.entity.js';
import { Notification } from './entities/notification.entity.js';
import { NotificationPreference } from '../users/entities/notification-preference.entity.js';
import { FcmService } from './services/fcm.service.js';
import { RegisterDeviceDto } from './dto/register-device.dto.js';
import { SendNotificationDto } from './dto/send-notification.dto.js';
import { paginate } from '../../common/dto/pagination.dto.js';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(UserDevice)
    private readonly deviceRepository: Repository<UserDevice>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationPreference)
    private readonly prefRepository: Repository<NotificationPreference>,
    private readonly fcmService: FcmService,
  ) {}

  async registerDevice(userId: string, dto: RegisterDeviceDto) {
    let device = await this.deviceRepository.findOne({
      where: { fcmToken: dto.fcmToken },
    });

    if (device) {
      device.userId = userId;
      device.platform = dto.platform ?? device.platform;
      device.lastActiveAt = new Date();
    } else {
      device = this.deviceRepository.create({
        userId,
        fcmToken: dto.fcmToken,
        platform: dto.platform ?? 'android',
        lastActiveAt: new Date(),
      });
    }

    const saved = await this.deviceRepository.save(device);

    return {
      message: 'Device registered successfully',
      deviceId: saved.id,
      platform: saved.platform,
    };
  }

  async removeDevice(userId: string, deviceId: string) {
    const device = await this.deviceRepository.findOne({
      where: { id: deviceId, userId },
    });

    if (!device) {
      throw new NotFoundException(`Device with ID "${deviceId}" not found`);
    }

    await this.deviceRepository.remove(device);

    return { message: 'Device removed successfully' };
  }

  async getMyNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.notificationRepository
      .createQueryBuilder('n')
      .where('n.userId = :userId OR n.userId IS NULL', { userId })
      .orderBy('n.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const unreadCount = await this.notificationRepository
      .createQueryBuilder('n')
      .where('(n.userId = :userId OR n.userId IS NULL)', { userId })
      .andWhere('n.isRead = false')
      .getCount();

    const paginated = paginate(data, total, page, limit);

    return {
      ...paginated,
      unreadCount,
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    if (notificationId === 'all') {
      await this.notificationRepository
        .createQueryBuilder()
        .update(Notification)
        .set({ isRead: true, readAt: new Date() })
        .where('(userId = :userId OR userId IS NULL)', { userId })
        .andWhere('isRead = false')
        .execute();

      return { message: 'All notifications marked as read' };
    }

    const notification = await this.notificationRepository.findOne({
      where: [
        { id: notificationId, userId },
        { id: notificationId, userId: IsNull() },
      ],
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID "${notificationId}" not found`);
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await this.notificationRepository.save(notification);

    return {
      message: 'Notification marked as read',
      id: notification.id,
      readAt: notification.readAt,
    };
  }

  async sendNotification(dto: SendNotificationDto) {
    if (!dto.targetAll && (!dto.userIds || dto.userIds.length === 0)) {
      throw new BadRequestException(
        'Must specify targetAll: true or provide userIds array',
      );
    }

    const notifType = dto.type ?? 'general';
    let disabledUserIds = new Set<string>();

    if (['offers', 'rates', 'enquiries', 'general'].includes(notifType)) {
      try {
        const disabled = await this.prefRepository.find({
          where: { [notifType]: false },
          select: { userId: true },
        });
        disabledUserIds = new Set(disabled.map((p) => p.userId));
      } catch {
        // Fallback gracefully if preference check cannot be completed
      }
    }

    let devices: UserDevice[] = [];

    if (dto.targetAll) {
      devices = await this.deviceRepository.find();
    } else if (dto.userIds && dto.userIds.length > 0) {
      devices = await this.deviceRepository.find({
        where: { userId: In(dto.userIds) },
      });
    }

    // Filter out devices for users who turned off this notification type
    if (disabledUserIds.size > 0) {
      devices = devices.filter(
        (d) => !d.userId || !disabledUserIds.has(d.userId),
      );
    }

    const tokens = devices.map((d) => d.fcmToken);

    // Dispatch push via FCM
    const dispatchResult = await this.fcmService.sendPushNotification(
      tokens,
      dto.title,
      dto.body,
      dto.data,
    );

    // Create in-app notification records
    if (dto.targetAll) {
      const broadcastNotif = this.notificationRepository.create({
        userId: null,
        title: dto.title,
        body: dto.body,
        data: dto.data ?? null,
        type: notifType,
      });
      await this.notificationRepository.save(broadcastNotif);
    } else if (dto.userIds) {
      const eligibleUserIds = dto.userIds.filter(
        (uid) => !disabledUserIds.has(uid),
      );
      if (eligibleUserIds.length > 0) {
        const records = eligibleUserIds.map((uid) =>
          this.notificationRepository.create({
            userId: uid,
            title: dto.title,
            body: dto.body,
            data: dto.data ?? null,
            type: notifType,
          }),
        );
        await this.notificationRepository.save(records);
      }
    }

    return {
      message: 'Push notification dispatched',
      targetDevices: tokens.length,
      type: notifType,
      ...dispatchResult,
    };
  }

  async sendToUser(
    userId: string,
    type: 'offers' | 'rates' | 'enquiries' | 'general',
    title: string,
    body: string,
    data?: Record<string, any>,
  ) {
    try {
      const pref = await this.prefRepository.findOne({ where: { userId } });
      if (pref && pref[type] === false) {
        return {
          delivered: false,
          reason: `User has disabled ${type} notifications`,
        };
      }
    } catch {
      // Continue if preference check fails
    }

    const devices = await this.deviceRepository.find({ where: { userId } });
    const tokens = devices.map((d) => d.fcmToken);

    if (tokens.length > 0) {
      await this.fcmService.sendPushNotification(tokens, title, body, data);
    }

    const notification = this.notificationRepository.create({
      userId,
      title,
      body,
      type,
      data: data ?? null,
    });
    const saved = await this.notificationRepository.save(notification);

    return {
      delivered: true,
      deviceCount: tokens.length,
      notificationId: saved.id,
    };
  }

  async broadcast(
    type: 'offers' | 'rates' | 'enquiries' | 'general',
    title: string,
    body: string,
    data?: Record<string, any>,
  ) {
    return this.sendNotification({
      title,
      body,
      targetAll: true,
      type,
      data,
    });
  }

  async getAdminNotificationHistory(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.notificationRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
      relations: { user: true },
    });

    return paginate(data, total, page, limit);
  }
}
