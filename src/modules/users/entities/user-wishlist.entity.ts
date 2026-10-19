import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity.js';

@Entity('user_wishlist')
export class UserWishlist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 100 })
  productId: string;

  @Column({ type: 'varchar', length: 200 })
  productName: string;

  @Column({ type: 'numeric' })
  price: number;

  @Column({ type: 'varchar', length: 100 })
  purity: string;

  @Column({ type: 'decimal', precision: 8, scale: 3, nullable: true })
  weight: number | null;

  @Column({ type: 'numeric', nullable: true })
  originalPrice: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  categoryName: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sku: string | null;

  @Column({ type: 'text', nullable: true })
  imageSource: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  tag: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
