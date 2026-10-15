import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import { NotificationPreference } from './entities/notification-preference.entity.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { UpdateNotificationPreferencesDto } from './dto/update-preferences.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(NotificationPreference)
    private readonly prefRepository: Repository<NotificationPreference>,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId, isDeleted: false },
      relations: { notificationPreferences: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      mobile: user.mobile,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
      notificationPreferences: user.notificationPreferences
        ? {
            offers: user.notificationPreferences.offers,
            rates: user.notificationPreferences.rates,
            enquiries: user.notificationPreferences.enquiries,
            general: user.notificationPreferences.general,
          }
        : null,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId, isDeleted: false },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check email uniqueness if email is changed
    if (dto.email && dto.email !== user.email) {
      const existingEmail = await this.userRepository.findOne({
        where: { email: dto.email, isDeleted: false },
      });
      if (existingEmail && existingEmail.id !== userId) {
        throw new BadRequestException('Email address is already in use');
      }
      user.email = dto.email;
    }

    if (dto.name !== undefined) {
      user.name = dto.name;
    }

    if (dto.avatar !== undefined) {
      user.avatar = dto.avatar;
    }

    await this.userRepository.save(user);

    return {
      id: user.id,
      name: user.name,
      mobile: user.mobile,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      updatedAt: user.updatedAt,
    };
  }

  async deleteAccount(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId, isDeleted: false },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isDeleted = true;
    user.isActive = false;
    user.deletedAt = new Date();

    await this.userRepository.save(user);

    return {
      message: 'Account deleted successfully',
      deletedAt: user.deletedAt,
    };
  }

  async getNotificationPreferences(userId: string) {
    let prefs = await this.prefRepository.findOne({
      where: { userId },
    });

    if (!prefs) {
      prefs = this.prefRepository.create({
        userId,
        offers: true,
        rates: true,
        enquiries: true,
        general: true,
      });
      await this.prefRepository.save(prefs);
    }

    return {
      offers: prefs.offers,
      rates: prefs.rates,
      enquiries: prefs.enquiries,
      general: prefs.general,
    };
  }

  async updateNotificationPreferences(
    userId: string,
    dto: UpdateNotificationPreferencesDto,
  ) {
    let prefs = await this.prefRepository.findOne({
      where: { userId },
    });

    if (!prefs) {
      prefs = this.prefRepository.create({
        userId,
        offers: dto.offers ?? true,
        rates: dto.rates ?? true,
        enquiries: dto.enquiries ?? true,
        general: dto.general ?? true,
      });
    } else {
      if (dto.offers !== undefined) prefs.offers = dto.offers;
      if (dto.rates !== undefined) prefs.rates = dto.rates;
      if (dto.enquiries !== undefined) prefs.enquiries = dto.enquiries;
      if (dto.general !== undefined) prefs.general = dto.general;
    }

    await this.prefRepository.save(prefs);

    return {
      offers: prefs.offers,
      rates: prefs.rates,
      enquiries: prefs.enquiries,
      general: prefs.general,
      updatedAt: prefs.updatedAt,
    };
  }
}
