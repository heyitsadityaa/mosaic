# Decision Log

This directory is the project's **MADR log** — Markdown Any Decision Records. Each record captures a design decision in a form that future phases can revisit: why something was chosen, what alternatives were weighed, and where the thinking went wrong or right.

## Convention: one themed document per area

Each themed doc collects the decisions for one area as independently readable, numbered sections (see `database-decisions.md`, which this document follows). This was a deliberate choice over one-file-per-ADR: areas surface few but tightly-coupled decisions, and keeping them together preserves the narrative trail across phases.

- **Database** → `database-decisions.md`
- **Authentication** → `authentication-strategy.md`
- **API** → `api-design.md`

## Adding a new decision record

1. Copy `template.md` to `docs/decisions/<area>-decisions.md` (or reuse the existing doc for that area).
2. Replace the header: `# <Area> Decisions`, `_Status_`, `_Date_` (YYYY-MM-DD), `_Scope_`.
3. Add the new decision as `## N. <Title>` and renumber subsequent sections so the list stays sequential.
4. Every record needs **Context and Problem Statement** and **Decision Outcome**. Everything else is optional: `Decision Drivers`, `Considered Options`, `Consequences`, `Pros and Cons of the Options`, a `Narrative` section, and an edge-case table.
5. Mark rejected ideas explicitly — **Rejected.** in the Decision Outcome — and give them a section of their own rather than burying them in prose.
6. Update the index table below.

## Conventions

| Field         | Rule                                                            |
| ------------- | --------------------------------------------------------------- |
| Status        | One of `Active`, `Proposed`, `Superseded` (add the superseding ref if superseded) |
| Date          | ISO `YYYY-MM-DD`                                                |
| Scope         | One sentence bounding what the doc covers                       |
| Titles        | `## N. <Title>` — aim for a verb-ish, outcome-bearing title     |
| Option lists  | `#### Option N` nested bullets: `Good, because:` / `Neutral: / Bad, because:` |
| Accepted costs| Write in Consequence as tradeoffs, not bugs                     |
| Separators    | `---` between every section                                     |

## Index

| Area          | Document                                              | Status   | Date       |
| ------------- | ----------------------------------------------------- | -------- | ---------- |
| Database      | [database-decisions.md](./database-decisions.md)       | Active   | 2026-09-16 |
| Authentication| [authentication-strategy.md](./authentication-strategy.md) | Active   | 2026-09-20 |
| API           | [api-design.md](./api-design.md)                       | Active   | 2026-09-20 |