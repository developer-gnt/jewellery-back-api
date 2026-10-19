import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  IsEmail,
  ValidateIf,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class EnquiryProductItemDto {
  @ApiPropertyOptional({ example: 'prod-1' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiProperty({ example: 'Designer Gold Bangle' })
  @IsNotEmpty()
  @IsString()
  productName: string;

  @ApiPropertyOptional({ example: 'SKU-BAN-001' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ example: '22K Filigree Gold' })
  @IsOptional()
  @IsString()
  purity?: string;

  @ApiPropertyOptional({ example: 28.0 })
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional({ example: 89000 })
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ example: 95000 })
  @IsOptional()
  originalPrice?: number;

  @ApiPropertyOptional({ example: 'bangle2' })
  @IsOptional()
  @IsString()
  imageSource?: string;

  @ApiPropertyOptional({ example: 'Bangles' })
  @IsOptional()
  @IsString()
  categoryName?: string;
}

export class CreateBulkWishlistEnquiryDto {
  @ApiPropertyOptional({ example: 'Sameer Shaikh', description: 'Customer name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: '9876543210', description: '10-digit mobile number' })
  @IsOptional()
  @Matches(/^[0-9]{10}$/, { message: 'Must be a valid 10-digit mobile number' })
  mobile?: string;

  @ApiPropertyOptional({ example: 'sameer@example.com', description: 'Customer email' })
  @IsOptional()
  @ValidateIf((o) => typeof o.email === 'string' && o.email.trim().length > 0)
  @IsEmail({}, { message: 'Must be a valid email' })
  @MaxLength(150)
  email?: string;

  @ApiPropertyOptional({
    example: 'I would like to enquire about availability and making charges for all my wishlist items.',
    description: 'Enquiry message',
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({
    type: [EnquiryProductItemDto],
    description: 'Optional explicit list of wishlist products',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EnquiryProductItemDto)
  items?: EnquiryProductItemDto[];
}
