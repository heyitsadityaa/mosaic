# <Area> Decisions

_Status: Active_
_Date: YYYY-MM-DD_
_Scope: <one sentence on what this document covers — schema, APIs, auth, ops, ...>_

This document records the design brainstorms, tradeoffs, and decisions behind <area>. It exists so that future phases can revisit _why_ something was chosen, what alternatives were weighed, and where the thinking went wrong or right. Each section below is an independently readable MADR-style decision record.

> How to use this file: copy it to `docs/decisions/<area>-decisions.md`, replace the header, then add one numbered section per decision. Keep the section blocks you need and delete the rest — every block below is optional except **Context and Problem Statement** and **Decision Outcome**. Add new ADRs as `## N. <Title>` at the top of the numbered list, renumbering the rest, and update the index in `docs/decisions/README.md`.

---

## 1. <Decision Title>

### Context and Problem Statement

Why is this being decided, and what problem does the decision solve?

### Decision Drivers

- Low maintenance and tooling cost.
- <constraint that actually drives the choice>.

### Considered Options

1. **<Option A>** — one-line description.
2. **<Option B>** — one-line description.

### Decision Outcome

**Chosen: <Option B>.** <The reasoning in one or two sentences — the deciding factor, not a recap of the options.>

### Consequences

Positive:

- <what this unlocks or makes cheaper>.

Negative:

- <accepted tradeoff>.

### Pros and Cons of the Options

#### Option A

- Good, because: <reason>.
- Neutral: <observation that is neither good nor bad>.
- Bad, because: <reason>.

#### Option B

- Good, because: <reason>.
- Bad, because: <reason>.

---

## 2. <Decision Title — e.g. Explicit Rejection>

### Context and Problem Statement

<For rejected patterns: state why it warranted its own evaluation rather than dismissal.>

### Decision Outcome

**Rejected.** <The maths of the trade — what the option genuinely buys versus what it costs, and why that isn't worth it at this scale.>

### Consequences

- <what stands instead of the rejected option, and any later escape hatch>.

---

## 3. <Decision Title — e.g. a Choice With Edge Cases>

### Decision Outcome

**Chosen: <Option>.**

### Pros and Cons of the Options

#### Chosen option

- Good, because: <reason>.
- Bad, because: <the accepted product behavior, spelled out so it reads as a tradeoff, not a bug>.

#### Rejected option

- Good, because: <reason it was attractive>.
- Bad, because: <reason it was disqualified>.

### Edge cases enumerated (for future reference)

| Scenario | Behavior |
| -------- | -------- |
| <trigger> | <what happens> |

---

## 4. Evolution / Roadmap Note

### Decision Outcome

<For decisions that gate on phased rollout: what Phase 1 ships, what later phases add, and the mechanism that keeps the change cheap (e.g. "one column + one validation guard").>

---

## 5. Narrative — What I Was Thinking, and Where It Was Wrong

_(Kept so future-me can see the trail, including the missteps.)_

- **"<initial instinct>"** <Why it seemed right, and what the honest analysis showed>.

---

## 6. Open Questions (deferred, unresolved)

1. **<Question>** — context on when/where it will be resolved.