import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Enquiry } from './enquiry.entity.js';

@Entity('enquiry_items')
export class EnquiryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  enquiryId: string;

  @ManyToOne(() => Enquiry, (enquiry) => enquiry.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'enquiryId' })
  enquiry: Enquiry;

  @Column({ type: 'varchar', length: 100, nullable: true })
  productId: string | null;

  @Column({ type: 'varchar', length: 200 })
  productName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sku: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  purity: string | null;

  @Column({ type: 'decimal', precision: 8, scale: 3, nullable: true })
  weight: number | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  originalPrice: number | null;

  @Column({ type: 'text', nullable: true })
  imageSource: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  categoryName: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
