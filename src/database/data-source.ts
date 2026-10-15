import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../modules/users/entities/user.entity.js';
import { NotificationPreference } from '../modules/users/entities/notification-preference.entity.js';
import { RefreshToken } from '../modules/auth/entities/refresh-token.entity.js';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'zewar_mahal',
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
  entities: [User, NotificationPreference, RefreshToken],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
});

export default AppDataSource;
