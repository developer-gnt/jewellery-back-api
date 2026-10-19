import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserWishlistAndAddresses1729500000000 implements MigrationInterface {
  name = 'UserWishlistAndAddresses1729500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_addresses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "label" character varying(50) NOT NULL DEFAULT 'Home',
        "isDefault" boolean NOT NULL DEFAULT false,
        "recipient" character varying(100) NOT NULL,
        "phone" character varying(30) NOT NULL,
        "addressLine" text NOT NULL,
        "city" character varying(100) NOT NULL,
        "state" character varying(100) NOT NULL DEFAULT 'Maharashtra',
        "pincode" character varying(20) NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_addresses_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_addresses_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_user_addresses_userId" ON "user_addresses" ("userId");
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_wishlist" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "productId" character varying(100) NOT NULL,
        "productName" character varying(200) NOT NULL,
        "price" numeric NOT NULL,
        "purity" character varying(100) NOT NULL,
        "imageSource" text,
        "tag" character varying(50),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_wishlist_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_wishlist_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_user_wishlist_userId" ON "user_wishlist" ("userId");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "user_wishlist";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_addresses";`);
  }
}
