import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BannersController } from './banners.controller.js';
import { BannersService } from './banners.service.js';
import { Banner } from './entities/banner.entity.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { AdminGuard } from '../../common/guards/admin.guard.js';

@Module({
  imports: [TypeOrmModule.forFeature([Banner])],
  controllers: [BannersController],
  providers: [BannersService, JwtAuthGuard, AdminGuard],
  exports: [BannersService],
})
export class BannersModule {}
