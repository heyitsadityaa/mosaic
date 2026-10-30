# API Design

_Status: Active_
_Date: 2026-09-20_
_Scope: HTTP API contract for the habit heatmap application — endpoint inventory, path/versioning conventions, identity and authorization model, write contract, read model (heatmap and stats), status code conventions, and the operational health check_

This document records the design brainstorms, tradeoffs, and decisions behind the HTTP API of the habit heatmap application. It exists so that future phases can revisit _why_ something was chosen, what alternatives were weighed, and where the thinking went wrong or right. Each section below is an independently readable MADR-style decision record.

---

## 0. Context and Requirements

The API serves one client in Phase 1 — the Expo mobile app — with web and desktop planned later. Every endpoint must be traceable to a screen on the roadmap canvas:

- **Dashboard** — renders multiple heatmaps (a handful of habits).
- **Habit / heatmap screen** — per-habit day-grid; today's cell is a live, partial sum that grows through the day.
- **Analytics page** — per-habit streak, total time, average/day, with a year/month/week dropdown.
- **Today's edit view** — the logged sessions for today; each row can be fixed or removed (append-only, see below).
- **Profile / settings** — identity surface.

Two decision documents bind everything downstream:

- `database-decisions.md` §1/§4: entries live in one `habit_entries` table, written **append-only** — each row is a timestamped event, a day is an aggregation. Multiple sessions per day are expected.
- `database-decisions.md` §5: the **day-lock** — once midnight passes in the user's (frozen) timezone, past days become read-only, future days are never writable, and the server is the sole authority on "today".
- `authentication-strategy.md` §3/§5: **stateful sessions**, auth owned by Better Auth in `packages/auth`, consumed by the backend via `auth.api.getSession` and a global guard.

### Client vs Server responsibility

The whole API splits responsibilities down one line: the client renders and optimistically updates; the server is the only source of truth for identity, ownership, the calendar, and the day-lock.

| Concern            | Client                                                           | Server                                                                        |
| ------------------ | ---------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Identity           | never transmits a user id; holds the session via the expo plugin | resolves session from headers; scopes every query to it                       |
| Ownership          | treats 404 as "gone for me"                                      | excludes other users' rows by construction                                    |
| Calendar / "today" | shows the local day as a hint                                    | derives `entryDate` from the session's frozen timezone                        |
| Writes             | sends only the value; optimistic insert                          | stamps the day, applies the lock, rejects violations                          |
| Read model         | renders day-cells and a few numbers                              | aggregates (`GROUP BY`, window queries) — never ships raw history for display |

---

## 1. Endpoint Inventory: Eleven Endpoints, Every One on a Screen

### Context and Problem Statement

The instinct is to map the API to the tables (`habits` × N + `habit_entries` × N). That over-generates: endpoints should be derived from **screens**, not tables.

### Decision Outcome

**Chosen: an inventory rule — an endpoint exists only if a screen calls it**, producing eleven endpoints: habits ×5, entries ×4, plus heatmap and stats reads (see §7). Notably rejected: a bare `GET /entries/:id` — no screen fetches an entry standalone; entries are always rendered within a habit context (today's session list, per-habit history). Same reasoning as Database Decision 1: no code paths for things that never happen.

### Consequences

- The client makes one round trip per screen interaction; no endpoint exists only because a table does.
- Fewer endpoints now means fewer contracts to version, document, and keep in sync with OpenAPI later.
- One deliberate exception exists: `/health` (see §9) — an operational endpoint no screen calls, kept outside the inventory rule and outside the versioned prefix.

---

## 2. Path and Versioning Convention

### Context and Problem Statement

Every endpoint needs a stable, uniformly-derived URL and a promise about breaking changes. The initial format instinct was `/api/v1/api-endpoints(plural)` (auth, users, habits, habit_entries) — with the cracks already visible: `auth` is not a plural noun, and `habit_entries` drifted into `habits_entries` and `entires` within three drafts.

### Considered Options

1. **Path versioning `/api/v1/*`** — the version lives in the URL.
2. **Header versioning** — the version travels in a request header.

### Decision Outcome

**Chosen: path versioning — `/api/v1/` on everything we author**, plus the naming rule:

- Resources are **plural lowercase nouns, no underscores** in URLs.
- A URL segment **may differ from the table name**, and that mapping is deliberate — `habit_entries` (table) ↔ `entries` (resource).
- **Path parameters are named for their resource** — `:habitId` always refers to `habit.id`; `:id` always refers to `habit_entries.id`.
- **Spellings are frozen** once written; drift is a convention violation, not a typo.

Path versioning was chosen for its explicitness — URLs are debuggable, cacheable, and testable without headers — and header versioning was rejected as introspection-heavy for a single-client API. The one exception is auth (§3), which is versioned by its dependency, not by us.

### Pros and Cons of the Options

#### Path versioning — Chosen

- Good, because: visible in logs, curl, and shareable URLs; cache keys are self-describing.
- Bad, because: every future breaking change must re-prefix or re-version — the standard cost of the format.

#### Header versioning

- Good, because: the URL stays clean.
- Bad, because: invisible in logs and shareable links; clients must track an arbitrary header; accidental clashes between "version of my app" and "version of the API".

---

## 3. Auth Surface: Better Auth Owns `/auth` — the Versioning Carve-out

### Context and Problem Statement

Better Auth already ships its own HTTP routes (sign-in, callback, session, ...) and the expo plugin retains the session on the device. The question: do those routes live under the versioned prefix — is `/api/v1/auth` possible and desirable?

### Considered Options

1. **Uniform: mount Better Auth under `/api/v1/auth`** (via its `basePath` option).
2. **Carve-out: keep Better Auth at its default unversioned `/api/auth`.**

### Decision Outcome

**Chosen: Option 2 — Better Auth owns `/auth`, unversioned.** The application authors _no auth controller and no auth endpoints_; a global guard delegates to `auth.api.getSession`, forwarding the request headers. `/auth` is a deliberate carve-out from `/api/v1`: **the app versions only the contracts it authors.** Better Auth's route set is already versioned — by the dependency itself — and pinned by the lockfile. Our `/v1/` stamp on it would be a promise we can't keep: their major-version changes own the breaks.

### Pros and Cons of the Options

#### Uniform `/api/v1/auth`

- Good, because: one coherent surface; the OpenAPI/reference view includes everything.
- Bad, because: you'd be versioning a contract you don't control; upgrading Better Auth would either silently break your own v1 promise or strand `/api/v2/auth` next to `/api/v1/habits`.

#### Carve-out `/api/auth` — Chosen

- Good, because: honest versioning claim; dependency-pinned; zero config beyond the default mount.
- Bad, because: the versioning story has one documented exception (this section).

---

## 4. Identity and Ownership: the Session Is the Identity

### Context and Problem Statement

The first draft put `:userId` in every path (`/habits/:userId/:id`, ...) with a hand-waved "server must verify it matches the session". Authentication (who is calling) is Better Auth's job; authorization (may they touch _this_ resource) is ours. The open question: does the URL carry the user at all?

### Decision Outcome

**Chosen: `userId` is banished from the URL — the session is the identity.**

- **Authentication** is the global Better Auth guard: no session → **401**, with no business code involved.
- **Authorization is folded into the data layer**: every resource lookup is _scoped to the session user_. `WHERE ... AND userId = <session>` means another user's row is simply not found → **404**. There is no separate load-then-compare-then-403 choreography.
- **The URL is a hint, the DB is truth**: even with `:habitId` in the path, the effective checks are data-derived (the entry's actual `habitId`, the habit's actual `userId`) compared against the session. Path params are fail-fast sugar.
- **Ownership chain `user -> habit -> entry`** is enforced at each hop in the queries — a client cannot reach another user's habit or entry by supplying any id.

### Consequences

- The client transmits no identity at all — the whole "does path-userId == session-userId?" failure state is structurally impossible.
- The day-lock (DB §5) and ownership compose cleanly: reads are scoped by user, writes are scoped by user _and_ locked to today.
- 404 vs 403: "you can't see it" and "it doesn't exist" are the same response by design — no existence leakage, one error pattern to handle.

---

## 5. Write Contract: Clients Never Send Dates

### Context and Problem Statement

The day-lock (DB §5) makes only "today in the user's timezone" writable. What does the client send? The naive design includes a `date` in the body and rejects anything that isn't today.

### Decision Outcome

**Chosen: the client sends only the value; the server derives and stamps the day.** `entryDate` is computed server-side from the session's frozen timezone; `happenedAt` is captured by the server at insert. Write bodies for Phase 1 (`timer`) contain nothing but the value field.

- **Creation is always `POST` (append-only, DB §4)** — every session is a new row consulted by the heatmap aggregation. There is no upsert anywhere; "save a second session" is a second POST by design.
- **Updates/removal use PATCH/DELETE on an existing `:id`** and never create a row (see §6).
- Values are **"set", not "increment"** — a retried `{ durationSecs: 900 }` after a timeout lands on 900 either way, so the flip-clock's save button is retry-through-safe.
- The midnight race (submit at 23:59:59.9, land after 00:00) is rejected per the lock — the server's clock is law. The client mitigates with an optimistic insert and reconciles on rejection.

### Edge cases enumerated

| Scenario                   | Behavior                                                                       |
| -------------------------- | ------------------------------------------------------------------------------ |
| Two sessions, same day     | two POSTs, two rows; the day-cell sums both                                    |
| Retried save after timeout | idempotent — the value is re-set, nothing accumulates                          |
| Midnight race              | rejected (server clock is law); optimistic UI reconciles                       |
| Edit of yesterday's row    | rejected — the `:id` exists but the lock forbids it (status code pending, §12) |

---

## 6. Status Codes and the PATCH Choice

### Context and Problem Statement

The first draft listed `202 or 204` and `200, 202, or 204` — option lists, not decisions. And the update verb was drawn as PUT. Both needed the one-pass test.

### Decision Outcome

**Chosen conventions:**

- **201** create (with the row).
- **204** update and delete (no body) — **200** only when the handler deliberately returns the resource.
- **401** unauthenticated (the auth guard). **404** not-found / not-yours (scoped queries).
- **202 is rejected outright**: it means "accepted, will process later" — this API has no async writes, only synchronous SQL.

**Chosen verb: PATCH for updates.** The reversal history belongs in the Narrative (§10); the deciding analysis is here.

### The change-the-count example (number habit: 5 -> 10)

A `number` habit's row _is_ `{ count }` — one writable value field per habit (the immutable `valueType`). So the payload is `{ count: 10 }` **under either verb**: "full representation" and "change set" coincide for entries. The verbs only differ on the _other_ writable columns — habits have `name` + `color`, so a rename under PUT must resend `color` (or strict-PUT resets it); under PATCH a rename sends `{ name }` and color survives. That, not payload size, is why PATCH wins.

Column fate is governed by the **writable-fields contract**, not by the verb:

| Column                                 | After PATCH (or PUT) count 5->10 | Why                                                                                                                                     |
| -------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `count`                                | `10`                             | the whole point — the only writable value field                                                                                         |
| `happenedAt`                           | unchanged                        | the recorded _instant of the event_ — an append-model fact, not editable; changing it would decouple from the frozen `entryDate` bucket |
| `createdAt`                            | unchanged                        | creation fact, immutable by definition                                                                                                  |
| `updatedAt`                            | now                              | exactly its job — the server sets it on every successful update, verb-agnostic                                                          |
| `entryDate`, `id`, `habitId`, `userId` | unchanged                        | server-owned; `entryDate` is the frozen bucket                                                                                          |

### Consequences

- A consistent, single-line status table for the whole API; clients parse one pattern.
- Server-managed fields (`createdAt`, `updatedAt`, `happenedAt`, `entryDate`, `archivedAt`) are excluded from all request bodies and never writable through them.

---

## 7. Read Model and Computation Location

### Context and Problem Statement

The dashboard shows heatmaps; the analytics page shows stats. Where do those numbers come from — and where are they _computed_? The worry that drove the question: "server-side computation means spinners and delays on the client".

### Considered Options

1. **Server-aggregated reads** — `GET /habits/:habitId/heatmap` and `GET /habits/:habitId/stats`; Postgres does the math, the client renders.
2. **Raw-entries + client aggregation** — ship history, let the client `GROUP BY`.

### Decision Outcome

**Chosen: Option 1 — server-computed reads, returned as render-ready shapes:**

- `GET /habits/:habitId/heatmap?from&to` — array of `{ date, value }` day-cells (server `GROUP BY entryDate`; the endpoint Database Decision §4 already named).
- `GET /habits/:habitId/stats?period=year|month|week` — streak, total, average-per-day for the period (SQL window/aggregate queries).

**The latency reframe — the wait is the network, not the CPU.** Whatever the design, a habit's history is not on the phone; a screen that needs it _waits for a round trip_. Client-side aggregation cannot remove that wait — it can only change what crosses the wire:

- Server-aggregated payloads are **constant-size**: a year of heatmap = 365 cells (a few KB); lifetime stats = a handful of numbers. They do not grow as the app ages.
- Raw-history payloads are **linear in history** — thousands of rows by year three, shipped to the device so the client can run a `GROUP BY` the database already had an index for.

Then the day-lock (DB §5) turns this into cacheability: **past cells are immutable, so only today is ever live.** Fetch a habit's history once, cache it forever; the only re-fetchable datum in the whole app is today's cell. A "spinner" is strictly a first-ever-open cold-start cost, then never again.

The honest concession, spelled out: if the app went **local-first today**, the device would own the data and the computation (this is exactly the Phase-3 plan); the server endpoints then serve the web client and cold-start sync. Relocating where the math runs — not redesigning the shapes.

### The spinner register (the complete set)

1. Cold start — session resolution → the splash screen covers it (§3).
2. First-ever open of a habit's history — one heatmap fetch → skeleton; cached forever.
3. A write racing midnight — optimistic insert, reconciling on reject (§5).

The dashboard stands as N parallel heatmap requests for N habits — acceptable at "a handful of habits" scale; a combined read is a deferred option (§12).

---

## 8. DELETE Semantics: Archive for Habits, Hard for Entries

### Context and Problem Statement

The schema has `archivedAt` on `habit`, but the delete in the route table was drawn as a plain row removal. With lifetime analytics ("total time since the heatmap was created") in Phase 1, the meaning of delete matters.

### Decision Outcome

**Chosen: soft archive for habits, hard delete for entries.**

- `DELETE /habits/:habitId` — sets `archivedAt`; the habit leaves the active list and `GET /habits` excludes archived rows by default, but entries and their history survive for analytics.
- `DELETE /entries/:habitId/:id` — **hard removal of a today-only row** (per §5). No archiving of events; the day-lock bounds it anyway.
- Same HTTP verb, **204** for both — the archive/hard distinction is invisible at the wire level.

Hard-deleting the habit (CASCADE the history) was rejected: it silently destroys the measurement trail the analytics page is built on, for zero user benefit.

---

## 9. Health Check: the Second Carve-out

### Context and Problem Statement

Deployments and uptime monitors need a probe that answers "is the service up" without a session. The canvas's backend checklist lists health checks explicitly, but the endpoint inventory (§1) has none — and the inventory rule ("an endpoint exists only if a screen calls it") has no slot for an endpoint no screen calls.

### Considered Options

1. **`GET /api/v1/health`** — versioned, unauthenticated; part of the API surface.
2. **`GET /health`** — root-level and unversioned; a carve-out beside `/api/auth`.

### Decision Outcome

**Chosen: Option 1 — `GET /api/v1/health`, versioned and unauthenticated.** It is part of the API surface but remains outside session-protected business routes: probes carry no session, so a guarded health route would answer 401 instead of "up", and a monitor could not tell "down" from "locked out". Healthy → **200** with a minimal body (`{ status: "ok" }`); unhealthy → **503**. The API prefix and version make the route consistent with the rest of the application-owned contract.

### Pros and Cons of the Options

#### Versioned `/api/v1/health` — Chosen

- Good, because: load balancers and orchestrators get a truthfully unauthenticated probe while the route remains under the API's standard prefix and version.
- Bad, because: a future breaking change to the response contract may require versioning the health route as well.

#### Root `/health`

- Good, because: infrastructure gets a short, stable path outside application versioning.
- Bad, because: it creates another unversioned carve-out and diverges from the API's documented path convention.

### Consequences

- Phase 1 is **liveness only** (the process responds). Deep readiness (checking DB connectivity) is deferred to the ops/deployment node on the backend checklist, not locked here.
- No client code ever calls `/api/v1/health`; the mobile app does not learn it exists.

---

## 10. Final Phase 1 Endpoint Table

Canonical, matching the decisions above. Phase 1 exercises `timer` only; `binary`/`number`/`options` come online as columns + validation guards (DB §6).

| Method   | Path                                      | Purpose                                          | Client sends                            | Returns                        |
| -------- | ----------------------------------------- | ------------------------------------------------ | --------------------------------------- | ------------------------------ |
| `POST`   | `/api/v1/habits`                          | create habit (immutable `valueType`)             | `{ name, valueType, options?, color? }` | 201 + habit                    |
| `GET`    | `/api/v1/habits`                          | list my habits (excludes archived)               | —                                       | 200 + habits                   |
| `GET`    | `/api/v1/habits/:habitId`                 | habit detail                                     | —                                       | 200 + habit                    |
| `PATCH`  | `/api/v1/habits/:habitId`                 | rename / recolor                                 | `{ name?, color? }`                     | 204                            |
| `DELETE` | `/api/v1/habits/:habitId`                 | archive (soft)                                   | —                                       | 204                            |
| `GET`    | `/api/v1/habits/:habitId/heatmap?from&to` | day-cells                                        | —                                       | 200 + cells                    |
| `GET`    | `/api/v1/habits/:habitId/stats?period=`   | streak / total / avg                             | —                                       | 200 + stats                    |
| `POST`   | `/api/v1/entries/:habitId`                | append a session                                 | `{ durationSecs }`                      | 201 + row                      |
| `GET`    | `/api/v1/entries/:habitId?from&to`        | raw rows (today's edit view, history)            | —                                       | 200 + rows                     |
| `PATCH`  | `/api/v1/entries/:habitId/:id`            | fix today's row value                            | `{ durationSecs }`                      | 204                            |
| `DELETE` | `/api/v1/entries/:habitId/:id`            | remove today's row                               | —                                       | 204                            |
| `GET`    | `/api/v1/health`                          | liveness probe — versioned, unauthenticated (§9) | —                                       | 200 + `{ status: "ok" }` / 503 |

Invariant to type-check every line: **no `userId` anywhere, no dates on writes, authorization by scoped queries, create is always POST / edit-and-delete address an existing entry `:id`.** The `/api/v1/health` row is the documented liveness exception (§9): no session and no owner.

---

## 11. Narrative — What I Was Thinking, and Where It Was Wrong

_(Kept so future-me can see the trail, including the missteps.)_

- **"`PUT /habits/:userId/:id` etc."** The first draft put a user id in every path and only _wondered_ about verifying it. The unlock was separating authentication from authorization: Better Auth answers who; the queries answer what-you-may-touch. Once `userId` was banished, the "does the path match the session?" failure state stopped existing. The URL is a hint — the DB is truth.
- **"`202 or 204`"** Listing options instead of choosing. 202 has a meaning ("accepted, will process later") that this synchronous API never uses. The boring default (204) was right all along.
- **"`habit_entries` / `habits_entries` / `entires`"** Three spellings of one resource across three drafts — proof the naming convention wasn't pinned. Hence: spellings frozen, underscore-free plural nouns, and an explicit "URL may differ from table" rule.
- **"The day-lock is intentional; better than the user entering data and getting an error."** The client-time instinct — let the user pick the calendar day and reject nonsense — was rejected in favor of the server stamping the day. The payoff nobody saw coming: the write body shrinks to `{ value }` and there is no date field to disagree about. Constraints that remove contract surface are wins.
- **"PATCH removes the previous data, so use PUT."** False, and the record says so plainly: PATCH only touches the fields you send. The real analysis (count 5->10) showed payloads coincide for entries and diverge only for multi-field habits — and there, PUT's full-replace is the annoyance (resend `color`), not PATCH. The flop landed on PATCH.
- **"Server-side aggregation means spinners and a slow client."** The honest reframe: the client waits on the _network_ either way; server aggregation shrinks the payload and — via the day-lock — makes past reads cacheable forever. Only today is ever live; the spinner register has exactly three entries, two of them cold-start, one a rare race.

---

## 12. Open Questions (deferred, unresolved)

1. **Window defaults** — `from`/`to` default for `heatmap`; `period` default for `stats`. Deferred to rendering work.
2. **Entries pagination** — likely none at Phase 1: lists are date-bounded range scans over an indexed `(habitId, entryDate)`. Revisit if open-ended history browsing appears.
3. **Archived-habit restore** — an unarchive endpoint or a `GET /habits?status=` view. The data layer supports it today (§8); no UI asks for it yet.
4. **Day-lock rejection status** — likely 409 Conflict; settles with the error-handling node, not here.
5. **Auth mount point** — standalone auth server vs inside NestJS; `authentication-strategy.md` Open Questions keeps both open; this doc only fixes the unversioned `/api/auth` contract.
