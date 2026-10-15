import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';

export class RegisterDeviceDto {
  @ApiProperty({
    example: 'dK5aB8_...fcmTokenString...',
    description: 'Firebase Cloud Messaging client device registration token',
  })
  @IsNotEmpty({ message: 'fcmToken is required' })
  @IsString()
  fcmToken: string;

  @ApiPropertyOptional({
    example: 'android',
    enum: ['ios', 'android', 'web'],
    description: 'Client platform OS',
  })
  @IsOptional()
  @IsIn(['ios', 'android', 'web'], { message: 'Platform must be ios, android, or web' })
  platform?: string;
}
