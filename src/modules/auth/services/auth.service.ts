import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../../users/entities/user.entity.js';
import { NotificationPreference } from '../../users/entities/notification-preference.entity.js';
import { RefreshToken } from '../entities/refresh-token.entity.js';
import { OtpService } from './otp.service.js';
import { SendOtpDto } from '../dto/send-otp.dto.js';
import { VerifyOtpDto } from '../dto/verify-otp.dto.js';
import { RefreshTokenDto } from '../dto/refresh-token.dto.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(NotificationPreference)
    private readonly prefRepository: Repository<NotificationPreference>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async sendOtp(dto: SendOtpDto) {
    const result = await this.otpService.sendOtp(dto.mobile);
    return {
      message: 'OTP sent successfully',
      expiresIn: result.expiresIn,
      ...(result.devOtp ? { devOtp: result.devOtp } : {}),
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const isValid = await this.otpService.verifyOtp(dto.mobile, dto.otp);
    if (!isValid) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Find or create user
    let user = await this.userRepository.findOne({
      where: { mobile: dto.mobile, isDeleted: false },
      relations: { notificationPreferences: true },
    });

    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      user = this.userRepository.create({
        mobile: dto.mobile,
        role: 'customer',
        isActive: true,
      });
      user = await this.userRepository.save(user);

      // Create default notification preferences
      const preferences = this.prefRepository.create({
        userId: user.id,
        offers: true,
        rates: true,
        enquiries: true,
        general: true,
      });
      await this.prefRepository.save(preferences);
      user.notificationPreferences = preferences;
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been deactivated. Please contact support.');
    }

    // Issue tokens
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      isNewUser,
      user: {
        id: user.id,
        mobile: user.mobile,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret');

    let payload: { sub: string; mobile: string; role: string };
    try {
      payload = await this.jwtService.verifyAsync(dto.refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Check in database
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: {
        token: dto.refreshToken,
        userId: payload.sub,
        isRevoked: false,
      },
      relations: { user: true },
    });

    if (!tokenRecord || new Date() > tokenRecord.expiresAt) {
      throw new UnauthorizedException('Refresh token is invalid or has expired');
    }

    // Invalidate old token (Rotation)
    tokenRecord.isRevoked = true;
    await this.refreshTokenRepository.save(tokenRecord);

    const user = tokenRecord.user;
    if (!user || user.isDeleted || !user.isActive) {
      throw new UnauthorizedException('User account no longer active');
    }

    // Generate new token pair
    const tokens = await this.generateTokens(user);

    return tokens;
  }

  async logout(userId: string) {
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );
    return { message: 'Logged out successfully' };
  }

  async getMe(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId, isDeleted: false },
      relations: { notificationPreferences: true },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return {
      id: user.id,
      mobile: user.mobile,
      name: user.name,
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

  private async generateTokens(user: User) {
    const accessSecret = this.configService.get<string>('jwt.accessSecret');
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret');
    const accessExpires = this.configService.get<string>('jwt.accessExpires', '15m');
    const refreshExpires = this.configService.get<string>('jwt.refreshExpires', '7d');

    const payload = {
      sub: user.id,
      mobile: user.mobile,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpires as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpires as any,
      }),
    ]);

    // Parse expiration for refresh token (7 days default)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Save refresh token to db
    const refreshTokenEntity = this.refreshTokenRepository.create({
      token: refreshToken,
      userId: user.id,
      expiresAt,
      isRevoked: false,
    });
    await this.refreshTokenRepository.save(refreshTokenEntity);

    return {
      accessToken,
      refreshToken,
    };
  }
}
