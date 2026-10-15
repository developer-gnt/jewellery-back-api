import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnquiriesAndNotifications1729300000000
  implements MigrationInterface
{
  name = 'EnquiriesAndNotifications1729300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enquiries table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "enquiries" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "referenceNumber" character varying(50) NOT NULL,
        "userId" uuid,
        "productId" uuid,
        "name" character varying(100) NOT NULL,
        "mobile" character varying(15) NOT NULL,
        "email" character varying(150),
        "message" text NOT NULL,
        "status" character varying(30) NOT NULL DEFAULT 'new',
        "adminNotes" text,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_enquiries_referenceNumber" UNIQUE ("referenceNumber"),
        CONSTRAINT "PK_enquiries_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_enquiries_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION,
        CONSTRAINT "FK_enquiries_productId" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      );
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_enquiries_referenceNumber" ON "enquiries" ("referenceNumber");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_enquiries_userId" ON "enquiries" ("userId");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_enquiries_productId" ON "enquiries" ("productId");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_enquiries_mobile" ON "enquiries" ("mobile");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_enquiries_status" ON "enquiries" ("status");
    `);

    // User Devices table (FCM Tokens)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_devices" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "fcmToken" text NOT NULL,
        "platform" character varying(20) NOT NULL DEFAULT 'android',
        "lastActiveAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_devices_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_devices_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_user_devices_userId" ON "user_devices" ("userId");
    `);

    // Notifications table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid,
        "title" character varying(150) NOT NULL,
        "body" text NOT NULL,
        "data" jsonb,
        "type" character varying(50) NOT NULL DEFAULT 'general',
        "isRead" boolean NOT NULL DEFAULT false,
        "readAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_notifications_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_notifications_userId" ON "notifications" ("userId");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_notifications_createdAt" ON "notifications" ("createdAt");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_devices";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "enquiries";`);
  }
}
