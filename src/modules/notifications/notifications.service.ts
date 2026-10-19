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

  private isValidUUID(id?: string): boolean {
    return typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  }

  async getMyNotifications(userId?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const qb = this.notificationRepository
      .createQueryBuilder('n');

    if (this.isValidUUID(userId)) {
      qb.where(
        '(n.userId = :userId OR (n.userId IS NULL AND (n.data->>\'targetRole\' IS NULL OR n.data->>\'targetRole\' != \'admin\')))',
        { userId },
      );
    } else {
      qb.where(
        'n.userId IS NULL AND (n.data->>\'targetRole\' IS NULL OR n.data->>\'targetRole\' != \'admin\')',
      );
    }

    const [data, total] = await qb
      .orderBy('n.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const countQb = this.notificationRepository
      .createQueryBuilder('n');

    if (this.isValidUUID(userId)) {
      countQb.where(
        '(n.userId = :userId OR (n.userId IS NULL AND (n.data->>\'targetRole\' IS NULL OR n.data->>\'targetRole\' != \'admin\')))',
        { userId },
      );
    } else {
      countQb.where(
        'n.userId IS NULL AND (n.data->>\'targetRole\' IS NULL OR n.data->>\'targetRole\' != \'admin\')',
      );
    }

    const unreadCount = await countQb
      .andWhere('n.isRead = false')
      .getCount();

    const paginated = paginate(data, total, page, limit);

    return {
      ...paginated,
      items: data,
      unreadCount,
    };
  }

  async markAsRead(userId: string | undefined, notificationId: string) {
    if (notificationId === 'all') {
      const qb = this.notificationRepository
        .createQueryBuilder()
        .update(Notification)
        .set({ isRead: true, readAt: new Date() })
        .where('isRead = false');

      if (this.isValidUUID(userId)) {
        qb.andWhere('(userId = :userId OR userId IS NULL)', { userId });
      } else {
        qb.andWhere('userId IS NULL');
      }

      await qb.execute();
      return { message: 'All notifications marked as read' };
    }

    const whereConditions: any[] = [{ id: notificationId, userId: IsNull() }];
    if (this.isValidUUID(userId)) {
      whereConditions.push({ id: notificationId, userId });
    }

    const notification = await this.notificationRepository.findOne({
      where: whereConditions,
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

  async notifyAdminEnquiry(enquiry: {
    id: string;
    referenceNumber: string;
    name: string;
    mobile: string;
    message?: string;
    productId?: string;
  }) {
    try {
      const adminNotif = this.notificationRepository.create({
        userId: null,
        title: `New Customer Enquiry: ${enquiry.name}`,
        body: `Customer ${enquiry.name} (+91 ${enquiry.mobile}) submitted enquiry ${enquiry.referenceNumber}.`,
        type: 'enquiries',
        data: {
          enquiryId: enquiry.id,
          referenceNumber: enquiry.referenceNumber,
          customerName: enquiry.name,
          mobile: enquiry.mobile,
          productId: enquiry.productId,
          targetRole: 'admin',
        },
      });
      await this.notificationRepository.save(adminNotif);
    } catch {
      // Ensure notification failures do not disrupt enquiry creation
    }
  }

  async notifyNewCategory(category: { id: string; name: string; description?: string | null }) {
    try {
      const notif = this.notificationRepository.create({
        userId: null,
        title: `✨ New Collection: ${category.name}`,
        body: category.description?.trim() || `Explore our newly added ${category.name} collection featuring royal handcrafted jewellery designs.`,
        type: 'category',
        data: {
          categoryId: category.id,
          categoryName: category.name,
          source: 'admin',
          sourceLabel: 'Admin CMS',
        },
      });
      await this.notificationRepository.save(notif);
    } catch {}
  }

  async notifyNewProduct(
    product: { id: string; name: string; price?: number; categoryId?: string },
    categoryName?: string,
  ) {
    try {
      const priceStr = product.price ? ` (₹${Number(product.price).toLocaleString('en-IN')})` : '';
      const catStr = categoryName ? ` to ${categoryName}` : '';
      const notif = this.notificationRepository.create({
        userId: null,
        title: `💎 New Arrival: ${product.name}`,
        body: `Exquisite new jewellery added${catStr}: ${product.name}${priceStr}. Discover fine craftsmanship at Zewar Mahal.`,
        type: 'products',
        data: {
          productId: product.id,
          productName: product.name,
          categoryId: product.categoryId,
          price: product.price,
          source: 'admin',
          sourceLabel: 'Admin CMS',
        },
      });
      await this.notificationRepository.save(notif);
    } catch {}
  }

  async notifyEnquiryUpdate(enquiry: {
    id: string;
    referenceNumber: string;
    name: string;
    mobile: string;
    status: string;
    adminNotes?: string | null;
    userId?: string | null;
  }) {
    try {
      const statusTitle = enquiry.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const bodyText = enquiry.adminNotes?.trim()
        ? `Message from Zewar Mahal Concierge regarding Enquiry ${enquiry.referenceNumber}:\n"${enquiry.adminNotes.trim()}"`
        : `Your enquiry ${enquiry.referenceNumber} status has been updated to "${statusTitle}". Our boutique team is attending to your request.`;

      const notif = this.notificationRepository.create({
        userId: this.isValidUUID(enquiry.userId || undefined) ? enquiry.userId : null,
        title: `💬 Enquiry Update (${statusTitle}): ${enquiry.referenceNumber}`,
        body: bodyText,
        type: 'enquiries',
        data: {
          enquiryId: enquiry.id,
          referenceNumber: enquiry.referenceNumber,
          customerName: enquiry.name,
          mobile: enquiry.mobile,
          status: enquiry.status,
          adminNotes: enquiry.adminNotes,
          source: 'admin',
          sourceLabel: 'Admin Concierge',
        },
      });
      await this.notificationRepository.save(notif);
    } catch {}
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
