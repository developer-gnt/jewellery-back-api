import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnquiryItemsAndWishlistEnhancements1729800000000 implements MigrationInterface {
  name = 'EnquiryItemsAndWishlistEnhancements1729800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Ensure uuid extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // 2. Enhance user_wishlist columns
    await queryRunner.query(`
      ALTER TABLE "user_wishlist"
        ADD COLUMN IF NOT EXISTS "weight" numeric(8, 3),
        ADD COLUMN IF NOT EXISTS "originalPrice" numeric,
        ADD COLUMN IF NOT EXISTS "categoryName" character varying(100),
        ADD COLUMN IF NOT EXISTS "sku" character varying(100);
    `);

    // 3. Enhance enquiries columns
    await queryRunner.query(`
      ALTER TABLE "enquiries"
        ADD COLUMN IF NOT EXISTS "isBulkWishlist" boolean NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS "itemCount" integer NOT NULL DEFAULT 1;
    `);

    // 4. Create enquiry_items table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "enquiry_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "enquiryId" uuid NOT NULL,
        "productId" character varying(100),
        "productName" character varying(200) NOT NULL,
        "sku" character varying(100),
        "purity" character varying(100),
        "weight" numeric(8, 3),
        "price" numeric(12, 2) NOT NULL DEFAULT 0,
        "originalPrice" numeric(12, 2),
        "imageSource" text,
        "categoryName" character varying(100),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_enquiry_items_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_enquiry_items_enquiryId" FOREIGN KEY ("enquiryId") REFERENCES "enquiries"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_enquiry_items_enquiryId" ON "enquiry_items" ("enquiryId");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_enquiry_items_productId" ON "enquiry_items" ("productId");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "enquiry_items";`);
    await queryRunner.query(`
      ALTER TABLE "enquiries"
        DROP COLUMN IF EXISTS "isBulkWishlist",
        DROP COLUMN IF EXISTS "itemCount";
    `);
    await queryRunner.query(`
      ALTER TABLE "user_wishlist"
        DROP COLUMN IF EXISTS "weight",
        DROP COLUMN IF EXISTS "originalPrice",
        DROP COLUMN IF EXISTS "categoryName",
        DROP COLUMN IF EXISTS "sku";
    `);
  }
}
