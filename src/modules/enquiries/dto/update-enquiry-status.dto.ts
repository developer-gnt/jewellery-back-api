import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import type { EnquiryStatus } from '../entities/enquiry.entity.js';

export class UpdateEnquiryStatusDto {
  @ApiProperty({
    example: 'contacted',
    enum: ['new', 'contacted', 'in_progress', 'closed'],
    description: 'Updated state in workflow',
  })
  @IsNotEmpty()
  @IsIn(['new', 'contacted', 'in_progress', 'closed'], {
    message: 'Status must be one of: new, contacted, in_progress, closed',
  })
  status: EnquiryStatus;

  @ApiPropertyOptional({
    example: 'Spoke with customer; invited to store on Saturday for physical trial.',
    description: 'Internal notes recorded by staff/admin',
  })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}
