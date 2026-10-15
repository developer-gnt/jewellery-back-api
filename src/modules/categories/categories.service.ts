import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity.js';
import { Product } from '../products/entities/product.entity.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async findAll(onlyActive = true) {
    const qb = this.categoryRepository.createQueryBuilder('category');

    if (onlyActive) {
      qb.where('category.isActive = :isActive', { isActive: true });
    }

    qb.orderBy('category.name', 'ASC');

    const categories = await qb.getMany();

    // Fetch product counts per category
    const countRows = await this.productRepository
      .createQueryBuilder('product')
      .select('product.categoryId', 'categoryId')
      .addSelect('COUNT(product.id)', 'count')
      .groupBy('product.categoryId')
      .getRawMany();

    const countMap = new Map<string, number>(
      countRows.map((r: any) => [r.categoryId, parseInt(r.count, 10)]),
    );

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      image: cat.image,
      description: cat.description,
      isActive: cat.isActive,
      productCount: countMap.get(cat.id) ?? 0,
      createdAt: cat.createdAt,
    }));
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: { products: { images: true } },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    return category;
  }

  async create(dto: CreateCategoryDto) {
    const slug = dto.slug ? this.slugify(dto.slug) : this.slugify(dto.name);

    const existing = await this.categoryRepository.findOne({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException(`Category with slug "${slug}" already exists`);
    }

    const category = this.categoryRepository.create({
      ...dto,
      slug,
      isActive: dto.isActive ?? true,
    });

    return this.categoryRepository.save(category);
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    if (dto.slug || dto.name) {
      const newSlug = dto.slug ? this.slugify(dto.slug) : this.slugify(dto.name!);
      if (newSlug !== category.slug) {
        const existing = await this.categoryRepository.findOne({
          where: { slug: newSlug },
        });
        if (existing && existing.id !== id) {
          throw new ConflictException(`Slug "${newSlug}" is already in use`);
        }
        category.slug = newSlug;
      }
    }

    if (dto.name !== undefined) category.name = dto.name;
    if (dto.image !== undefined) category.image = dto.image;
    if (dto.description !== undefined) category.description = dto.description;
    if (dto.isActive !== undefined) category.isActive = dto.isActive;

    return this.categoryRepository.save(category);
  }

  async toggleStatus(id: string, isActive: boolean) {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    category.isActive = isActive;
    return this.categoryRepository.save(category);
  }

  async delete(id: string) {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    const productCount = await this.productRepository.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      throw new BadRequestException(
        `Cannot delete category. It is associated with ${productCount} product(s). Please reassign or delete products first.`,
      );
    }

    await this.categoryRepository.remove(category);

    return { message: 'Category deleted successfully' };
  }
}
