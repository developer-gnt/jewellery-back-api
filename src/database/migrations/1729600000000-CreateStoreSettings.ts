import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStoreSettings1729600000000 implements MigrationInterface {
  name = 'CreateStoreSettings1729600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "store_settings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "key" character varying(50) NOT NULL DEFAULT 'general',
        "whatsappNumber" character varying(50) NOT NULL DEFAULT '9930942947',
        "supportPhone" character varying(50) NOT NULL DEFAULT '+91 99309 42947',
        "supportEmail" character varying(100) NOT NULL DEFAULT 'concierge@zewarmahal.com',
        "storeAddress" text NOT NULL DEFAULT 'Zewar Mahal Flagship Store, Bandra West, Mumbai, Maharashtra 400050',
        "welcomeMessage" text NOT NULL DEFAULT 'Hello Zewar Mahal, I would like to inquire about fine jewellery pieces.',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_store_settings_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_store_settings_key" UNIQUE ("key")
      );
    `);

    // Ensure initial general store settings record exists
    await queryRunner.query(`
      INSERT INTO "store_settings" ("key", "whatsappNumber", "supportPhone", "supportEmail", "storeAddress", "welcomeMessage")
      VALUES (
        'general',
        '9930942947',
        '+91 99309 42947',
        'concierge@zewarmahal.com',
        'Zewar Mahal Flagship Store, Bandra West, Mumbai, Maharashtra 400050',
        'Hello Zewar Mahal, I would like to inquire about fine jewellery pieces.'
      )
      ON CONFLICT ("key") DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "store_settings";`);
  }
}
