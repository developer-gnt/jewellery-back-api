import { Injectable, NotFoundException, BadRequestException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Offer } from './entities/offer.entity.js';
import { Product } from '../products/entities/product.entity.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @Optional()
    @InjectRepository(Product)
    private readonly productRepository?: Repository<Product>,
    @Optional()
    private readonly notificationsService?: NotificationsService,
  ) {}

  private async validateApplicability(
    applicableOn: string | undefined | null,
    categoryId: string | undefined | null,
    productIds: string[] | undefined | null,
    isDraft: boolean,
  ): Promise<{ categoryId: string | null; productIds: string[] | null; products: Product[] }> {
    if (isDraft) {
      if (applicableOn === 'All Jewellery') {
        return { categoryId: null, productIds: [], products: [] };
      }
      let products: Product[] = [];
      if (productIds && productIds.length > 0 && this.productRepository) {
        products = await this.productRepository.findBy({ id: In(productIds) });
      }
      return {
        categoryId: categoryId || null,
        productIds: productIds || [],
        products,
      };
    }

    if (applicableOn === 'All Jewellery') {
      return { categoryId: null, productIds: [], products: [] };
    }

    if (applicableOn === 'Category') {
      if (!categoryId) {
        throw new BadRequestException('Category is required when offer applicability is "Category"');
      }
      return { categoryId, productIds: [], products: [] };
    }

    if (applicableOn === 'Specific Pieces') {
      if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        throw new BadRequestException('At least one catalogue product must be selected for "Specific Pieces"');
      }

      let products: Product[] = [];
      if (this.productRepository) {
        products = await this.productRepository.findBy({ id: In(productIds) });
        if (products.length !== productIds.length) {
          throw new BadRequestException('One or more selected products do not exist');
        }
        if (categoryId) {
          for (const product of products) {
            if (product.categoryId !== categoryId) {
              throw new BadRequestException(`Selected product "${product.name}" does not belong to the selected category`);
            }
          }
        } else if (products.length > 0 && products[0].categoryId) {
          const allSame = products.every(p => p.categoryId === products[0].categoryId);
          if (allSame) {
            categoryId = products[0].categoryId;
          }
        }
      }
      return { categoryId: categoryId || null, productIds, products };
    }

    return {
      categoryId: categoryId || null,
      productIds: productIds || [],
      products: [],
    };
  }

  async findAll(onlyActive = true, type?: string) {
    const qb = this.offerRepository
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.category', 'category')
      .leftJoinAndSelect('offer.products', 'product')
      .leftJoinAndSelect('product.images', 'productImage');

    if (onlyActive) {
      const now = new Date();
      qb.where('offer.isActive = true')
        .andWhere('offer.isDraft = false')
        .andWhere('(offer.startDate IS NULL OR offer.startDate <= :now)', { now })
        .andWhere('(offer.endDate IS NULL OR offer.endDate >= :now)', { now });
    }

    if (type) {
      qb.andWhere('offer.type = :type', { type });
    }

    qb.orderBy('offer.createdAt', 'DESC');

    return qb.getMany();
  }

  async findOne(id: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new NotFoundException(`Offer with ID "${id}" not found`);
    }

    const offer = await this.offerRepository
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.category', 'category')
      .leftJoinAndSelect('offer.products', 'product')
      .leftJoinAndSelect('product.images', 'productImage')
      .where('offer.id = :id', { id })
      .getOne();

    if (!offer) {
      throw new NotFoundException(`Offer with ID "${id}" not found`);
    }

    return offer;
  }

  async getSummary(type?: string) {
    const now = new Date();

    const qb = this.offerRepository.createQueryBuilder('offer');
    if (type) {
      qb.where('offer.type = :type', { type });
    }

    const allRecords = await qb.getMany();

    let total = allRecords.length;
    let active = 0;
    let upcoming = 0;
    let expired = 0;
    let draft = 0;

    for (const record of allRecords) {
      if (record.isDraft) {
        draft++;
        continue;
      }

      const start = record.startDate ? new Date(record.startDate) : null;
      const end = record.endDate ? new Date(record.endDate) : null;

      if (end && end < now) {
        expired++;
      } else if (start && start > now) {
        upcoming++;
      } else if (record.isActive) {
        active++;
      }
    }

    return {
      total,
      active,
      upcoming,
      expired,
      draft,
    };
  }

  async create(dto: CreateOfferDto) {
    const isDraft = dto.isDraft ?? false;
    const { categoryId, productIds, products } = await this.validateApplicability(
      dto.applicableOn,
      dto.categoryId,
      dto.productIds,
      isDraft,
    );

    const offer = this.offerRepository.create({
      ...dto,
      categoryId,
      productIds,
      products,
      type: dto.type || 'offer',
      isDraft,
      isActive: dto.isActive ?? true,
    });

    const saved = await this.offerRepository.save(offer);

    if (!saved.isDraft && saved.isActive && this.notificationsService) {
      this.notificationsService
        .broadcast(
          'offers',
          `New Offer: ${saved.title}`,
          saved.description || `Special promotion code: ${saved.code}. Don't miss out!`,
          { offerId: saved.id, code: saved.code },
        )
        .catch(() => {});
    }

    return this.findOne(saved.id);
  }

  async update(id: string, dto: UpdateOfferDto) {
    const offer = await this.findOne(id);

    const isDraft = dto.isDraft !== undefined ? dto.isDraft : offer.isDraft;
    const applicableOn = dto.applicableOn !== undefined ? dto.applicableOn : offer.applicableOn;
    const incomingCategoryId = dto.categoryId !== undefined ? dto.categoryId : offer.categoryId;
    const incomingProductIds = dto.productIds !== undefined ? dto.productIds : offer.productIds;

    const { categoryId, productIds, products } = await this.validateApplicability(
      applicableOn,
      incomingCategoryId,
      incomingProductIds,
      isDraft,
    );

    Object.assign(offer, dto, {
      categoryId,
      productIds,
      products,
    });

    await this.offerRepository.save(offer);
    return this.findOne(id);
  }

  async toggleStatus(id: string, isActive: boolean) {
    const offer = await this.findOne(id);
    offer.isActive = isActive;
    const saved = await this.offerRepository.save(offer);

    if (!saved.isDraft && isActive && this.notificationsService) {
      this.notificationsService
        .broadcast(
          'offers',
          `Offer Active: ${saved.title}`,
          saved.description || `Exclusive deal is now active: ${saved.code}!`,
          { offerId: saved.id, code: saved.code },
        )
        .catch(() => {});
    }

    return saved;
  }

  async delete(id: string) {
    const offer = await this.findOne(id);
    await this.offerRepository.remove(offer);
    return { message: 'Offer deleted successfully' };
  }
}
