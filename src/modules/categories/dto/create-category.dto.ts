import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength, IsBoolean } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Rings', description: 'Name of the jewellery category' })
  @IsNotEmpty({ message: 'Category name is required' })
  @IsString({ message: 'Name must be a string' })
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  name: string;

  @ApiPropertyOptional({
    example: 'rings',
    description: 'URL-friendly slug (auto-generated if omitted)',
  })
  @IsOptional()
  @IsString({ message: 'Slug must be a string' })
  @MaxLength(120, { message: 'Slug cannot exceed 120 characters' })
  slug?: string;

  @ApiProperty({
    example: 'https://cdn.zewarmahal.com/categories/rings.jpg',
    description: 'Category thumbnail/banner image URL (mandatory)',
    required: true,
  })
  @IsNotEmpty({ message: 'Category image is required. Please upload an image.' })
  @IsString({ message: 'Image must be a string' })
  image: string;

  @ApiPropertyOptional({
    example: 'Exclusive handcrafted gold and diamond rings',
    description: 'Detailed description of the category',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiPropertyOptional({ example: true, description: 'Whether the category is active' })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;
}
