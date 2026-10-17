import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EnquiriesService } from './enquiries.service.js';
import { CreateEnquiryDto } from './dto/create-enquiry.dto.js';
import { UpdateEnquiryStatusDto } from './dto/update-enquiry-status.dto.js';
import { QueryEnquiriesDto } from './dto/query-enquiries.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { AdminGuard } from '../../common/guards/admin.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Public } from '../../common/decorators/roles.decorator.js';

@ApiTags('enquiries')
@Controller()
export class EnquiriesController {
  constructor(private readonly enquiriesService: EnquiriesService) {}

  @Public()
  @UseGuards(JwtAuthGuard)
  @Post('enquiries')
  @ApiOperation({ summary: 'Submit a product or general enquiry (Customer or Guest)' })
  @ApiResponse({
    status: 201,
    description: 'Enquiry submitted with unique reference number',
    schema: {
      example: {
        statusCode: 201,
        message: 'Success',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          referenceNumber: 'ZM-ENQ-20261015-7A2F',
          status: 'new',
          createdAt: '2026-10-15T15:00:00.000Z',
        },
      },
    },
  })
  submit(
    @Body() dto: CreateEnquiryDto,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.enquiriesService.submit(dto, userId);
  }

  @Get('users/enquiries')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Retrieve logged-in customer own submitted enquiries' })
  @ApiResponse({ status: 200, description: 'List of customer enquiries' })
  getMyEnquiries(@CurrentUser('sub') userId: string) {
    return this.enquiriesService.getMyEnquiries(userId);
  }

  @Get('admin/enquiries')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Retrieve all customer enquiries with filters (Admin)' })
  @ApiResponse({ status: 200, description: 'Paginated enquiry list' })
  findAll(@Query() query: QueryEnquiriesDto) {
    return this.enquiriesService.findAll(query);
  }

  @Get('admin/enquiries/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Retrieve full details of an enquiry (Admin)' })
  @ApiResponse({ status: 200, description: 'Enquiry details' })
  @ApiResponse({ status: 404, description: 'Enquiry not found' })
  findOne(@Param('id') id: string) {
    return this.enquiriesService.findOne(id);
  }

  @Patch('admin/enquiries/:id/status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update enquiry status in workflow (New, Contacted, In Progress, Closed)' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Enquiry not found' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateEnquiryStatusDto,
  ) {
    return this.enquiriesService.updateStatus(id, dto);
  }
}
