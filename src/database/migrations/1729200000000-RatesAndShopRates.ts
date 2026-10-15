import { MigrationInterface, QueryRunner } from 'typeorm';

export class RatesAndShopRates1729200000000 implements MigrationInterface {
  name = 'RatesAndShopRates1729200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Metal Rates table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "metal_rates" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "gold24K" numeric(10,2) NOT NULL,
        "gold22K" numeric(10,2) NOT NULL,
        "silver" numeric(10,2) NOT NULL,
        "unit" character varying(20) NOT NULL DEFAULT 'gram',
        "isManualOverride" boolean NOT NULL DEFAULT false,
        "source" character varying(50) NOT NULL DEFAULT 'provider',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_metal_rates_id" PRIMARY KEY ("id")
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_metal_rates_createdAt" ON "metal_rates" ("createdAt");
    `);

    // Shop Rates table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "shop_rates" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "metal" character varying(50) NOT NULL DEFAULT 'gold',
        "purity" character varying(30) NOT NULL DEFAULT '22K',
        "ratePerGram" numeric(10,2) NOT NULL,
        "makingChargePerGram" numeric(10,2),
        "notes" text,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_shop_rates_id" PRIMARY KEY ("id")
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_shop_rates_metal" ON "shop_rates" ("metal");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_shop_rates_purity" ON "shop_rates" ("purity");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "shop_rates";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "metal_rates";`);
  }
}
