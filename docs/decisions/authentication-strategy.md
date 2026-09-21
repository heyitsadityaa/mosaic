# Authentication Strategy

_Status: Active_
_Date: 2026-09-20_
_Scope: Auth framework, provider strategy, session model, mobile OAuth flow, package boundary_

This document records the design brainstorms, tradeoffs, and decisions behind authentication for the habit heatmap application. It exists so that future phases can revisit _why_ something was chosen, what alternatives were weighed, and where the thinking went wrong or right. Each section is an independently readable MADR-style decision record.

---

## 0. Context and Requirements

- **Multi-client:** the Expo mobile app ships in Phase 1. A web landing (Next.js) and desktop app are planned. Every client must authenticate.
- **Backend not yet built:** the NestJS backend appears in the roadmap but does not exist yet — auth has to stand on its own from day one.
- **Existing DB decisions bind this one:** Postgres + Drizzle; the auth tables are our own, owned by Better Auth (see `database-decisions.md` §8); the server is the sole authority on the day-end lock (§5).
- **Small, self-hosted audience:** no email infrastructure, no billing, no orgs.
- **Timezone is captured at signup** (`user.timezone`, frozen — see `database-decisions.md` §5) and rides on every user creation.

---

## 1. Framework Choice: Why Better Auth

### Context and Problem Statement

We needed identity for a TypeScript monorepo already committed to Postgres + Drizzle, with a native mobile app as the first client. DIY, Auth.js, Passport, managed services, and Better Auth were all live candidates.

### Decision Drivers

- Framework-agnostic — the mobile client must not dictate the server framework.
- Must drop into existing Postgres/Drizzle without an external auth service.
- Schema ownership: the auth tables live in our own migrations (`packages/db`), so the DB decisions (IDs, timezone, indexing) apply to them uniformly.
- Type-safe surface between server and clients.
- Self-hosted; small audience; low maintenance budget.

### Considered Options

1. **DIY** — bcrypt/argon2 + hand-rolled sessions, tokens, CSRF, and provider adapters on top of Drizzle.
2. **Auth.js (NextAuth)** — Next.js-centric; awkward to host outside Next and nonstandard for Expo-native flows.
3. **Passport.js** — middleware from the Express era; you assemble sessions, state, and OAuth yourself.
4. **Managed (Firebase / Clerk / Supabase)** — identity, tables, and session control leave our Postgres.
5. **Better Auth** — TypeScript-first, framework-agnostic, Drizzle adapter, owned schema, built-in sessions and social providers.

### Decision Outcome

**Chosen: Better Auth (v1.7.5)**, via `drizzleAdapter(db, { provider: "pg" })` and the `@better-auth/expo` plugin. This is the current implementation in `packages/auth/src/auth.ts` and matches the "auth tables are Better Auth's" assumption in `database-decisions.md` §8.

### Consequences

Positive:

- Auth schema travels in our own migrations (`packages/db/src/schema/auth-schema.ts`), so DB decisions (UUID IDs, timezone, indexing) apply uniformly to it.
- Session and provider logic comes correct by default — including PKCE and `state` handling (Decision 4).
- The exported `Session` type is inferred from the server config, so clients can't drift from the session shape.

Negative:

- Better Auth is young; minor-version API churn needs pinning and review on upgrade.

### Pros and Cons of the Options

#### DIY

- Good, because: zero dependencies; total control.
- Bad, because: sessions, CSRF/state, PKCE, provider adapters, and type safety are all reimplemented — exactly the surface where subtle security bugs live.

#### Auth.js

- Good, because: mature and popular.
- Bad, because: Next.js-first; non-Next and native-app integration is second-class.

#### Passport

- Good, because: huge provider catalog.
- Bad, because: you assemble the security-sensitive glue yourself; typing is weak; session logic is your problem.

#### Managed

- Good, because: fastest to start.
- Bad, because: user data and session control leave our Postgres; the DB decisions in this repo are built around owning the schema.

#### Better Auth

- Good, because: framework-agnostic, Drizzle-native, self-hosted, typed end-to-end, schema we own.
- Bad, because: young project; upgrade churn (negative above).

---

## 2. Provider Strategy: Google OAuth Only, No Email/Password

### Context and Problem Statement

Which sign-in methods ship in Phase 1? Google-only was the instinct; email/password is the conventional alternative — but it carries a whole pipeline with it.

### Decision Drivers

- No email-sending infrastructure exists and none is wanted in Phase 1 (verification, resets).
- Small, presumably Google-using audience; one-tap on native.
- Passwords expand the attack surface (brute force, credential stuffing, phishing) for zero Phase-1 benefit.
- Provider additions must stay cheap later.

### Considered Options

1. **Google OAuth only** — one provider, verified emails, no password column in use.
2. **Email + password** — Better Auth's `emailAndPassword` plugin plus hashing, resets, and verification email delivery.
3. **Both** — everything above plus a second integration surface.

### Decision Outcome

**Chosen: Google OAuth only.** The `account.password` column exists in the schema but stays inert (as noted in `database-decisions.md` §8). Users without a Google account are locked out in Phase 1 — accepted at this scale.

### Consequences

- Signup ships with zero infrastructure: no SMTP, no hashing, no reset flows, no verification emails.
- Google supplies verified emails, which the app needs for identity anyway.
- Future providers (GitHub, or Better Auth's `emailAndPassword` plugin) are configuration additions — the schema column already exists, so no migration.

### Pros and Cons of the Options

#### Google only — Chosen

- Good, because: no auth infrastructure; smaller attack surface; one-tap mobile sign-in; PKCE-native.
- Bad, because: no login path for users without a Google account (accepted at this scale).

#### Email + password

- Good, because: universal email sign-in.
- Bad, because: hashing, reset tokens, verification, and email delivery are all required before anything works; adds phishing/brute-force surface.

#### Both

- Good, because: covers every user.
- Bad, because: every cost of email/password plus an extra integration surface to maintain and test, for a Phase-1 audience that overwhelmingly has Google.

---

## 3. Session Model: Stateful (Database Sessions) vs Stateless (JWT)

### Context and Problem Statement

Better Auth defaults to database sessions (opaque token in the `session` table) and offers JWT mode as an alternative. The roadmap explicitly asks for the impact of this choice on the application.

### Decision Drivers

- Sessions must be revocable on demand (sign out everywhere, kick a device).
- The server is the integrity authority (the day-end lock of `database-decisions.md` §5) — authentication must not weaken that.
- Requests at this scale are trivial; per-request DB lookups are sub-millisecond.

### Considered Options

1. **Stateful (database sessions)** — opaque token, unique-indexed lookup on `session.token`, per-row `expiresAt`.
2. **Stateless (JWT)** — signed token, no storage, revocation only via blacklist or expiry.

### Decision Outcome

**Chosen: stateful database sessions** (Better Auth default; unchanged in `auth.ts`). For a consistency-tracking app this is the disqualifier: a leaked JWT keeps writing entries until it *expires*, which would let it write through the day-end lock — the server must stay the authority.

### Consequences — impact on the application

- Every authenticated request costs one unique-indexed lookup on `session.token` (sub-ms at this scale — the same conclusion as `database-decisions.md` §1 on micro-optimizations).
- Sign-out and device revocation are immediate and global.
- Session expiry is per-row, server-controlled; the mobile client stores the session securely via the expo plugin.
- JWT's win (no DB round-trip, portable across services) is moot at this scale and costs us revocation.

### Pros and Cons of the Options

#### Stateful — Chosen

- Good, because: instant revocation; per-session expiry; no token secret rotation or blacklists.
- Bad, because: one DB read per authenticated request (accepted, negligible here).

#### Stateless (JWT)

- Good, because: no session lookup; portable across services (edge, microservices).
- Bad, because: revoked-but-unexpired tokens keep working — incompatible with server-enforced data integrity.

---

## 4. OAuth Flow: PKCE (Automatic, Non-Negotiable)

### Context and Problem Statement

The mobile client redirects back to the app via a **custom URI scheme** (`myapp://`, in `trustedOrigins`). Deep links into custom schemes are an interception surface on Android/iOS. The authorization `code` travels through that redirect — what stops a hijacker from redeeming it?

### Decision Drivers

- The client is effectively a public client: no secret it holds can be trusted on-device.
- Google mandates PKCE for native-app clients.
- Security must be correct by default, not by remembering to configure it.

### Decision Outcome

**Chosen: PKCE, and it's automatic.** Verified in the installed Better Auth source: the social sign-in route generates a 128-char random `codeVerifier`, stores it inside the `state` token (which also guards CSRF — a short-lived token expiring after 10 minutes), sends `code_challenge` to Google, and validates it at callback. The `code_challenge` parameter is reserved in Better Auth's schema — it cannot be overridden or disabled.

### Consequences

- Nothing to configure; the flow is secure by construction.
- `code_verifier` lives only in the app (secure storage via the expo plugin), so an intercepted code is unredemptable without it.
- The `state` token doubles as CSRF protection for the whole OAuth round-trip.

---

## 5. Package Boundary: Auth Outside NestJS

### Context and Problem Statement

The roadmap plans a NestJS backend (not yet in the repo). Auth could live as a Nest module, as a shared package, or as a separate service. The canvas already places `betterauth` at `packages/`.

### Decision Drivers

- Auth is needed immediately for mobile; NestJS is not built — auth cannot wait on it.
- Multiple clients (mobile, web, future desktop) and the backend must share one auth surface.
- NestJS should verify sessions, not implement identity — keep handlers/controllers/services business-only.
- The monorepo boundary pattern is already set: shared building blocks in `packages/` (`@mosaic/db`, `@mosaic/auth`), apps compose them.

### Considered Options

1. **Nest module** — auth constructed inside the future backend.
2. **Shared package `@mosaic/auth`** — framework-agnostic `betterAuth()` instance plus typed client; mountable anywhere.
3. **Dedicated auth microservice** — same package, deployed as its own server.

### Decision Outcome

**Chosen: Option 2 — shared package.** This is the current implementation: `packages/auth` exports the `auth` instance (server) and a `createClient` factory (client), with the `Session` type inferred from the server. Where it's *mounted* (standalone server vs inside NestJS) is deliberately open — both are one-liners later.

### Consequences

- NestJS will consume `auth.api.getSession(...)` for verification; identity logic never enters its controllers/services.
- The exported `Session` type is a cross-package contract (client, backend share it).
- Env config moves with the package (`.env.example`, secret/Google client validation at import).
- Independent deployment, rate-limiting, and monitoring of the auth surface are possible without touching the business API.

### Pros and Cons of the Options

#### Nest module

- Good, because: one deployable.
- Bad, because: auth would be blocked until NestJS exists; couples identity to one framework's lifecycle; if the web client or a standalone worker ever needs auth, it must reach inside the backend.

#### Shared package — Chosen

- Good, because: usable by every client now and the backend later; framework-agnostic; keeps identity out of NestJS.
- Bad, because: it's a contract that must be versioned deliberately (one exported `Session` type for all consumers).

#### Dedicated microservice

- Good, because: hard isolation and scaling of the auth surface.
- Bad, because: a second deployable, cross-service session contracts, and network hops for every verification — overkill while the whole app fits on one Postgres.

---

## 6. As-Built Implementation (canonical config)

Ground truth from `packages/auth`, matching the decisions above:

- **Framework:** Better Auth v1.7.5; `drizzleAdapter(db, { provider: "pg" })` over `@mosaic/db`.
- **Mobile:** `expo()` plugin; `trustedOrigins` = `myapp://`, plus `exp://` wildcards in development.
- **Providers:** Google only (`socialProviders.google`), client ID/secret from env, validated at module load.
- **Sessions:** Better Auth default — opaque token rows in `session`, computed `expiresAt`; PKCE/`state` handled internally (Decision 4).
- **User model:** `additionalFields.timezone` (string, required, default `"UTC"`) — feeds the frozen-timezone lock of `database-decisions.md` §5.
- **IDs:** `uuid` columns with `pg_catalog.gen_random_uuid()` defaults, and `advanced.database.generateId: "uuid"` in the auth config — consistent with `database-decisions.md` §8/§9.

---

## 7. Auth Endpoints and the Authorization Boundary

### Context and Problem Statement

Better Auth answers *who* is calling; it does not answer *what they may touch*. Two things were left unspecified: where the auth endpoints actually live on the wire, and how "authenticated" turns into "authorized" once the backend exists.

### Decision Outcome

**Endpoints — Better Auth owns `/auth`, unversioned.** The application authors no auth controller and defines no auth endpoints. Better Auth serves its routes at the default unversioned mount `/api/auth`, carved out of the `/api/v1` versioning prefix: the app versions only the contracts it authors, and Better Auth's route set is pinned by the dependency version in the lockfile, not by our versioning scheme. The `/api/v1/auth` alternative was weighed and rejected — analysis in `api-design.md` §3.

**Authorization — a query-level contract, downstream of `getSession`.** The global auth guard resolves the session from the forwarded request headers (`auth.api.getSession`); controllers and services see only `session.user.id`. Everything beyond authentication is the API's data layer: every resource lookup is scoped to the session user, so another user's resources are simply not found (404), and the ownership chain `user -> habit -> entry` is enforced in the queries, never by the URL or the client. Details in `api-design.md` §4.

### Consequences

- NestJS identity code is one guard plus `session.user`; no auth logic ever enters business controllers (Decision 5 holds).
- The mount point (standalone server vs inside NestJS) remains open — see Open Questions below; either way the `/auth` contract lives at its own unversioned path and the API contract (§3 of `api-design.md`) is unchanged.

---

## 8. Open Questions (deferred, unresolved)

1. **Session lifetime policy** — default `expiresAt` and idle-timeout behavior for mobile; revisit with the accounts/device-management UI.
2. **Device management / "log out everywhere"** — enabled by stateful sessions (Decision 3), UI not built.
3. **Auth server mount point** — standalone server vs inside NestJS once the backend exists (Decision 5 keeps both open).
4. **Phase-3 providers** — email/password (schema column already inert-ready) or additional OAuth providers; revisit when the audience grows past Google-only.