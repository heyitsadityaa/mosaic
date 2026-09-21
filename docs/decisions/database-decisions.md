# Database Decisions

_Status: Active_
_Date: 2026-09-16_
_Scope: Habit heatmap data storage — schema shape, value typing, write model, timezone handling, tracking-type evolution_

This document records the design brainstorms, tradeoffs, and decisions behind the database schema for the habit heatmap application. It exists so that future phases can revisit _why_ something was chosen, what alternatives were weighed, and where the thinking went wrong or right. Each section is an independently readable MADR-style decision record.

---

## 0. Context and Requirements

The application is a habit tracker where each habit renders as a **heatmap** (per-day intensity). A user can create multiple habits ("Study", "Gym", ...). Every habit stores exactly **one** of four possible value shapes, chosen at creation and **immutable afterwards**:

| Tracking type | What is stored per entry                              |
| ------------- | ----------------------------------------------------- |
| timer         | a duration (seconds)                                  |
| binary        | done / not done                                       |
| number        | a count                                               |
| options       | a selection from a fixed list ("legs", "cardio", ...) |

Drivers behind these decisions:

- **Phase rollout:** Phase 1 ships **timer only**. All four types arrive by **Phase 3**. Beyond that, new tracking types _may_ be added later — the schema must make that cheap, but there are no concrete plans today.
- **Append-only per day:** a user can log multiple entries per habit per day (multiple study sessions). Days are an _aggregation_ of entries.
- **Edit-lock:** once the day ends (midnight in the user's timezone), no past or future data can be created, updated, or deleted.
- **Uniform storage** for a good developer experience: the codebase should not fork into four parallel worlds over one differing column's type.
- **Analytics matter:** the app shows "total time studied", averages, streaks, and per-period totals — so the DB must answer aggregation queries natively.

---

## 1. Entry Storage: One Table vs Four Tables vs Table-per-Entity

### Context and Problem Statement

Four value shapes, one heatmap. How do we physically store entries? The candidates kept surfacing: (a) one table with typed columns, (b) four static tables (one per type), (c) dynamic tables created per habit ("table-per-entity").

### Decision Drivers

- Low maintenance and tooling cost ("this is a small app").
- Type safety in Drizzle and NestJS.
- Cross-habit and cross-type analytics must stay simple.
- App supports only ~a handful of habits per user; volume is tiny (~thousands of rows/user).
- Type set is closed and known (`timer | binary | number | options`), and one type is locked per habit.

### Considered Options

1. **One table, typed nullable columns** — every entry a row; one of `duration_secs | is_done | count | option_value` is populated, the rest NULL.
2. **Four static tables** — `timer_entries`, `binary_entries`, `number_entries`, `option_entries`; perfectly typed, zero NULLs.
3. **N dynamic tables (table-per-entity)** — one table materialized per habit at creation, schema matching the chosen type.

### Decision Outcome

**Chosen: Option 1 — one `habit_entries` table with typed nullable columns.** Largely settles everything downstream.

### Consequences

Positive:

- One schema, one migration, one repository, one heatmap query.
- Cross-habit analytics = one `GROUP BY` query, never UNIONs.
- Adding a 5th tracking type = add one column + one validation guard. No new table, no data migration of existing rows.
- Postgres treats NULL well; sparse columns cost a few bits per row (the null bitmap), which is invisible at this scale.

Negative:

- Some columns are NULL per row (purely cosmetic; the app layer narrows which column is legal via the habit's immutable `value_type`).
- Column names are generic; the DB alone can't tell you a row is "timer data" without the habit — accepted, since the habit's type is the interpreter.

### Pros and Cons of the Options

#### Option 1 — One table, typed columns

- Good, because: single code path; Drizzle/Drizzle-kit and NestJS stay simple; analytics are one query.
- Good, because: type evolution = one column.
- Neutral: dead NULLs exist, but are kilobytes across the whole database.
- Bad: none material at this scale.

#### Option 2 — Four static tables

- Good, because: no NULLs; each table physically stores only its own shape.
- Good, because: perfect schema-enforced typing per column.
- Neutral: retrieval speed per type is identical to Option 1 at this scale (index by `(habit_id, date)` either way).
- Bad, because: every feature now has **four code paths** that differ only in one column name — the branching lives in services, DTOs, tests, and every future capability (widget, export, streak logic).
- Bad, because: cross-type questions ("total activity this week", "my longest streak") become 4-way UNIONs.

#### Option 3 — Table-per-entity (N dynamic tables)

- Good, because: perfect per-habit type purity and isolation; deleting a habit = dropping a table.
- Good, because: trivial future per-habit sharding if ever needed.
- Bad, because: `CREATE TABLE` at runtime makes the schema _data_ — migrations stop describing reality, and schema drift becomes a production problem.
- Bad, because: it is the maximum possible non-uniformity — Drizzle cannot statically type a table that doesn't exist in the schema file, forcing dynamic SQL with interpolated identifiers (loses all type safety, adds an injection surface).
- Bad, because: cross-habit analytics become UNIONs of N — the exact pain Option 2 was trying to side-step, made unbounded.
- Bad, because: catalog sprawl and test orchestration overhead at no benefit.

---

## 2. Table-per-Entity / Schema-per-Tenant — Explicit Rejection

### Context and Problem Statement

The user raised the idea that each habit could own its own table whose schema matches the chosen type ("if it's a timer it has a different schema, if binary it has a boolean schema"). This is a known pattern — table-per-entity / schema-per-tenant. It was important to evaluate it on its own rather than dismiss it, because it genuinely eliminates dead NULLs.

### Decision Drivers

- "No dead NULLs in the database" was a stated goal.
- Uniformity and developer experience was a stated, higher-ranked goal.
- The project is early-stage and maintenance cost matters most.

### Decision Outcome

**Rejected.** The NULLs being eliminated cost kilobytes; the pattern eliminates them by paying in runtime DDL, broken migration/purpose, lost static typing, injection risk, and N-way cross-habit queries. The trade is not favorable at any realistic scale for this product, and it actively contradicts the uniform-format requirement (N per-habit schemas is _maximal_ non-uniformity).

### Consequences

- The `habit_entries` single table stands; per-habit "schemas" can be simulated later with **views per type** over the one table if a per-type _appearance_ is ever wanted — without dynamic DDL.
- Whatever small benefit per-habit isolation offered was traded for one table's trivially-maintainable surface.

---

## 3. Value Column: JSONB vs Typed Columns

### Context and Problem Statement

Given one table, the value could be stored as a single flexible `JSONB` column (so all four shapes live in one column, fully uniform) or as typed columns (one per shape).

### Decision Drivers

- Analytics must run natively: "total time studied = 234h 52m" is `SUM(duration_secs)`.
- Type safety and queryability of history.

### Considered Options

1. **JSONB `value` column** — maximum uniformity, zero schema-typed columns, DB-agnostic to shape.
2. **Typed columns** — `duration_secs INT`, `is_done BOOLEAN`, `count INT`, `option_value TEXT` (all nullable).

### Decision Outcome

**Chosen: typed columns.** The analytics requirement decides it: `SUM(duration_secs)` is free and indexable; extracting numbers from JSON for every heatmap/analytics read is a permanent tax. The "uniform format" desire is served by a _uniform table_ with typed columns, not by a uniform untyped column.

### Pros and Cons of the Options

#### JSONB

- Good, because: one value column; adding a 5th type costs nothing structurally.
- Bad, because: every analytic is JSON extraction that PostgreSQL cannot plan through nice indexes; error-prone parsing; weak type safety; misses the point of "uniform" (the _table_ is uniform, the data inside is a grab-bag).

#### Typed columns

- Good, because: native `SUM`/`AVG`, typed in Drizzle, cheat-free constraints possible.
- Good, because: a 5th type still adds only one column.
- Neutral: sparse columns (see Decision 1 — cost is negligible).

---

## 4. Write Model: Append vs Overwrite

### Context and Problem Statement

Does a habit/day hold exactly one entry (overwrite) or many (append)? The user was explicit: multiple timer sessions per day, numbers append, options append, and even binary was reconsidered from "done/not-done" to "users should be able to update/fix".

### Decision Drivers

- Multiple sessions per day are required (study twice = two sessions).
- Entries are locked only at day-end, so in-day corrections must be possible.
- "What time did I actually do this" should not be lost.

### Decision Outcome

**Chosen: append.** Every row is a timestamped event; the day is a derived aggregation. Update/delete is allowed _only for today's rows_ (enforced by the timezone lock, Decision 5). Append-only writes are the friendliest pattern for Postgres (`INSERT`-only, no HOT updates).

### Consequences

- The heatmap endpoint returns `GROUP BY date` aggregates; today's cell is a _partial_, live sum that grows through the day.
- The app must upsert nothing — writes are plain inserts, today's edits are deletes/updates of today's rows.
- Overwrite was rejected because it would force client-side accumulation of merged values and permanently lose the session history.

---

## 5. Timezone and the Day-End Lock

### Context and Problem Statement

Once midnight passes in the _user's_ timezone, the previous day (and all earlier days) become read-only — and future days are never writable. Handling this correctly raises questions: how is a "day" defined, what happens on travel (including mid-day), DST, permanent moves, and clients lying about their clock?

### Decision Drivers

- The heatmap is meant to mirror the user's own calendar; its day labels must be stable forever.
- The lock ("no past/future edits") is the integrity mechanism for streaks — it must be enforced server-side.
- The product is early-stage: complexity must be deferred, but the design must not paint into a corner.

### Decision Outcome

**Chosen: frozen timezone + stored instant + frozen day bucket.**

- The user's timezone is captured at signup and treated as fixed ("their standard time"). Deliberately **frozen for now**; the _option_ to let a user change it is deferred to Phase 3 (decision: only the lock boundary moves; past data never re-buckets).
- Each entry stores:
  - `happened_at TIMESTAMPTZ` — the absolute instant (UTC) of the event.
  - `entry_date DATE` — the day-cell, computed **once at write time** in the then-active timezone, and **never recomputed**.
- The edit rule, enforced server-side on every create/update/delete: `entry_date` must equal `now() AT TIME ZONE user.tz::date` (today in the user's timezone). Reject anything else.
- Postgres does the conversion with IANA names; NestJS needs no timezone library.

### Consequences

Positive:

- Past data is immutable in every sense — no reasonable scenario (travel, move, DST) ever moves historical cells to different days.
- The server clock is the only authority; client clocks/timezone spoofing are irrelevant.
- Travel, DST, and permanent moves produce no data migration.

Negative / accepted tradeoffs (product behavior, not bugs):

- **Traveling east** (into later wall-clock): the user gains extra hours to edit "today" by their local clock.
- **Traveling west** (into earlier wall-clock): the user loses edit hours — "today" freezes at home-midnight even if it is only afternoon locally.
- **Mid-day travel:** nothing shifts; the day boundary is the home timezone.

### Pros and Cons of the Options

#### Frozen (fixed) timezone — Chosen

- Good, because: "their standard time" is exactly what the user asked for; day labels never wobble; simplest correct model.
- Good, because: DST is invisible — `timestamptz` + IANA handles 23/25-hour days automatically (a per-hour view would be the only place DST appears, and that doesn't exist).
- Bad, because: cross-timezone travel gives a somewhat window-shifted "today" (accepted; documented for future UX complaint-awareness).

#### Follow-device timezone

- Good, because: the heatmap follows the user wherever they are.
- Bad, because: crossing the timezone re-buckets _yesterday's_ cells — streaks change meaning mid-trip; the product is a consistency tracker, so this is disqualifying.

#### Stored-day vs derived-day

- Good (stored): the frozen `entry_date` survives category problems and makes re-bucketing impossible.
- Neutral: requires integrity discipline (never recompute) — mitigated by the fact that writes and locks use the same computed value.

### Edge cases enumerated (for future reference)

| Scenario                                                 | Behavior                                                                                             |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Permanent move (tz changed, Phase 3)                     | Past `entry_date` values never move; only the lock boundary updates.                                 |
| Travel during the middle of a day                        | Day boundary stays home-tz; no shift, only the window effects above.                                 |
| DST spring/fall                                          | Invisible at day granularity.                                                                        |
| Midnight race (submit at 23:59:59.9, arrive after 00:00) | Rejected — server clock is law; no grace period (avoids support-ticket noise in a consistency tool). |
| Client clock/timezone spoofing                           | Immune — server derives today from stored tz.                                                        |
| Future data                                              | Unreachable by construction (only `== today` passes).                                                |

---

## 6. Tracking-Type Evolution

### Context and Problem Statement

Phase 1 ships **timer only**; all four types land by Phase 3; beyond that, unknown future types _may_ appear. How does the schema absorb this progression?

### Decision Outcome

The single-table, typed-columns design makes each addition **one column + one validation guard**. Phase 1 simply never reads the other columns; they form an inert but type-safe surface. No migration of existing rows is ever required for a new type, and no branching explosion in Drizzle/NestJS.

- P1: only `duration_secs` is exercised.
- P2/P3: `is_done`, `count`, `option_value` come online as columns and as validation branches on `habit.value_type`.
- Later: each future type = one column, one guard, one intensity mapping.

If a hypothetical future type does not fit a single scalar column (e.g. structured notes), the design's escape hatch is a JSONB "payload" column added alongside — isolated, without rewriting existing columns.

---

## 7. Narrative — What I Was Thinking, and Where It Was Wrong

_(Kept so future-me can see the trail, including the missteps.)_

- **"Four tables will cause performance issues."** Wrong framing. Four tables don't hurt performance; bad queries and cross-type UNIONs do. At this scale any valid design is sub-millisecond. The real cost of four tables is _code paths_, not speed — a fact missed entirely at first.
- **"Dead NULLs are a problem worth designing against."** The nulls were the driver for both four-tables and per-entity-tables. The honest math: nullable columns cost a fraction of a byte per row; the whole database's NULL overhead is kilobytes. Eliminating them costs permanent maintenance tax. The instinct was aesthetic, not engineering.
- **"Per-habit tables feel clean and isolated."** They do — until uniforms-storage is remembered. N per-habit schemas is the opposite of uniform DX, destroys Drizzle's typing model, and reintroduces UNION-based analytics as an unbounded problem.
- **"The timezone problem is scary."** It looked overwhelming (travel, DST, mid-day edges) until distilled to the real principle: _store the instant, freeze the bucket, lock against server-computed today_. All edge cases then fall out of two columns and one comparison.
- **What was right:** append-only event model; typed columns over JSONB for analytics; freezing tz now and deferring opt-in change to Phase 3; server-side enforcement of the lock.
- **Keep the Better Auth 32-char default.** Revised. The working schema (`packages/db`, commit 1334980) landed on UUID — `gen_random_uuid()` defaults in the database plus `advanced.database.generateId: "uuid"` in the auth config. The single-generation-site principle (the DB owns IDs) beat zero-config, and the docs were reconciled to record UUID as the convention (see §8, §9).

---

## 8. Final Phase 1 Schema

The canonical, current schema. Auth tables are owned by Better Auth (Google OAuth only); the `password` column on `account` remains unused. The user's `timezone` is an additional field on the Better Auth `user` model. All PKs and FKs are `uuid`, defaulted by Postgres `gen_random_uuid()`; Better Auth is configured with `generateId: "uuid"` to match (see ID Generation Strategy).

```dbml
Table user {
  id            uuid         [ pk, not null ]
  name          text         [ not null ]
  email         text         [ not null ]
  emailVerified boolean      [ not null ]
  image         text
  timezone      text         [ not null ] -- IANA name (frozen for now)
  createdAt     timestamptz  [ not null ]
  updatedAt     timestamptz  [ not null ]
}

Table session {
  id         uuid         [ pk, not null ]
  userId     uuid         [ not null ]
  token      text         [ not null, unique ]
  expiresAt  timestamptz  [ not null ]
  ipAddress  text
  userAgent  text
  createdAt  timestamptz  [ not null ]
  updatedAt  timestamptz  [ not null ]

  indexes {
    (userId) [ name: 'session_userId_idx' ]
  }
}

Table account {
  id                    uuid         [ pk, not null ]
  userId                uuid         [ not null ]
  accountId             text         [ not null ]
  providerId            text         [ not null ]
  accessToken           text
  refreshToken          text
  accessTokenExpiresAt  timestamptz
  refreshTokenExpiresAt timestamptz
  scope                 text
  idToken               text
  password              text
  createdAt             timestamptz  [ not null ]
  updatedAt             timestamptz  [ not null ]

  indexes {
    (userId) [ name: 'account_userId_idx' ]
  }
}

Table verification {
  id          uuid         [ pk, not null ]
  identifier  text         [ not null ]
  value       text         [ not null ]
  expiresAt   timestamptz  [ not null ]
  createdAt   timestamptz  [ not null ]
  updatedAt   timestamptz  [ not null ]

  indexes {
    (identifier) [ name: 'verification_identifier_idx' ]
  }
}

Table habit {
  id         uuid         [ pk, not null ]
  userId     uuid         [ not null ]
  name       text         [ not null ]
  valueType  text         [ not null ] -- 'timer' | 'binary' | 'number' | 'options'
  options    jsonb
  color      text
  createdAt  timestamptz  [ not null ]
  archivedAt timestamptz
}

Table habit_entries {
  id           uuid         [ pk, not null ]
  habitId      uuid         [ not null ]
  userId       uuid         [ not null ]
  happenedAt   timestamptz  [ not null ]
  entryDate    date         [ not null ]
  durationSecs integer
  isDone       boolean
  count        integer
  optionValue  text
  createdAt    timestamptz  [ not null ]
  updatedAt    timestamptz  [ not null ]

  indexes {
    (habitId, entryDate) [ name: 'habit_entries_index_0' ]
    (userId, entryDate)  [ name: 'habit_entries_index_1' ]
  }
}

Ref account.userId > user.id
Ref user.id < session.userId
Ref habit.userId > user.id
Ref habit_entries.userId > user.id -- corrected: generated diagram had `habit_entries.id - user.id`
Ref habit_entries.habitId > habit.id
```

**Phase 1:** only the `timer` tracking type is exercised — `durationSecs` is the only value column in active use and the other three stay inert until later phases. `happenedAt` is the absolute instant; `entryDate` is the frozen day-bucket.

---

## 9. ID Generation Strategy

### Context and Problem Statement

Better Auth generates IDs by default (32-char random alphanumeric). We chose to switch to **UUID v4**, with generation delegated to the database. The choice locks the column type for every PK and FK in both the auth tables and the domain tables (`habit.userId`, `habit_entries.userId`), so mismatches between conventions are the real risk, not the format itself.

_Revision note: an earlier draft of this record chose the Better Auth 32-char default. The working schema landed on UUID (`packages/db`, commit 1334980), and this record was updated to match — see the §7 narrative and §8._

### Decision Drivers

- One convention across auth + domain tables (FKs must match PK types; mixed types silently break at insert time).
- Generation happens in **one place**: the database's `gen_random_uuid()` default, so no app-side ID code exists anywhere, and nothing can forget to generate.
- `advanced.database.generateId: "uuid"` in the auth config matches whatever Better Auth generates itself, so auth and domain can never diverge.
- A recognized standard format that Drizzle, psql, and diagramming tools all treat natively.
- Collisions are a non-issue at this scale whichever way we go.

### Considered Options

1. **Keep Better Auth default** — 32-char random alphanumeric, for auth tables _and_ domain tables (id, userId, habitId, ... all `text`).
2. **UUID v4, generated by the database** — `uuid` columns with `pg_catalog.gen_random_uuid()` defaults; auth config sets `advanced.database.generateId: "uuid"`.
3. **UUID v7 (time-ordered)** — better index locality at scale; requires a custom `generateId` function everywhere.

### Decision Outcome

**Chosen: Option 2 — UUID v4, generated by the database.** Every PK and FK in the schema is `uuid`, defaulted by `pg_catalog.gen_random_uuid()`; the auth config sets `advanced.database.generateId: "uuid"` for anything Better Auth generates. Because the DB owns generation, domain tables need no Drizzle `$defaultFn` or shared generator — the default simply inherits.

### Consequences

Positive:

- One convention everywhere — `uuid` end to end; no text-vs-uuid mismatch across the whole `user.id` → `habit.userId` → `habit_entries.userId` chain (the known Better Auth passkey issue is exactly this class of failure — structurally avoided).
- Zero application-side ID code: `gen_random_uuid()` is free in Postgres, so there is nothing each new table must remember to do.
- Standard format understood by every tool in the stack.

Neutral:

- IDs are opaque and not human-meaningful (fine for opaque keys).
- Random UUIDs carry no time-ordering — we have `createdAt`/`happenedAt` for that.

Negative:

- Random UUIDs scatter on large indexes (locality) — irrelevant at this scale; revisit only if the app ever approaches millions of rows (then consider Option 3).

### Pros and Cons of the Options

#### Option 1 — Keep Better Auth default

- Good, because: zero configuration; auth works out of the box.
- Neutral: the format is custom (not a standard) — no tooling cares at this scale.
- Bad, because: domain tables need a per-table `$defaultFn` "remember to generate" tax — exactly the drift that produced this revision.
- Bad, because: keeping a non-standard format when the DB generates for free buys nothing.

#### Option 2 — UUID v4, generated by the database

- Good, because: a recognized standard; Postgres generates for free via `gen_random_uuid()`.
- Good, because: the auth config (`generateId: "uuid"`) matches, so auth and domain never diverge; no mixed-ID risk.
- Good, because: a DB-side default means no schema file can forget the ID generator.
- Neutral: still random — same locality profile as Option 1.
- Bad: none material.

#### Option 3 — UUID v7

- Good, because: time-ordered, ideal index locality at massive scale.
- Bad, because: needs a custom `generateId` everywhere and a default helper in Postgres; complexity with zero benefit at this scale. Revisit only if locality ever matters.

---

## 10. Open Questions (deferred, unresolved)

1. **Intensity storage granularity** — whether to store per-entry `intensity` (read = `SUM(intensity) GROUP BY date`) or a per-day aggregation table, once intensity display is actually built. Deferred until Phase 1 heatmap rendering.
2. **Heatmap intensity mapping rule** — how each value shape maps to an intensity level (e.g. capped minutes, "any done row", summed count, option presence). Pending the heatmap UI.
3. **Exact shape of future tracking types** — no plans today; the schema is designed to absorb them as added columns + guards.
