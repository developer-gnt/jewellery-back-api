import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnhanceOffersAndAnnouncements1729700000000 implements MigrationInterface {
  name = 'EnhanceOffersAndAnnouncements1729700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "offers"
      ADD COLUMN IF NOT EXISTS "type" character varying(30) NOT NULL DEFAULT 'offer',
      ADD COLUMN IF NOT EXISTS "offerType" character varying(50),
      ADD COLUMN IF NOT EXISTS "applicableOn" character varying(50),
      ADD COLUMN IF NOT EXISTS "categoryId" uuid,
      ADD COLUMN IF NOT EXISTS "discountType" character varying(20),
      ADD COLUMN IF NOT EXISTS "discountValue" numeric(10,2),
      ADD COLUMN IF NOT EXISTS "isDraft" boolean NOT NULL DEFAULT false;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_offers_categoryId'
        ) THEN
          ALTER TABLE "offers"
          ADD CONSTRAINT "FK_offers_categoryId"
          FOREIGN KEY ("categoryId") REFERENCES "categories"("id")
          ON DELETE SET NULL ON UPDATE NO ACTION;
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_offers_categoryId" ON "offers" ("categoryId");
      CREATE INDEX IF NOT EXISTS "IDX_offers_type" ON "offers" ("type");
      CREATE INDEX IF NOT EXISTS "IDX_offers_isDraft" ON "offers" ("isDraft");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_offers_isDraft";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_offers_type";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_offers_categoryId";`);
    await queryRunner.query(`ALTER TABLE "offers" DROP CONSTRAINT IF EXISTS "FK_offers_categoryId";`);
    await queryRunner.query(`
      ALTER TABLE "offers"
      DROP COLUMN IF EXISTS "isDraft",
      DROP COLUMN IF EXISTS "discountValue",
      DROP COLUMN IF EXISTS "discountType",
      DROP COLUMN IF EXISTS "categoryId",
      DROP COLUMN IF EXISTS "applicableOn",
      DROP COLUMN IF EXISTS "offerType",
      DROP COLUMN IF EXISTS "type";
    `);
  }
}
