import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OffersController } from './offers.controller.js';
import { OffersService } from './offers.service.js';
import { Offer } from './entities/offer.entity.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { AdminGuard } from '../../common/guards/admin.guard.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Offer]),
    NotificationsModule,
  ],
  controllers: [OffersController],
  providers: [OffersService, JwtAuthGuard, AdminGuard],
  exports: [OffersService],
})
export class OffersModule {}
