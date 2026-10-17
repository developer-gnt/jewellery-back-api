import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreSetting } from './entities/store-setting.entity.js';
import { SettingsService } from './settings.service.js';
import {
  SettingsController,
  AdminSettingsController,
} from './settings.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([StoreSetting])],
  controllers: [SettingsController, AdminSettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
