# TODOs

## In `@/`

- [x] Setup up biome organizeImport on save and similar formatting options.

## In `@docs/decisions`

- [ ] Do a Back-of-envelop Estimation on 10K MAU in `back-of-envelope.md`. [Ref: Back-of-the-envelope Estimation](https://bytebytego.com/courses/system-design-interview/back-of-the-envelope-estimation)
- [ ] Fix `api-design.md` §5: Correct edge-case table entry claiming retried `POST /api/v1/entries/:habitId` is idempotent ("value is re-set"). Since entries are append-only, retried POST appends duplicate rows. Clearly separate PATCH retry (idempotent) from POST retry (non-idempotent) (Issue 2 & 13).
- [ ] Fix `api-design.md` §1: Remove statement that `/health` is outside versioned prefix; align with §9/§10 decision for `GET /api/v1/health` (Issue 3).
- [ ] Resolve Open Question #1 in `api-design.md` §12: Close backend open question by formally setting default `?period=` to `"month"` on `GET /api/v1/habits/:id/stats` (aligns with intended UI design in `DESIGN-HABITS.md` §3.11; backend-only fix, UI remains unchanged as intended) (Issue 7).
- [ ] Resolve Open Question #2 in `database-decisions.md` §10: Standardize heatmap intensity mapping contract (decide whether backend returns raw `value` in seconds or pre-computed `level` 0-3) (Issue 8).
- [ ] Resolve Open Question #4 in `api-design.md` §12: Finalize HTTP status code for day-lock rejection (e.g. 409 Conflict) (Issue 11).
- [ ] Decide on `weekStart`: Determine whether `weekStart` should be added to user schema/preferences or remain a hardcoded frontend constant (Monday) (Issue 10).

## In `@package/auth`

- [ ] Add correct schema in `@package/auth/schema.ts` and custom column called timezone in `@package/auth/auth-schema.ts` users table which will be done in `@package/auth/src/auth.ts`.
- [ ] Replace hardcoded placeholder "Asia/Kolkata" timezone in Better Auth user config (`input: false`) with dynamic client-provided device timezone at signup (Issue 9). [planned for phase 2]
- [ ] Writing e2e test for testing auth.

## In `@package/db`

- [x] Complete schema/schema.ts and db:push.
- [ ] If decided in docs, add `week_start` column to user table in schema (Issue 10).
- [ ] Writing e2e to test db connection and seeding data.

## In `@apps/api`

- [x] Setting up nestjs project.
- [x] Give a read: [https://docs.nestjs.com/cli/monorepo](https://docs.nestjs.com/cli/monorepo)
- [ ] Figure out what happens with tsconfig.json because theirs a tsconfig.base.json in root.
- [ ] endpoint design and most of it part is yet to be done. (Refer: docs/overview.canvas)
- [ ] Mount health check at `GET /api/v1/health` (Issue 3).
- [ ] In `POST /api/v1/entries/:habitId`, address lack of idempotency & handle duplicate session prevention / double-submit guards (Issue 2).
- [ ] In `POST /api/v1/habits` and `PATCH /api/v1/habits/:id`, add validation/handling to strip or guard `color` field since Phase 1 frontend design excludes habit colors (Issue 4, 5, 12).
- [ ] On `GET /api/v1/habits/:id/stats`, implement fallback default `period = "month"` in NestJS stats query DTO/handler when query parameter is omitted (backend-only fix matching intended UI) (Issue 7).
- [ ] Implement day-lock check on entry creation, update, and deletion, returning consistent HTTP status code (e.g. 409 Conflict) on lock violations (Issue 11).
- [ ] In habits, add checks for same info getting added to the db multiple times.
- [ ] Add column in habit table in db, archive that takes boolean right now it has archived_at column.
- [ ] Add Dockerfile and docker-compose file and prepare backend for cloud deployment. (api.mosaic.iamadi.xyz).
- [ ] **Fix 4–5s API TTFB**
  - **Issue:** Most authenticated endpoint latency is spent waiting on the database; Nest overhead is negligible (`/api/v1/health` is ~1ms).
  - **Cause:** Neon is in `us-east-2`. A warm query is ~300ms, and the first `neon-http` fetch after roughly 10s idle is ~2.2s. Each protected request also performs a Better Auth session lookup plus one or two sequential service queries.
  - **Proposed solution:** deploy the API and database in the same region; replace `neon-http` with a persistent pooled Postgres connection; target a standalone PostgreSQL instance on an Azure VM; use Better Auth session cookie caching (`packages/auth/src/auth.ts`, temporary change for now); remove redundant habit-ownership queries from the entries and heatmap paths.

## In `@apps/mobile`

## In `@package/mobile-ui`
