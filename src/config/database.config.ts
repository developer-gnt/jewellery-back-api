import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  name: process.env.DB_NAME || 'zewar_mahal',
  user: process.env.DB_USER || 'postgres',
  pass: process.env.DB_PASS || 'postgres',
  sync: process.env.DB_SYNC === 'true',
  logging: process.env.DB_LOGGING === 'true',
}));
