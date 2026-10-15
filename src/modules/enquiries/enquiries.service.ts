import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enquiry } from './entities/enquiry.entity.js';
import { Product } from '../products/entities/product.entity.js';
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
  ) {}

  private generateReferenceNumber(): string {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ZM-ENQ-${dateStr}-${randomHex}`;
  }

  async submit(dto: CreateEnquiryDto, userId?: string) {
    if (dto.productId) {
      const product = await this.productRepository.findOne({
        where: { id: dto.productId },
      });
      if (!product) {
        throw new BadRequestException(`Product with ID "${dto.productId}" not found`);
      }
    }

    const referenceNumber = this.generateReferenceNumber();

    const enquiry = this.enquiryRepository.create({
      ...dto,
      userId: userId ?? null,
      referenceNumber,
      status: 'new',
    });

    const saved = await this.enquiryRepository.save(enquiry);

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

    return {
      id: enquiry.id,
      referenceNumber: enquiry.referenceNumber,
      status: enquiry.status,
      adminNotes: enquiry.adminNotes,
      updatedAt: enquiry.updatedAt,
    };
  }
}
