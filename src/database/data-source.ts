import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../modules/users/entities/user.entity.js';
import { NotificationPreference } from '../modules/users/entities/notification-preference.entity.js';
import { UserAddress } from '../modules/users/entities/user-address.entity.js';
import { UserWishlist } from '../modules/users/entities/user-wishlist.entity.js';
import { Admin } from '../modules/admin/entities/admin.entity.js';
import { RefreshToken } from '../modules/auth/entities/refresh-token.entity.js';
import { Category } from '../modules/categories/entities/category.entity.js';
import { Product } from '../modules/products/entities/product.entity.js';
import { ProductImage } from '../modules/products/entities/product-image.entity.js';
import { Banner } from '../modules/banners/entities/banner.entity.js';
import { Offer } from '../modules/offers/entities/offer.entity.js';
import { MetalRate } from '../modules/rates/entities/metal-rate.entity.js';
import { ShopRate } from '../modules/shop-rates/entities/shop-rate.entity.js';
import { Enquiry } from '../modules/enquiries/entities/enquiry.entity.js';
import { UserDevice } from '../modules/notifications/entities/user-device.entity.js';
import { Notification } from '../modules/notifications/entities/notification.entity.js';

import { StoreSetting } from '../modules/settings/entities/store-setting.entity.js';

dotenv.config();

const __dirname = import.meta.dirname;

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'zewar_mahal',
  synchronize: process.env.DB_SYNC === 'true',
  logging: process.env.DB_LOGGING === 'true',
  entities: [
    User,
    NotificationPreference,
    UserAddress,
    UserWishlist,
    StoreSetting,
    Admin,
    RefreshToken,
    Category,
    Product,
    ProductImage,
    Banner,
    Offer,
    MetalRate,
    ShopRate,
    Enquiry,
    UserDevice,
    Notification,
  ],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
});
