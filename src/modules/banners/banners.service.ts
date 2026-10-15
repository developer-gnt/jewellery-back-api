import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './entities/banner.entity.js';
import { CreateBannerDto } from './dto/create-banner.dto.js';
import { UpdateBannerDto } from './dto/update-banner.dto.js';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepository: Repository<Banner>,
  ) {}

  async findAll(onlyActive = false) {
    const qb = this.bannerRepository.createQueryBuilder('banner');

    if (onlyActive) {
      qb.where('banner.isActive = true');
    }

    qb.orderBy('banner.order', 'ASC').addOrderBy('banner.createdAt', 'DESC');

    return qb.getMany();
  }

  async findOne(id: string) {
    const banner = await this.bannerRepository.findOne({ where: { id } });

    if (!banner) {
      throw new NotFoundException(`Banner with ID "${id}" not found`);
    }

    return banner;
  }

  async create(dto: CreateBannerDto) {
    const banner = this.bannerRepository.create({
      ...dto,
      order: dto.order ?? 0,
      isActive: dto.isActive ?? true,
    });

    return this.bannerRepository.save(banner);
  }

  async update(id: string, dto: UpdateBannerDto) {
    const banner = await this.findOne(id);

    Object.assign(banner, dto);

    return this.bannerRepository.save(banner);
  }

  async toggleStatus(id: string, isActive: boolean) {
    const banner = await this.findOne(id);
    banner.isActive = isActive;
    return this.bannerRepository.save(banner);
  }

  async delete(id: string) {
    const banner = await this.findOne(id);
    await this.bannerRepository.remove(banner);
    return { message: 'Banner deleted successfully' };
  }
}
