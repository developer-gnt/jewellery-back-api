# Workspace Rules: Zewar Mahal Backend

All instructions in [rule.md](file:///c:/Gnt-codebase/jewellery-back-api/rule.md) apply strictly:

1. **Table Changes via Migration Only**:
   - Every database table change, new column, or alteration must be created in `src/database/migrations/<timestamp>-<name>.ts`.
   - Both `up()` and `down()` must be implemented and verified.
   - Never use `DB_SYNC=true` for schema evolution.

2. **Memory Tracking (`docs/memory.md`)**:
   - Every architectural decision, schema update, pattern, or gotcha must be documented in `docs/memory.md`.

3. **Phase & API Tracking (`docs/phases.md` & `docs/api-list.md`)**:
   - When any phase or endpoint is completed, update both `docs/phases.md` (set status to Done, check deliverables) and `docs/api-list.md` (check `[x]` and update totals).

4. **ESM Imports**:
   - Always use `.js` extension on relative imports (e.g. `import ... from './file.js'`).
   - Use `import.meta.dirname` instead of naked `__dirname`.

5. **Verification**:
   - Run `npm run lint` and `npm run build` after major edits.
   - Maintain unit tests in Vitest and verify with `npm run test`.
