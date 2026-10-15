import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeController } from './home.controller.js';
import { HomeService } from './home.service.js';
import { Banner } from '../banners/entities/banner.entity.js';
import { Offer } from '../offers/entities/offer.entity.js';
import { ProductsModule } from '../products/products.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Banner, Offer]),
    ProductsModule,
  ],
  controllers: [HomeController],
  providers: [HomeService],
  exports: [HomeService],
})
export class HomeModule {}
