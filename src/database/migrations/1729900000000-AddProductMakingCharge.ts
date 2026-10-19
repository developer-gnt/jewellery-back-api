import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductMakingCharge1729900000000 implements MigrationInterface {
  name = 'AddProductMakingCharge1729900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "products"
        ADD COLUMN IF NOT EXISTS "makingChargeType" character varying(20) DEFAULT 'percentage',
        ADD COLUMN IF NOT EXISTS "makingCharge" numeric(10,2) DEFAULT 0;
    `);
    await queryRunner.query(`
      ALTER TABLE "products"
        ALTER COLUMN "price" DROP NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "products"
        DROP COLUMN IF EXISTS "makingChargeType",
        DROP COLUMN IF EXISTS "makingCharge";
    `);
  }
}
