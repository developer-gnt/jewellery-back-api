import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateAdminAndUserTables1729000000000 implements MigrationInterface {
  name = 'CreateAdminAndUserTables1729000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure pgcrypto extension exists for gen_random_uuid()
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    // 1. Create admins table
    await queryRunner.createTable(
      new Table({
        name: 'admins',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
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

    // 2. Create users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'mobile',
            type: 'varchar',
            length: '20',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'avatar',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'notificationPreferences',
            type: 'jsonb',
            isNullable: true,
            default:
              '\'{"offers":true,"rates":true,"enquiries":true,"general":true}\'',
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

    // 3. Create refresh_tokens table
    await queryRunner.createTable(
      new Table({
        name: 'refresh_tokens',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'adminId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'token',
            type: 'varchar',
            length: '500',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'expiresAt',
            type: 'timestamp with time zone',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp with time zone',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create indices on refresh_tokens
    await queryRunner.createIndex(
      'refresh_tokens',
      new TableIndex({
        name: 'IDX_refresh_tokens_userId',
        columnNames: ['userId'],
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

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('refresh_tokens', true);
    await queryRunner.dropTable('users', true);
    await queryRunner.dropTable('admins', true);
  }
}
