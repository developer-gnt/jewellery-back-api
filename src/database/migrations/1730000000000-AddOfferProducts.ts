import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOfferProducts1730000000000 implements MigrationInterface {
  name = 'AddOfferProducts1730000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "offers"
      ADD COLUMN IF NOT EXISTS "productIds" jsonb DEFAULT '[]'::jsonb;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "offer_products" (
        "offerId" uuid NOT NULL,
        "productId" uuid NOT NULL,
        CONSTRAINT "PK_offer_products" PRIMARY KEY ("offerId", "productId"),
        CONSTRAINT "FK_offer_products_offerId" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_offer_products_productId" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_offer_products_offerId" ON "offer_products" ("offerId");
      CREATE INDEX IF NOT EXISTS "IDX_offer_products_productId" ON "offer_products" ("productId");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "offer_products";`);
    await queryRunner.query(`
      ALTER TABLE "offers"
      DROP COLUMN IF EXISTS "productIds";
    `);
  }
}
