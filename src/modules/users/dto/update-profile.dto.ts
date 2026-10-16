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

  @ApiPropertyOptional({
    example: '15 Mar 1995',
    description: 'Date of birth of the customer',
  })
  @IsOptional()
  @IsString({ message: 'Date of birth must be a string' })
  @MaxLength(50, { message: 'Date of birth cannot exceed 50 characters' })
  dateOfBirth?: string;

  @ApiPropertyOptional({
    example: 'male',
    description: 'Gender of the customer (male, female, prefer-not-to-say)',
  })
  @IsOptional()
  @IsString({ message: 'Gender must be a string' })
  @MaxLength(50, { message: 'Gender cannot exceed 50 characters' })
  gender?: string;

  @ApiPropertyOptional({
    example: 'Mumbai',
    description: 'City of the customer',
  })
  @IsOptional()
  @IsString({ message: 'City must be a string' })
  @MaxLength(100, { message: 'City cannot exceed 100 characters' })
  city?: string;
}
