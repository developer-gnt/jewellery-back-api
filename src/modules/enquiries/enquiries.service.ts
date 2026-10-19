import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enquiry } from './entities/enquiry.entity.js';
import { EnquiryItem } from './entities/enquiry-item.entity.js';
import { Product } from '../products/entities/product.entity.js';
import { UserWishlist } from '../users/entities/user-wishlist.entity.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { CreateEnquiryDto } from './dto/create-enquiry.dto.js';
import { CreateBulkWishlistEnquiryDto } from './dto/create-bulk-enquiry.dto.js';
import { UpdateEnquiryStatusDto } from './dto/update-enquiry-status.dto.js';
import { UpdateEnquiryDto } from './dto/update-enquiry.dto.js';
import { QueryEnquiriesDto } from './dto/query-enquiries.dto.js';
import { paginate } from '../../common/dto/pagination.dto.js';

@Injectable()
export class EnquiriesService {
  constructor(
    @InjectRepository(Enquiry)
    private readonly enquiryRepository: Repository<Enquiry>,
    @InjectRepository(EnquiryItem)
    private readonly enquiryItemRepository: Repository<EnquiryItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(UserWishlist)
    private readonly wishlistRepository: Repository<UserWishlist>,
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

    // Save associated single product enquiry item if product provided
    if (validProductId) {
      const product = await this.productRepository.findOne({
        where: { id: validProductId },
        relations: { images: true },
      });
      if (product) {
        await this.enquiryItemRepository.save(
          this.enquiryItemRepository.create({
            enquiryId: saved.id,
            productId: product.id,
            productName: product.name,
            sku: product.sku || null,
            purity: product.purity || null,
            weight: product.weight || null,
            price: Number(product.price) || 0,
            imageSource: product.images?.[0]?.url || null,
          }),
        ).catch(() => {});
      }
    }

    // Send confirmation notification to customer if authenticated
    if (userId && this.notificationsService) {
      this.notificationsService
        .sendToUser(
          userId,
          'enquiries',
          `Enquiry Mili: ${referenceNumber}`,
          'Zewar Mahal se judne ka shukriya. Hamein aapki enquiry mil gayi hai aur hamaari team aapse jald hi contact karegi.',
          { referenceNumber, enquiryId: saved.id },
        )
        .catch(() => {});
    }

    // Automatically create Admin Notification for new enquiry
    if (this.notificationsService) {
      this.notificationsService
        .notifyAdminEnquiry({
          id: saved.id,
          referenceNumber: saved.referenceNumber,
          name: saved.name,
          mobile: saved.mobile,
          message: saved.message,
          productId: saved.productId || undefined,
        })
        .catch(() => {});
    }

    return {
      id: saved.id,
      referenceNumber: saved.referenceNumber,
      status: saved.status,
      createdAt: saved.createdAt,
    };
  }

  async submitBulk(dto: CreateBulkWishlistEnquiryDto, userId?: string) {
    let customerName = (dto.name || '').trim();
    let customerMobile = (dto.mobile || '').trim();
    let customerEmail = (dto.email || '').trim() || null;

    if (userId) {
      const user = (await this.enquiryRepository.manager
        .getRepository('User')
        .findOne({ where: { id: userId, isDeleted: false } })) as any;
      if (user) {
        if (!customerName && user.name) customerName = user.name;
        if (!customerMobile && user.mobile) customerMobile = user.mobile;
        if (!customerEmail && user.email) customerEmail = user.email;
      }
    }

    if (!customerName) customerName = 'Valued Customer';
    if (!customerMobile) customerMobile = '9876543210';

    // 1. Authoritative Wishlist Resolution from Database
    let itemsToProcess: Array<{
      productId?: string | null;
      productName: string;
      sku?: string | null;
      purity?: string | null;
      weight?: number | null;
      price: number;
      originalPrice?: number | null;
      imageSource?: string | null;
      categoryName?: string | null;
    }> = [];

    if (userId) {
      const dbWishlist = await this.wishlistRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
      if (dbWishlist && dbWishlist.length > 0) {
        itemsToProcess = dbWishlist.map((w) => ({
          productId: w.productId,
          productName: w.productName,
          sku: w.sku || null,
          purity: w.purity || null,
          weight: w.weight ? Number(w.weight) : null,
          price: Number(w.price) || 0,
          originalPrice: w.originalPrice ? Number(w.originalPrice) : null,
          imageSource: w.imageSource || null,
          categoryName: w.categoryName || null,
        }));
      }
    }

    // Fall back to client payload items if database wishlist was empty
    if (itemsToProcess.length === 0 && dto.items && dto.items.length > 0) {
      itemsToProcess = dto.items.map((i) => ({
        productId: i.productId || null,
        productName: i.productName,
        sku: i.sku || null,
        purity: i.purity || null,
        weight: i.weight ? Number(i.weight) : null,
        price: Number(i.price) || 0,
        originalPrice: i.originalPrice ? Number(i.originalPrice) : null,
        imageSource: i.imageSource || null,
        categoryName: i.categoryName || null,
      }));
    }

    if (itemsToProcess.length === 0) {
      throw new BadRequestException('Cannot submit bulk enquiry: wishlist is empty');
    }

    // 2. Generate Unique Reference Number
    const referenceNumber = this.generateReferenceNumber();

    // 3. Compose clean, structured bulk message (without amount)
    const productListText = itemsToProcess
      .map(
        (it, idx) =>
          `${idx + 1}. ${it.productName} — ${it.purity || 'Hallmark Gold'}${
            it.weight ? `, ${it.weight} g` : ''
          }`,
      )
      .join('\n');

    const defaultMsg = `Hello Zewar Mahal,\n\nI would like to enquire about the following jewellery products from my wishlist:\n\n${productListText}\n\nPlease confirm the availability, specifications, and final pricing for these products.\n\nThank you.`;

    const fullMessage =
      dto.message && dto.message.trim().length > 0
        ? `${dto.message}\n\n[Wishlist Products List]\n${productListText}`
        : defaultMsg;

    // 4. Create and save Enquiry entity
    const enquiry = this.enquiryRepository.create({
      name: customerName,
      mobile: customerMobile,
      email: customerEmail,
      message: fullMessage,
      userId: userId ?? null,
      productId: null,
      referenceNumber,
      status: 'new',
      isBulkWishlist: true,
      itemCount: itemsToProcess.length,
    });

    const savedEnquiry = await this.enquiryRepository.save(enquiry);

    // 5. Create associated EnquiryItem entities
    const enquiryItems = itemsToProcess.map((it) =>
      this.enquiryItemRepository.create({
        enquiryId: savedEnquiry.id,
        productId: it.productId || null,
        productName: it.productName,
        sku: it.sku || null,
        purity: it.purity || null,
        weight: it.weight,
        price: it.price,
        originalPrice: it.originalPrice,
        imageSource: it.imageSource || null,
        categoryName: it.categoryName || null,
      }),
    );
    await this.enquiryItemRepository.save(enquiryItems);

    // 6. Send customer notification if authenticated
    if (userId && this.notificationsService) {
      this.notificationsService
        .sendToUser(
          userId,
          'enquiries',
          `Wishlist Enquiry Received: ${referenceNumber}`,
          `Thank you for contacting Zewar Mahal. We have received your enquiry for ${itemsToProcess.length} jewellery pieces from your wishlist. Our concierge will contact you shortly.`,
          { referenceNumber, enquiryId: savedEnquiry.id, isBulkWishlist: true, itemCount: itemsToProcess.length },
        )
        .catch(() => {});
    }

    // 7. Send admin notification
    if (this.notificationsService) {
      this.notificationsService
        .notifyAdminEnquiry({
          id: savedEnquiry.id,
          referenceNumber: savedEnquiry.referenceNumber,
          name: savedEnquiry.name,
          mobile: savedEnquiry.mobile,
          message: savedEnquiry.message,
        })
        .catch(() => {});
    }

    return {
      id: savedEnquiry.id,
      referenceNumber: savedEnquiry.referenceNumber,
      status: savedEnquiry.status,
      isBulkWishlist: true,
      itemCount: itemsToProcess.length,
      createdAt: savedEnquiry.createdAt,
    };
  }

  async getMyEnquiries(userId: string) {
    return this.enquiryRepository.find({
      where: { userId },
      relations: { items: true, product: { images: true } },
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
      .leftJoinAndSelect('enquiry.items', 'items')
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
      relations: { items: true, product: { images: true }, user: true },
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

    // Notify customer regarding enquiry update or admin messages
    if (this.notificationsService) {
      this.notificationsService
        .notifyEnquiryUpdate({
          id: enquiry.id,
          referenceNumber: enquiry.referenceNumber,
          name: enquiry.name,
          mobile: enquiry.mobile,
          status: enquiry.status,
          adminNotes: enquiry.adminNotes,
          userId: enquiry.userId,
        })
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

  async updateEnquiry(id: string, dto: UpdateEnquiryDto) {
    const enquiry = await this.findOne(id);

    if (dto.name !== undefined) {
      enquiry.name = dto.name;
    }
    if (dto.mobile !== undefined) {
      const cleanMobile = dto.mobile.replace(/\D/g, '').slice(-10);
      enquiry.mobile = cleanMobile;
      if (enquiry.userId) {
        await this.enquiryRepository.query(
          'UPDATE users SET mobile = $1 WHERE id = $2',
          [cleanMobile, enquiry.userId],
        ).catch(() => {});
      }
    }
    if (dto.email !== undefined) {
      enquiry.email = dto.email || null;
    }
    if (dto.message !== undefined) {
      enquiry.message = dto.message;
    }
    const hasStatusChanged = dto.status !== undefined && dto.status !== enquiry.status;
    const hasNewNotes = dto.adminNotes !== undefined && dto.adminNotes !== enquiry.adminNotes;
    if (dto.status !== undefined) {
      enquiry.status = dto.status;
    }
    if (dto.adminNotes !== undefined) {
      enquiry.adminNotes = dto.adminNotes;
    }

    await this.enquiryRepository.save(enquiry);

    if ((hasStatusChanged || hasNewNotes) && this.notificationsService) {
      this.notificationsService
        .notifyEnquiryUpdate({
          id: enquiry.id,
          referenceNumber: enquiry.referenceNumber,
          name: enquiry.name,
          mobile: enquiry.mobile,
          status: enquiry.status,
          adminNotes: enquiry.adminNotes,
          userId: enquiry.userId,
        })
        .catch(() => {});
    }

    return enquiry;
  }
}
