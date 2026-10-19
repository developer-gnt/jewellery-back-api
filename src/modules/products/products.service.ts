import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Raw } from 'typeorm';
import { Product } from './entities/product.entity.js';
import { ProductImage } from './entities/product-image.entity.js';
import { Category } from '../categories/entities/category.entity.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { QueryProductsDto } from './dto/query-products.dto.js';
import { AddProductImageDto } from './dto/add-image.dto.js';
import { paginate } from '../../common/dto/pagination.dto.js';

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly imageRepository: Repository<ProductImage>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async findAll(query: QueryProductsDto, onlyPublished = true) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'image');

    if (onlyPublished) {
      qb.where('product.isPublished = :isPublished', { isPublished: true });
    }

    if (query.category) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query.category);
      if (isUuid) {
        qb.andWhere('product.categoryId = :categoryId', {
          categoryId: query.category,
        });
      } else {
        qb.andWhere('(category.slug = :categorySlug OR LOWER(category.name) = LOWER(:categorySlug))', {
          categorySlug: query.category,
        });
      }
    }

    if (query.metal) {
      qb.andWhere('LOWER(product.metal) = LOWER(:metal)', {
        metal: query.metal,
      });
    }

    if (query.purity) {
      qb.andWhere('product.purity = :purity', { purity: query.purity });
    }

    if (query.minPrice !== undefined) {
      qb.andWhere('product.price >= :minPrice', { minPrice: query.minPrice });
    }

    if (query.maxPrice !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice: query.maxPrice });
    }

    if (query.isFeatured !== undefined) {
      qb.andWhere('product.isFeatured = :isFeatured', {
        isFeatured: query.isFeatured,
      });
    }

    if (query.isLatest !== undefined) {
      qb.andWhere('product.isLatest = :isLatest', {
        isLatest: query.isLatest,
      });
    }

    // Sort order
    if (query.sort === 'price_asc') {
      qb.orderBy('product.price', 'ASC');
    } else if (query.sort === 'price_desc') {
      qb.orderBy('product.price', 'DESC');
    } else {
      qb.orderBy('product.createdAt', 'DESC');
    }

    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return paginate(data, total, page, limit);
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: { category: true, images: true },
      order: { images: { order: 'ASC' } },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return product;
  }

  async search(searchTerm: string, page = 1, limit = 20) {
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new BadRequestException('Search query parameter "q" is required');
    }

    const skip = (page - 1) * limit;

    const [data, total] = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'image')
      .where('product.isPublished = true')
      .andWhere(
        '(LOWER(product.name) LIKE LOWER(:term) OR LOWER(product.description) LIKE LOWER(:term) OR LOWER(product.metal) LIKE LOWER(:term))',
        { term: `%${searchTerm}%` },
      )
      .orderBy('product.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return paginate(data, total, page, limit);
  }

  async getFeatured(limit = 10) {
    return this.productRepository.find({
      where: { isPublished: true, isFeatured: true },
      relations: { category: true, images: true },
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async getLatest(limit = 10) {
    return this.productRepository.find({
      where: { isPublished: true, isLatest: true },
      relations: { category: true, images: true },
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async checkNameAvailability(name: string, categoryId?: string) {
    if (!name || !name.trim()) {
      return { isAvailable: true, message: 'Name is required' };
    }
    const trimmedName = name.trim();
    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('LOWER(TRIM(product.name)) = LOWER(TRIM(:name))', { name: trimmedName });

    if (categoryId) {
      qb.andWhere('(product.categoryId = :categoryId OR category.id = :categoryId)', { categoryId });
    }

    const existing = await qb.getOne();
    if (existing) {
      const catName = existing.category?.name || 'this category';
      return {
        isAvailable: false,
        message: `"${trimmedName}" is already taken in ${catName}`,
        existingId: existing.id,
      };
    }

    return {
      isAvailable: true,
      message: `"${trimmedName}" is available`,
    };
  }

  async onModuleInit() {
    await this.backfillArticleCodes();
  }

  async backfillArticleCodes() {
    try {
      const products = await this.productRepository.find({
        order: { createdAt: 'ASC' },
      });

      let changed = false;
      let counter = 1;
      for (const p of products) {
        if (!p.sku || !p.sku.startsWith('ZM')) {
          const newCode = `ZM${String(counter).padStart(4, '0')}`;
          p.sku = newCode;
          await this.productRepository.save(p);
          changed = true;
        } else {
          const match = p.sku.match(/^ZM(\d+)$/i);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num >= counter) {
              counter = num;
            }
          }
        }
        counter++;
      }
      if (changed) {
        console.log('[ProductsService] Successfully normalized all product article codes to ZM#### sequence');
      }
    } catch (err) {
      console.warn('[ProductsService] Failed to backfill article codes:', err);
    }
  }

  async generateNextArticleCode(): Promise<string> {
    const allProducts = await this.productRepository.find({
      select: { id: true, sku: true },
    });

    let maxNumber = 0;
    for (const p of allProducts) {
      if (p.sku) {
        const match = p.sku.match(/^ZM(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNumber) {
            maxNumber = num;
          }
        }
      }
    }

    const nextNum = maxNumber > 0 ? maxNumber + 1 : (allProducts.length + 1);
    return `ZM${String(nextNum).padStart(4, '0')}`;
  }

  async create(dto: CreateProductDto) {
    // Validate category
    const category = await this.categoryRepository.findOne({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new BadRequestException(`Category with ID "${dto.categoryId}" not found`);
    }

    // Validate unique product name (case-insensitive & trimmed) PER CATEGORY
    const trimmedName = dto.name?.trim();
    if (trimmedName) {
      const existingName = await this.productRepository.findOne({
        where: {
          categoryId: dto.categoryId,
          name: Raw((alias) => `LOWER(TRIM(${alias})) = LOWER(TRIM(:name))`, {
            name: trimmedName,
          }),
        },
      });

      if (existingName) {
        throw new ConflictException(`A product with the name "${trimmedName}" already exists in ${category.name}`);
      }
    }

    const slug = dto.slug ? this.slugify(dto.slug) : this.slugify(dto.name);
    const existingSlug = await this.productRepository.findOne({
      where: { slug },
    });

    if (existingSlug) {
      throw new ConflictException(`Product slug "${slug}" is already in use`);
    }

    // Generate or normalize Article Code (common sequence across all categories, e.g. ZM0001, ZM0002)
    const sku = dto.sku && dto.sku.trim().length > 0
      ? dto.sku.trim().toUpperCase()
      : await this.generateNextArticleCode();

    // Calculate price from metal rate, gross weight and making charge if not directly specified
    let finalPrice = dto.price;
    if (!finalPrice || finalPrice <= 0) {
      const weight = Number(dto.weight) || 10;
      const metal = (dto.metal || 'gold').toLowerCase();
      const purity = (dto.purity || '22K').toUpperCase();
      let ratePerGram = 7450;
      if (metal === 'gold') {
        if (purity.includes('24')) ratePerGram = 8100;
        else if (purity.includes('18')) ratePerGram = 6100;
        else if (purity.includes('14')) ratePerGram = 4750;
      } else if (metal === 'silver') {
        ratePerGram = 95;
      } else if (metal === 'platinum') {
        ratePerGram = 3500;
      }

      const baseMetalValue = weight * ratePerGram;
      const makingVal = Number(dto.makingCharge) || 0;
      const makingAmount =
        dto.makingChargeType === 'amount'
          ? makingVal
          : baseMetalValue * (makingVal / 100);
      finalPrice = Math.round(baseMetalValue + makingAmount);
    }

    const product = this.productRepository.create({
      ...dto,
      price: finalPrice,
      makingChargeType: dto.makingChargeType || 'percentage',
      makingCharge: dto.makingCharge ?? 0,
      sku,
      slug,
      isPublished: dto.isPublished ?? true,
      isFeatured: dto.isFeatured ?? false,
      isLatest: dto.isLatest ?? false,
    });

    const savedProduct = await this.productRepository.save(product);

    // Save initial images if provided
    if (dto.imageUrls && dto.imageUrls.length > 0) {
      const images = dto.imageUrls.map((url, index) =>
        this.imageRepository.create({
          productId: savedProduct.id,
          url,
          isPrimary: index === 0,
          order: index,
        }),
      );
      await this.imageRepository.save(images);
      savedProduct.images = images;
    }

    return this.findOne(savedProduct.id);
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    if (dto.categoryId && dto.categoryId !== product.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new BadRequestException(`Category with ID "${dto.categoryId}" not found`);
      }
      product.categoryId = dto.categoryId;
    }

    if (dto.name && dto.name.trim().toLowerCase() !== product.name.trim().toLowerCase()) {
      const trimmedName = dto.name.trim();
      const catId = dto.categoryId || product.categoryId;
      const existingName = await this.productRepository.findOne({
        where: {
          categoryId: catId,
          name: Raw((alias) => `LOWER(TRIM(${alias})) = LOWER(TRIM(:name))`, {
            name: trimmedName,
          }),
        },
      });

      if (existingName && existingName.id !== id) {
        throw new ConflictException(`A product with the name "${trimmedName}" already exists in this category`);
      }
    }

    if (dto.slug || dto.name) {
      const newSlug = dto.slug ? this.slugify(dto.slug) : this.slugify(dto.name!);
      if (newSlug !== product.slug) {
        const existing = await this.productRepository.findOne({
          where: { slug: newSlug },
        });
        if (existing && existing.id !== id) {
          throw new ConflictException(`Slug "${newSlug}" is already in use`);
        }
        product.slug = newSlug;
      }
    }

    if (dto.name !== undefined) product.name = dto.name;
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.price !== undefined) product.price = dto.price;
    if (dto.metal !== undefined) product.metal = dto.metal;
    if (dto.purity !== undefined) product.purity = dto.purity;
    if (dto.weight !== undefined) product.weight = dto.weight;
    if (dto.isPublished !== undefined) product.isPublished = dto.isPublished;
    if (dto.isFeatured !== undefined) product.isFeatured = dto.isFeatured;
    if (dto.isLatest !== undefined) product.isLatest = dto.isLatest;

    await this.productRepository.save(product);

    return this.findOne(id);
  }

  async toggleStatus(id: string, isPublished: boolean) {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    product.isPublished = isPublished;
    return this.productRepository.save(product);
  }

  async delete(id: string) {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    await this.productRepository.remove(product);

    return { message: 'Product deleted successfully' };
  }

  async addImage(productId: string, dto: AddProductImageDto) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${productId}" not found`);
    }

    // If marked primary, un-primary existing images
    if (dto.isPrimary) {
      await this.imageRepository.update(
        { productId, isPrimary: true },
        { isPrimary: false },
      );
    }

    const image = this.imageRepository.create({
      productId,
      url: dto.url,
      isPrimary: dto.isPrimary ?? false,
      order: dto.order ?? 0,
    });

    return this.imageRepository.save(image);
  }

  async removeImage(productId: string, imageId: string) {
    const image = await this.imageRepository.findOne({
      where: { id: imageId, productId },
    });

    if (!image) {
      throw new NotFoundException(
        `Image with ID "${imageId}" not found on product "${productId}"`,
      );
    }

    await this.imageRepository.remove(image);

    return { message: 'Product image removed successfully' };
  }
}
