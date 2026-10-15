# Project Core Rules (Antigravity)

## 1. Schema Changes & Migrations
- All database modifications MUST be performed using TypeORM migrations in `src/database/migrations/`.
- `DB_SYNC` in `.env` must remain `false`. Never use `synchronize: true`.
- When modifying an entity, register it in `src/database/data-source.ts` and write/generate a migration.

## 2. Living Documentation Sync
- **After every change in code:** Update `docs/memory.md` with decisions, implemented modules, entities, and gotchas.
- **After completing a phase:** Update `docs/phases.md` and `docs/api-list.md` to mark all completed tasks and endpoints as `[x]`.

## 3. Build & Test Verification
- Before any commit or push, run `npm test` and `npm run build`. Never push broken code.

## 4. ESM Imports
- All relative local imports must use `.js` extension (NodeNext ESM).
