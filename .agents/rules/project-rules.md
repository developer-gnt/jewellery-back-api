# Workspace Rules: Zewar Mahal Backend

All instructions in [rule.md](file:///c:/Gnt-codebase/jewellery-back-api/rule.md) and [docs/rules.md](file:///c:/Gnt-codebase/jewellery-back-api/docs/rules.md) apply strictly:

## 1. Schema Changes & Migrations
- All database modifications MUST be performed using TypeORM migrations in `src/database/migrations/`.
- `DB_SYNC` in `.env` must remain `false`. Never use `synchronize: true` for schema changes.
- Every migration must provide and verify both `up()` and `down()` methods for safe rollback.
- When modifying an entity, register it in `src/database/data-source.ts` and write a migration.

## 2. Living Documentation & Memory Sync
- **After every change:** Update `docs/memory.md` with decisions, implemented modules, entities, and gotchas.
- **After completing a phase:** Update `docs/phases.md` and `docs/api-list.md` to mark all completed tasks and endpoints as `[x]`.

## 3. ESM Imports & Standards
- All relative local imports must use `.js` extension (NodeNext ESM).
- Use `import.meta.dirname` instead of naked `__dirname`.
- Public routes must use `@Public()`. Admin routes must use `JwtAuthGuard` + `AdminGuard`.

## 4. Build & Test Verification
- Before any commit or push, run `npm run lint`, `npm run build`, and `npm run test`. Never push broken code.
