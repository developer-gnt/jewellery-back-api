import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMetalRateExtendedColumns1729700000000 implements MigrationInterface {
  name = 'AddMetalRateExtendedColumns1729700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "metal_rates"
        ADD COLUMN IF NOT EXISTS "gold20K" numeric(10,2),
        ADD COLUMN IF NOT EXISTS "gold18K" numeric(10,2),
        ADD COLUMN IF NOT EXISTS "gold14K" numeric(10,2),
        ADD COLUMN IF NOT EXISTS "gold10K" numeric(10,2),
        ADD COLUMN IF NOT EXISTS "changeAmount" numeric(10,2),
        ADD COLUMN IF NOT EXISTS "changePercentage" numeric(6,2);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "metal_rates"
        DROP COLUMN IF EXISTS "changePercentage",
        DROP COLUMN IF EXISTS "changeAmount",
        DROP COLUMN IF EXISTS "gold10K",
        DROP COLUMN IF EXISTS "gold14K",
        DROP COLUMN IF EXISTS "gold18K",
        DROP COLUMN IF EXISTS "gold20K";
    `);
  }
}
