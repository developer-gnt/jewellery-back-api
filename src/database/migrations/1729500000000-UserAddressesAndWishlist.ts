import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserAddressesAndWishlist1729500000000 implements MigrationInterface {
  name = 'UserAddressesAndWishlist1729500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Ensure uuid extension is available
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // 2. Create user_addresses table if not exists
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_addresses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "label" character varying(50) NOT NULL DEFAULT 'Home',
        "isDefault" boolean NOT NULL DEFAULT false,
        "recipient" character varying(100) NOT NULL DEFAULT '',
        "phone" character varying(30) NOT NULL DEFAULT '',
        "addressLine" text NOT NULL DEFAULT '',
        "city" character varying(100) NOT NULL DEFAULT '',
        "state" character varying(100) NOT NULL DEFAULT 'Maharashtra',
        "pincode" character varying(20) NOT NULL DEFAULT '',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_addresses_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_addresses_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      );
    `);

    // Ensure all columns exist in case user_addresses was pre-existing
    await queryRunner.query(`
      ALTER TABLE "user_addresses"
        ADD COLUMN IF NOT EXISTS "label" character varying(50) NOT NULL DEFAULT 'Home',
        ADD COLUMN IF NOT EXISTS "isDefault" boolean NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS "recipient" character varying(100) NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS "phone" character varying(30) NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS "addressLine" text NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS "city" character varying(100) NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS "state" character varying(100) NOT NULL DEFAULT 'Maharashtra',
        ADD COLUMN IF NOT EXISTS "pincode" character varying(20) NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_user_addresses_userId" ON "user_addresses" ("userId");
    `);

    // 3. Create user_wishlist table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_wishlist" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "productId" character varying(100) NOT NULL,
        "productName" character varying(200) NOT NULL DEFAULT '',
        "price" numeric NOT NULL DEFAULT 0,
        "purity" character varying(100) NOT NULL DEFAULT '',
        "imageSource" text,
        "tag" character varying(50),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_wishlist_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_wishlist_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_user_wishlist_userId" ON "user_wishlist" ("userId");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_user_wishlist_productId" ON "user_wishlist" ("productId");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "user_wishlist";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_addresses";`);
  }
}
