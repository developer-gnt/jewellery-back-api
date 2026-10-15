# Project Development Rules & Guidelines
## Zewar Mahal — NestJS Backend API

> These rules are mandatory for all development, refactoring, and additions in the `jewellery-back-api` codebase.

---

### 1. Database Schema & Migration Rules

* **All Table Changes via Migration**:
  * Every new table, column addition, alteration, deletion, foreign key, or index **MUST** be created via a dedicated TypeORM migration file in `src/database/migrations/`.
  * **Never** rely on `DB_SYNC=true` or entity auto-synchronization for schema evolution.
* **Verify Migration Files**:
  * Every migration file must include both:
    * `up(queryRunner: QueryRunner): Promise<void>`
    * `down(queryRunner: QueryRunner): Promise<void>` for complete rollback safety.
  * Verify migration syntax, table/column names, types, constraints, and indices before committing.
  * Migrations should be executable via:
    ```bash
    npm run migration:run
    npm run migration:revert
    ```
* **Keep Entities in Sync**:
  * Whenever a migration is created, the corresponding TypeORM entity in `src/modules/*/entities/` must be updated to match the database schema exactly.

---

### 2. Living Documentation & Memory Rules

* **Update `docs/memory.md`**:
  * Any architectural decision (ADR), schema change, new pattern, security rule, external provider integration, or gotcha **MUST** be documented in [`docs/memory.md`](file:///c:/Gnt-codebase/jewellery-back-api/docs/memory.md).
  * If a decision deviates from earlier assumptions or scope changes occur, record the rationale in `docs/memory.md`.
* **Update `docs/phases.md` & `docs/api-list.md`**:
  * When a phase, sprint, or API endpoint is started or completed:
    * Update [`docs/phases.md`](file:///c:/Gnt-codebase/jewellery-back-api/docs/phases.md) — check off completed tasks `[x]`, set status to `Done`, and update deliverables.
    * Update [`docs/api-list.md`](file:///c:/Gnt-codebase/jewellery-back-api/docs/api-list.md) — mark the endpoint `[x]` and update the module & grand total summaries.

---

### 3. Code Standards & Architecture Rules

* **Native ESM Imports**:
  * The project runs on native Node.js ESM (`"type": "module"` with `moduleResolution: "nodenext"`).
  * **All relative imports within TypeScript must use the `.js` extension** (e.g., `import { Admin } from './entities/admin.entity.js';`).
  * Never use `__dirname` without defining `const __dirname = import.meta.dirname;` or using `fileURLToPath(import.meta.url)`.
* **Layered Security & Guards**:
  * Public routes must explicitly declare the `@Public()` decorator.
  * Customer-authenticated routes must use `@UseGuards(JwtAuthGuard)`.
  * Admin-only routes must use `@UseGuards(JwtAuthGuard, AdminGuard)`. Never place `@Public()` on `/admin/*` routes (except `/admin/auth/login`).
* **Input Validation & DTOs**:
  * Every endpoint accepting body, params, or query parameters must have a dedicated DTO with `class-validator` and `class-transformer` decorators.
  * Global `ValidationPipe` is enabled with `whitelist: true, forbidNonWhitelisted: true`.
* **Standardized API Responses**:
  * All successful responses are intercepted by [`ResponseInterceptor`](file:///c:/Gnt-codebase/jewellery-back-api/src/common/interceptors/response.interceptor.ts) returning `{ statusCode, message, data, timestamp }`.
  * All exceptions are formatted by [`AllExceptionsFilter`](file:///c:/Gnt-codebase/jewellery-back-api/src/common/filters/all-exceptions.filter.ts).

---

### 4. Testing & Quality Verification

* **Linter & Type Checking**:
  * Run `npm run lint` (`oxlint`) before marking work complete. Must have **0 errors and 0 warnings**.
  * Run `npm run build` (`nest build`) to verify TypeScript compilation.
* **Automated Tests**:
  * Write unit tests for new controllers and services in `*.spec.ts` files using **Vitest**.
  * Run `npm run test` (`vitest run`) and ensure all test suites pass.
