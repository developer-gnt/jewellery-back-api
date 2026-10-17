import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity.js';

@Entity('offers')
export class Offer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'varchar', length: 30, default: 'offer' })
  type: string; // 'offer' | 'announcement'

  @Column({ type: 'varchar', length: 50, nullable: true })
  code: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  discount: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  offerType: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  applicableOn: string | null;

  @Column({ type: 'uuid', nullable: true })
  categoryId: string | null;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category: Category | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  discountType: string | null; // 'percentage' | 'fixed'

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  discountValue: number | null;

  @Column({ type: 'text', nullable: true })
  image: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  startDate: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  endDate: Date | null;

  @Column({ type: 'boolean', default: false })
  isDraft: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
