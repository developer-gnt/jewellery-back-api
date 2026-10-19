import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
  IsUUID,
} from 'class-validator';

export class SendNotificationDto {
  @ApiProperty({ example: 'Festive Flash Sale Live!', description: 'Notification title' })
  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Special 50% discount on making charges for next 4 hours. Tap to browse!',
    description: 'Notification body message',
  })
  @IsNotEmpty({ message: 'Body message is required' })
  @IsString()
  body: string;

  @ApiPropertyOptional({
    example: { route: '/offers', offerId: '123' },
    description: 'Custom key-value payload for deep linking',
  })
  @IsOptional()
  data?: Record<string, any>;

  @ApiPropertyOptional({ example: true, description: 'Broadcast to all registered devices' })
  @IsOptional()
  @IsBoolean()
  targetAll?: boolean;

  @ApiPropertyOptional({
    example: ['550e8400-e29b-41d4-a716-446655440000'],
    description: 'Specific user IDs if sending a targeted notification',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  userIds?: string[];

  @ApiPropertyOptional({
    example: 'general',
    enum: ['offers', 'rates', 'enquiries', 'general', 'category', 'products'],
    description: 'Notification category type to respect user notification preferences',
  })
  @IsOptional()
  @IsString()
  type?: 'offers' | 'rates' | 'enquiries' | 'general' | 'category' | 'products';
}
