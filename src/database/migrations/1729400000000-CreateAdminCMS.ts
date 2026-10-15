import { MigrationInterface, QueryRunner, Table, TableIndex, TableColumn } from 'typeorm';

export class CreateAdminCMS1729400000000 implements MigrationInterface {
  name = 'CreateAdminCMS1729400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Ensure uuid extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // 2. Create admins table
    await queryRunner.createTable(
      new Table({
        name: 'admins',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'role',
            type: 'varchar',
            length: '50',
            default: "'admin'",
            isNullable: false,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp with time zone',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp with time zone',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // 3. Make refresh_tokens.userId nullable (for admin refresh tokens)
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ALTER COLUMN "userId" DROP NOT NULL;`,
    );

    // 4. Add adminId column to refresh_tokens
    const hasAdminId = await queryRunner.hasColumn('refresh_tokens', 'adminId');
    if (!hasAdminId) {
      await queryRunner.addColumn(
        'refresh_tokens',
        new TableColumn({
          name: 'adminId',
          type: 'uuid',
          isNullable: true,
        }),
      );
      await queryRunner.createIndex(
        'refresh_tokens',
        new TableIndex({
          name: 'IDX_refresh_tokens_adminId',
          columnNames: ['adminId'],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasAdminId = await queryRunner.hasColumn('refresh_tokens', 'adminId');
    if (hasAdminId) {
      await queryRunner.dropIndex('refresh_tokens', 'IDX_refresh_tokens_adminId');
      await queryRunner.dropColumn('refresh_tokens', 'adminId');
    }
    await queryRunner.dropTable('admins', true);
  }
}
