import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOfferDto {
  @ApiProperty({ example: 'Festival Zero Making Offer', description: 'Offer headline title' })
  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'ZEROMAKE', description: 'Promo coupon code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ example: 'Flat 100% discount on making charges on gold sets above 40g.', description: 'Details and terms' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '100% OFF Making', description: 'Highlight discount tag' })
  @IsOptional()
  @IsString()
  discount?: string;

  @ApiPropertyOptional({ example: 'https://cdn.zewarmahal.com/offers/festive.jpg', description: 'Banner promo image URL' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ example: '2026-10-01T00:00:00.000Z', description: 'Campaign start timestamp' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({ example: '2026-11-15T23:59:59.000Z', description: 'Campaign end timestamp' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @ApiPropertyOptional({ example: true, description: 'Active state' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
