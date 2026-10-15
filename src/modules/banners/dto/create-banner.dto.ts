import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsInt } from 'class-validator';

export class CreateBannerDto {
  @ApiProperty({ example: 'Grand Festive Jewellery Showcase', description: 'Banner headline' })
  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'https://cdn.zewarmahal.com/banners/festive-hero.jpg',
    description: 'Image URL for the banner slide',
  })
  @IsNotEmpty({ message: 'Image URL is required' })
  @IsString()
  image: string;

  @ApiPropertyOptional({ example: '/categories/bridal', description: 'Destination deep link or route' })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiPropertyOptional({ example: 1, description: 'Display order priority' })
  @IsOptional()
  @IsInt()
  order?: number;

  @ApiPropertyOptional({ example: true, description: 'Active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
