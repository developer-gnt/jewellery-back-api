import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { User } from './entities/user.entity.js';
import { NotificationPreference } from './entities/notification-preference.entity.js';
import { UserAddress } from './entities/user-address.entity.js';
import { UserWishlist } from './entities/user-wishlist.entity.js';
import { Offer } from '../offers/entities/offer.entity.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      NotificationPreference,
      UserAddress,
      UserWishlist,
      Offer,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtAuthGuard],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
