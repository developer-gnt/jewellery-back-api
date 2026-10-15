import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto.js';
import type { EnquiryStatus } from '../entities/enquiry.entity.js';

export class QueryEnquiriesDto extends PaginationDto {
  @ApiPropertyOptional({
    enum: ['new', 'contacted', 'in_progress', 'closed'],
    description: 'Filter by workflow status',
  })
  @IsOptional()
  @IsIn(['new', 'contacted', 'in_progress', 'closed'])
  status?: EnquiryStatus;

  @ApiPropertyOptional({ description: 'Search by reference number, name, or mobile' })
  @IsOptional()
  @IsString()
  q?: string;
}
