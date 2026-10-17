import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  MaxLength,
  Matches,
  IsIn,
} from 'class-validator';
import type { EnquiryStatus } from '../entities/enquiry.entity.js';

export class UpdateEnquiryDto {
  @ApiPropertyOptional({ example: 'Rohan Sharma', description: 'Updated customer name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: '9876543210', description: 'Updated 10-digit mobile number' })
  @IsOptional()
  @Matches(/^[0-9]{10}$/, { message: 'Must be a valid 10-digit mobile number' })
  mobile?: string;

  @ApiPropertyOptional({ example: 'rohan.sharma@example.com', description: 'Updated email' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  email?: string;

  @ApiPropertyOptional({ example: 'Updated enquiry notes or requirements', description: 'Message' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({
    example: 'contacted',
    enum: ['new', 'contacted', 'in_progress', 'closed'],
    description: 'Updated workflow status',
  })
  @IsOptional()
  @IsIn(['new', 'contacted', 'in_progress', 'closed'])
  status?: EnquiryStatus;

  @ApiPropertyOptional({ example: 'Internal staff notes', description: 'Admin notes' })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}
