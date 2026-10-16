import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  IsEmail,
} from 'class-validator';

export class CreateEnquiryDto {
  @ApiProperty({ example: 'Rohan Sharma', description: 'Name of the prospective customer' })
  @IsNotEmpty({ message: 'Customer name is required' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: '9876543210', description: '10-digit mobile number' })
  @IsNotEmpty({ message: 'Mobile number is required' })
  @Matches(/^[0-9]{10}$/, { message: 'Must be a valid 10-digit mobile number' })
  mobile: string;

  @ApiPropertyOptional({ example: 'rohan.sharma@example.com', description: 'Customer email' })
  @IsOptional()
  @IsEmail({}, { message: 'Must be a valid email' })
  @MaxLength(150)
  email?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Product UUID if enquiring about a specific jewellery design',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Product ID must be a valid UUID' })
  productId?: string;

  @ApiProperty({
    example: 'I would like to know customization options and current making charge for this choker.',
    description: 'Enquiry details or question',
  })
  @IsNotEmpty({ message: 'Enquiry message is required' })
  @IsString()
  message: string;
}
