import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'Ayesha Khan',
    description: 'Full name of the customer',
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  name?: string;

  @ApiPropertyOptional({
    example: 'ayesha.khan@example.com',
    description: 'Email address of the customer',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(150, { message: 'Email cannot exceed 150 characters' })
  email?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.zewarmahal.com/avatars/user-123.jpg',
    description: 'URL of the customer avatar image',
  })
  @IsOptional()
  @IsString({ message: 'Avatar must be a string URL' })
  avatar?: string;
}
