import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsInt } from 'class-validator';

export class AddProductImageDto {
  @ApiProperty({
    example: 'https://cdn.zewarmahal.com/products/ring-view-2.jpg',
    description: 'URL of the uploaded product image',
  })
  @IsNotEmpty({ message: 'Image URL is required' })
  @IsString({ message: 'URL must be a string' })
  url: string;

  @ApiPropertyOptional({ example: false, description: 'Set as primary display image' })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ example: 1, description: 'Display order in gallery' })
  @IsOptional()
  @IsInt()
  order?: number;
}
