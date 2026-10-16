import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import { NotificationPreference } from './entities/notification-preference.entity.js';
import { UserAddress } from './entities/user-address.entity.js';
import { UserWishlist } from './entities/user-wishlist.entity.js';
import { Offer } from '../offers/entities/offer.entity.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { UpdateNotificationPreferencesDto } from './dto/update-preferences.dto.js';
import { CreateAddressDto } from './dto/create-address.dto.js';
import { AddWishlistDto } from './dto/add-wishlist.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(NotificationPreference)
    private readonly prefRepository: Repository<NotificationPreference>,
    @InjectRepository(UserAddress)
    private readonly addressRepository: Repository<UserAddress>,
    @InjectRepository(UserWishlist)
    private readonly wishlistRepository: Repository<UserWishlist>,
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
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
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      city: user.city,
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

    if (dto.dateOfBirth !== undefined) {
      user.dateOfBirth = dto.dateOfBirth;
    }

    if (dto.gender !== undefined) {
      user.gender = dto.gender;
    }

    if (dto.city !== undefined) {
      user.city = dto.city;
    }

    await this.userRepository.save(user);

    return {
      id: user.id,
      name: user.name,
      mobile: user.mobile,
      email: user.email,
      avatar: user.avatar,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      city: user.city,
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

  async getProfileStats(userId: string) {
    const [savedItemsCount, addressesCount, activeOffersCount] = await Promise.all([
      this.wishlistRepository.count({ where: { userId } }),
      this.addressRepository.count({ where: { userId } }),
      this.offerRepository.count({ where: { isActive: true } }),
    ]);

    return {
      savedItemsCount,
      activeOffersCount,
      addressesCount,
    };
  }

  async getAddresses(userId: string) {
    return this.addressRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async addAddress(userId: string, dto: CreateAddressDto) {
    const user = await this.userRepository.findOne({ where: { id: userId, isDeleted: false } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.isDefault) {
      await this.addressRepository.update({ userId }, { isDefault: false });
    }

    const address = this.addressRepository.create({
      ...dto,
      userId,
      recipient: dto.recipient || user.name || 'Sameer Shaikh',
      phone: dto.phone || user.mobile || '+91 98765 43210',
      state: dto.state || 'Maharashtra',
    });

    return this.addressRepository.save(address);
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.addressRepository.findOne({ where: { id: addressId, userId } });
    if (!address) throw new NotFoundException('Address not found');

    await this.addressRepository.remove(address);
    return { message: 'Address removed successfully' };
  }

  async setDefaultAddress(userId: string, addressId: string) {
    const target = await this.addressRepository.findOne({ where: { id: addressId, userId } });
    if (!target) throw new NotFoundException('Address not found');

    await this.addressRepository.update({ userId }, { isDefault: false });
    target.isDefault = true;
    return this.addressRepository.save(target);
  }

  async getWishlist(userId: string) {
    return this.wishlistRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async addToWishlist(userId: string, dto: AddWishlistDto) {
    const existing = await this.wishlistRepository.findOne({
      where: { userId, productId: dto.productId },
    });
    if (existing) {
      return existing;
    }

    const item = this.wishlistRepository.create({
      ...dto,
      userId,
    });
    return this.wishlistRepository.save(item);
  }

  async removeFromWishlist(userId: string, id: string) {
    let item = await this.wishlistRepository.findOne({ where: { id, userId } });
    if (!item) {
      item = await this.wishlistRepository.findOne({ where: { productId: id, userId } });
    }
    if (!item) {
      throw new NotFoundException('Wishlist item not found');
    }

    await this.wishlistRepository.remove(item);
    return { message: 'Item removed from wishlist successfully' };
  }
}
