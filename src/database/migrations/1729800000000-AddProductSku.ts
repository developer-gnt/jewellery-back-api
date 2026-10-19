import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductSku1729800000000 implements MigrationInterface {
  name = 'AddProductSku1729800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "products"
        ADD COLUMN IF NOT EXISTS "sku" character varying(100);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "products"
        DROP COLUMN IF EXISTS "sku";
    `);
  }
}
