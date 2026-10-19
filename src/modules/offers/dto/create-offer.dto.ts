import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsDate, IsNumber, IsUUID, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOfferDto {
  @ApiProperty({ example: 'Festival Zero Making Offer', description: 'Offer headline title' })
  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'offer', description: 'Item type: offer or announcement', default: 'offer' })
  @IsOptional()
  @IsString()
  type?: string;

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

  @ApiPropertyOptional({ example: 'Making Charges', description: 'Specific offer category type' })
  @IsOptional()
  @IsString()
  offerType?: string;

  @ApiPropertyOptional({ example: 'All Jewellery', description: 'Applicability target' })
  @IsOptional()
  @IsString()
  applicableOn?: string;

  @ApiPropertyOptional({ example: '0281b37b-8ff8-4545-bb7c-2b28c25785a8', description: 'Category UUID' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ example: ['09b5b2eb-9f34-409a-9f15-344f957aa767'], description: 'Product UUIDs for Specific Pieces' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  productIds?: string[];

  @ApiPropertyOptional({ example: 'percentage', description: 'Discount type: percentage or fixed' })
  @IsOptional()
  @IsString()
  discountType?: string;

  @ApiPropertyOptional({ example: 20, description: 'Discount numeric value' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  discountValue?: number;

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

  @ApiPropertyOptional({ example: false, description: 'Draft state - drafts are hidden from customers' })
  @IsOptional()
  @IsBoolean()
  isDraft?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Active state' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
