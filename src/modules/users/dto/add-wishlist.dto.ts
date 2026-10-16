import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class AddWishlistDto {
  @ApiProperty({ example: 'search-1' })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({ example: 'Royal Diamond Necklace' })
  @IsNotEmpty()
  @IsString()
  productName: string;

  @ApiProperty({ example: 124000 })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({ example: '22K (916) • 22.4g' })
  @IsNotEmpty()
  @IsString()
  purity: string;

  @ApiPropertyOptional({ example: 'necklace1' })
  @IsOptional()
  @IsString()
  imageSource?: string;

  @ApiPropertyOptional({ example: 'Bestseller' })
  @IsOptional()
  @IsString()
  tag?: string;
}
