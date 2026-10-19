import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddShopRateUniqueConstraint1729900000000 implements MigrationInterface {
  name = 'AddShopRateUniqueConstraint1729900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_shop_rates_metal_purity_active"
      ON "shop_rates" (LOWER("metal"), UPPER("purity"))
      WHERE "isActive" = true;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "UQ_shop_rates_metal_purity_active";
    `);
  }
}
