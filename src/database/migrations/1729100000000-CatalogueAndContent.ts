import { MigrationInterface, QueryRunner } from 'typeorm';

export class CatalogueAndContent1729100000000 implements MigrationInterface {
  name = 'CatalogueAndContent1729100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Categories table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "slug" character varying(120) NOT NULL,
        "image" text,
        "description" text,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_categories_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_categories_id" PRIMARY KEY ("id")
      );
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_categories_slug" ON "categories" ("slug");
    `);

    // Products table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "products" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(200) NOT NULL,
        "slug" character varying(250) NOT NULL,
        "description" text,
        "price" numeric(12,2) NOT NULL,
        "metal" character varying(50) NOT NULL DEFAULT 'gold',
        "purity" character varying(30) NOT NULL DEFAULT '22K',
        "weight" numeric(8,3),
        "categoryId" uuid NOT NULL,
        "isPublished" boolean NOT NULL DEFAULT true,
        "isFeatured" boolean NOT NULL DEFAULT false,
        "isLatest" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_products_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_products_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_products_categoryId" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      );
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_products_slug" ON "products" ("slug");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_products_categoryId" ON "products" ("categoryId");
    `);

    // Product Images table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "product_images" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "productId" uuid NOT NULL,
        "url" text NOT NULL,
        "isPrimary" boolean NOT NULL DEFAULT false,
        "order" integer NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_product_images_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_product_images_productId" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_product_images_productId" ON "product_images" ("productId");
    `);

    // Banners table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "banners" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(150) NOT NULL,
        "image" text NOT NULL,
        "link" text,
        "order" integer NOT NULL DEFAULT 0,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_banners_id" PRIMARY KEY ("id")
      );
    `);

    // Offers table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "offers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(150) NOT NULL,
        "code" character varying(50),
        "description" text,
        "discount" character varying(50),
        "image" text,
        "startDate" TIMESTAMP WITH TIME ZONE,
        "endDate" TIMESTAMP WITH TIME ZONE,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_offers_id" PRIMARY KEY ("id")
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "offers";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "banners";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "product_images";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "products";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "categories";`);
  }
}
