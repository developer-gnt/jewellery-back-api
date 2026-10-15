import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller.js';
import { AuthService } from './services/auth.service.js';
import { OtpService } from './services/otp.service.js';
import { SmsService } from './services/sms.service.js';
import { User } from '../users/entities/user.entity.js';
import { RefreshToken } from './entities/refresh-token.entity.js';
import { NotificationPreference } from '../users/entities/notification-preference.entity.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken, NotificationPreference]),
  ],
  controllers: [AuthController],
  providers: [AuthService, OtpService, SmsService, JwtAuthGuard],
  exports: [AuthService, OtpService, JwtAuthGuard],
})
export class AuthModule {}
