import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'refresh_tokens' })
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  userId: string | null;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  adminId: string | null;

  @Column({ type: 'varchar', length: 500, unique: true })
  token: string;

  @Column({ type: 'timestamp with time zone' })
  expiresAt: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
