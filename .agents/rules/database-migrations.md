# Rule: Database Schema Changes Via Migrations Only

## Core Principle
Any modification to the database schema (adding tables, altering columns, dropping columns, creating indexes, adding foreign keys, or updating constraints) MUST be executed through a TypeORM migration file. 

## Strict Guidelines
1. **Never use `synchronize: true`**:
   - `DB_SYNC` in `.env` and `.env.example` must remain `false`.
   - Never rely on TypeORM entity automatic synchronization to alter database schema.

2. **Entity Changes Require Migrations**:
   - Whenever an entity under `src/modules/**/entities/` is created, modified, or deleted:
     - Update the entity TypeScript file to maintain ORM mappings and metadata.
     - Generate or create a corresponding migration file in `src/database/migrations/`.
     - Verify the migration file contains both `up()` (apply changes) and `down()` (rollback changes) methods.

3. **Running and Generating Migrations**:
   - Generate migration automatically from entity changes:
     ```bash
     npm run migration:generate -- src/database/migrations/<MigrationName>
     ```
   - Create an empty migration for custom SQL:
     ```bash
     npm run migration:create -- src/database/migrations/<MigrationName>
     ```
   - Run pending migrations:
     ```bash
     npm run migration:run
     ```
   - Revert last migration:
     ```bash
     npm run migration:revert
     ```

4. **DataSource Configuration**:
   - Migration CLI uses `src/database/data-source.ts` (compiled to `dist/database/data-source.js`).
   - Every new entity must be registered in both `AppModule` / feature module and `src/database/data-source.ts`.
