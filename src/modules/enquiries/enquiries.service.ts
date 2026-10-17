import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enquiry } from './entities/enquiry.entity.js';
import { Product } from '../products/entities/product.entity.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { CreateEnquiryDto } from './dto/create-enquiry.dto.js';
import { UpdateEnquiryStatusDto } from './dto/update-enquiry-status.dto.js';
import { QueryEnquiriesDto } from './dto/query-enquiries.dto.js';
import { paginate } from '../../common/dto/pagination.dto.js';

@Injectable()
export class EnquiriesService {
  constructor(
    @InjectRepository(Enquiry)
    private readonly enquiryRepository: Repository<Enquiry>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @Optional()
    private readonly notificationsService?: NotificationsService,
  ) {}

  private generateReferenceNumber(): string {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ZM-ENQ-${dateStr}-${randomHex}`;
  }

  async submit(dto: CreateEnquiryDto, userId?: string) {
    let validProductId: string | null = null;
    if (dto.productId) {
      const product = await this.productRepository.findOne({
        where: { id: dto.productId },
      });
      if (product) {
        validProductId = product.id;
      }
    }

    const referenceNumber = this.generateReferenceNumber();

    // Enrich message with preferred contact time and location if provided
    let fullMessage = dto.message;
    const extraDetails: string[] = [];
    if (dto.preferredContactTime && dto.preferredContactTime !== 'Any time') {
      extraDetails.push(`Preferred Contact Time: ${dto.preferredContactTime}`);
    }
    if (dto.location) {
      extraDetails.push(`Location: ${dto.location}`);
    }
    if (extraDetails.length > 0 && !fullMessage.includes(extraDetails[0])) {
      fullMessage = `${fullMessage}\n\n[Customer Preferences]\n${extraDetails.join('\n')}`;
    }

    const enquiry = this.enquiryRepository.create({
      name: dto.name,
      mobile: dto.mobile,
      email: dto.email || null,
      message: fullMessage,
      productId: validProductId,
      userId: userId ?? null,
      referenceNumber,
      status: 'new',
    });

    const saved = await this.enquiryRepository.save(enquiry);

    // Send confirmation notification to customer if authenticated
    if (userId && this.notificationsService) {
      this.notificationsService
        .sendToUser(
          userId,
          'enquiries',
          `Enquiry Received: ${referenceNumber}`,
          'Thank you for contacting Zewar Mahal. We have received your enquiry and our team will get back to you shortly.',
          { referenceNumber, enquiryId: saved.id },
        )
        .catch(() => {});
    }

    return {
      id: saved.id,
      referenceNumber: saved.referenceNumber,
      status: saved.status,
      createdAt: saved.createdAt,
    };
  }

  async getMyEnquiries(userId: string) {
    return this.enquiryRepository.find({
      where: { userId },
      relations: { product: { images: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(query: QueryEnquiriesDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.enquiryRepository
      .createQueryBuilder('enquiry')
      .leftJoinAndSelect('enquiry.product', 'product')
      .leftJoinAndSelect('enquiry.user', 'user');

    if (query.status) {
      qb.andWhere('enquiry.status = :status', { status: query.status });
    }

    if (query.q) {
      qb.andWhere(
        '(LOWER(enquiry.referenceNumber) LIKE LOWER(:q) OR LOWER(enquiry.name) LIKE LOWER(:q) OR enquiry.mobile LIKE :q)',
        { q: `%${query.q}%` },
      );
    }

    qb.orderBy('enquiry.createdAt', 'DESC');
    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return paginate(data, total, page, limit);
  }

  async findOne(id: string) {
    const enquiry = await this.enquiryRepository.findOne({
      where: { id },
      relations: { product: { images: true }, user: true },
    });

    if (!enquiry) {
      throw new NotFoundException(`Enquiry with ID "${id}" not found`);
    }

    return enquiry;
  }

  async updateStatus(id: string, dto: UpdateEnquiryStatusDto) {
    const enquiry = await this.findOne(id);

    enquiry.status = dto.status;
    if (dto.adminNotes !== undefined) {
      enquiry.adminNotes = dto.adminNotes;
    }

    await this.enquiryRepository.save(enquiry);

    // Notify user if enquiry is associated with an account
    if (enquiry.userId && this.notificationsService) {
      this.notificationsService
        .sendToUser(
          enquiry.userId,
          'enquiries',
          `Enquiry Update: ${enquiry.referenceNumber}`,
          `Your enquiry status has been updated to "${enquiry.status}".`,
          {
            referenceNumber: enquiry.referenceNumber,
            enquiryId: enquiry.id,
            status: enquiry.status,
          },
        )
        .catch(() => {});
    }

    return {
      id: enquiry.id,
      referenceNumber: enquiry.referenceNumber,
      status: enquiry.status,
      adminNotes: enquiry.adminNotes,
      updatedAt: enquiry.updatedAt,
    };
  }
}
