# Project Engineering Rules & Standards
## Zewar Mahal — NestJS Backend

> **Mandatory Guidelines for AI Agents and Developers working on this codebase.**

---

## 1. Database Schema & Migration Rule (CRITICAL)

- **Strict Migration-First Policy:** Any change to the database schema (adding, modifying, or deleting tables, columns, indexes, foreign keys, or constraints) **MUST** be performed via a TypeORM migration file in `src/database/migrations/`.
- **Never Auto-Sync:** `DB_SYNC` in `.env` and `.env.example` must **ALWAYS** be `false`. Direct table synchronization via TypeORM's `synchronize: true` is strictly prohibited.
- **Entity & Migration Pairing:** Whenever an entity in `src/modules/**/entities/` is created or modified:
  1. Update the TypeScript entity file.
  2. Register the entity in `src/database/data-source.ts` and the relevant feature module.
  3. Create/generate a migration in `src/database/migrations/` containing both `up()` and `down()` queries.
  4. Run and test the migration with `npm run migration:run`.

### Migration Commands
```bash
# Apply all pending migrations
npm run migration:run

# Revert last applied migration
npm run migration:revert

# Generate migration from entity diff
npm run migration:generate -- src/database/migrations/<MigrationName>

# Create empty migration template
npm run migration:create -- src/database/migrations/<MigrationName>
```

---

## 2. Living Documentation Rule (Memory & Phases)

- **Update Memory After Every Code Change:**
  - After making any structural or functional change in the codebase, immediately record the update in [`docs/memory.md`](file:///d:/Gnt_codebase/jewellew-back-api/docs/memory.md).
  - Document new entities, modules, services, environment variables, gotchas, or architectural decisions (ADRs).
- **Update Phase Tracking on Phase Completion:**
  - As soon as all tasks or deliverables for a phase or sprint are complete, update [`docs/phases.md`](file:///d:/Gnt_codebase/jewellew-back-api/docs/phases.md) by marking tasks `[x] Done`.
  - Update [`docs/api-list.md`](file:///d:/Gnt_codebase/jewellew-back-api/docs/api-list.md) by marking endpoints as `[x]` with their HTTP method and route.

---

## 3. Pre-Commit Quality & Verification Rule

Before committing and pushing any code to the repository:
1. **Run Unit Tests:** `npm test` must execute and pass 100% of the test suite.
2. **Run Production Build:** `npm run build` must compile cleanly with **zero TypeScript errors**.
3. **No Dead or Broken Files:** Ensure `.gitignore` excludes build artifacts (`dist/`, `*.tsbuildinfo`, `.env`, `uploads/`, `node_modules/`).

---

## 4. Module & File Architecture Conventions

- **ESM NodeNext Imports:**
  - The project runs in native ESM (`"type": "module"` in `package.json`, `module: nodenext` in `tsconfig.json`).
  - All local relative imports **MUST include the `.js` extension** (e.g., `import { User } from './user.entity.js';`).
- **Swagger Documentation:**
  - Every controller must have `@ApiTags(...)`.
  - Every route must have `@ApiOperation({ summary: '...' })` and accurate `@ApiResponse(...)` decorators.
  - Protected routes must include `@ApiBearerAuth('access-token')` and `@UseGuards(JwtAuthGuard)`.
- **Validation & DTOs:**
  - Every request body, query parameter, or route parameter must have a dedicated DTO with `class-validator` constraints and `@ApiProperty` / `@ApiPropertyOptional` decorators.
  - Global `ValidationPipe` with `{ whitelist: true, forbidNonWhitelisted: true, transform: true }` is enforced.
- **Consistent Response Envelope:**
  - All responses are automatically formatted by `ResponseInterceptor` into `{ statusCode, message, data }`.
  - Errors are intercepted and standardized by `AllExceptionsFilter`.

---

## 5. Git Commit & Push Standards

- Commit messages must follow Conventional Commits:
  - `feat(phase-X): description`
  - `fix(module): description`
  - `chore(tooling): description`
  - `docs(...): description`
- Push directly to `origin/main` after verifying build and tests.
