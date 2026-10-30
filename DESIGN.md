# MOSAIC — Habit Design Specification

Backend-aligned companion to `DESIGN.md`.
This file keeps the **monochrome neo-brutalist design system** from `DESIGN.md`
and applies it to the **multi-habit Phase 1 product documented in `docs/`**.
It is intentionally a separate specification so both product directions can be
compared side by side.

`DESIGN.md` = one activity, one heatmap, one Today list.
`DESIGN-HABITS.md` = many habits, per-habit heatmaps, per-habit analytics,
Dashboard, editable Today sessions.

Every section is self-contained. To build, paste this file into a design session
backed by any canvas/design MCP (Penpot, Paper, Figma, or similar) and say:
**"Implement §X only"** (e.g. "implement §3.9 only").
Any design change = edit this file, then re-run the affected section.
Tool-specific details (node IDs, file references) live in the tool session,
never in this file.

Status legend: **[DONE]** verified · **[REUSE]** verified asset from `DESIGN.md` ·
**[PARTIAL]** started, resume instructions inside · **[TODO]** not started.

---

## 0. Product

### 0.1 The product this file describes

- **App**: MOSAIC — a multi-habit heatmap tracker. Phase 1 logs habits with a
  focus timer; binary / number / options habits are deferred.
- **Phase 1 scope**: Google-only sign-in, timer habits, per-habit heatmaps,
  per-habit stats (year / month / week), today-only session edits, archive.
- **Flow**:
  Splash → Sign in (Google only) → **Habits** tab ⇄ **Analytics** tab ⇄
  **Profile** tab.
  Tap a habit card → **Habit detail**. Play starts the timer and immediately
  shows the **minimized timer** (PiP, 05). Expanding the PiP opens **Fullscreen**
  in landscape (06); minimizing returns to portrait **screen + PiP** (05).
  There is no modal timer screen.
  Habit detail also opens **Today edit** and **Habit settings** dialogs.
  The Habits tab opens the **New habit** dialog.
- **Platforms/boards**: mobile, 390×844 portrait for every screen except
  **06 Timer Fullscreen**, which is 844×390 landscape. Every screen in Light + Dark.
  Light / Dark / System follows the OS; boards show Light and Dark.
- **North star**: color is data. The heatmap ramp
  (green-300 → green-500 → green-700) is the only chroma in the product, plus
  the existing Profile avatar ring and the Google "G".
  **No habit colors are rendered** — `habit.color` exists in the backend but is
  reserved and unused in this design.

### 0.2 Comparison with `DESIGN.md`

| Dimension | `DESIGN.md` | `DESIGN-HABITS.md` |
|---|---|---|
| Product | Single-activity focus timer | Multi-habit tracker |
| Home | One aggregate ACTIVITY heatmap | Habits dashboard with per-habit cards |
| Heatmap | One 13-week activity grid | Per-habit 13-week grids + mini cards |
| Tabs | ACTIVITY / PROFILE | HABITS / ANALYTICS / PROFILE |
| Habit management | None | Create, rename, archive |
| Today | Read-only list | Editable per-habit list |
| Stats | 4H goal, CELLS, profile totals | Per-habit streak / total / average, year-month-week |
| Timer | One current session + stopwatch | Habit-scoped local timer, no stopwatch |
| Color | Green ramp + profile accent | Same; no habit colors rendered |
| Fullscreen | Portrait | **Landscape**, with minimize to PiP |
| Backend fit | Conceptual | Screen-by-screen endpoint mapping |

### 0.3 What this spec refuses to invent

These appear in `DESIGN.md` or the roadmap but are **not supported by the
documented Phase 1 backend**. They are deliberately absent from the screens:

- **Daily goal** (`OF 4H GOAL`) — no goal field or endpoint.
- **CELLS count** — no such metric.
- **Cross-habit aggregate stats** — stats are per habit.
- **All-time stats** — API supports year / month / week only.
- **Mini stopwatch** — no stopwatch model.
- **Persisted active session** — no active-session endpoint; the timer is local.
- **Habit color UI** — the color field is not rendered.
- **Editable settings** — no settings write endpoints.
- **Archived-habit restore** — no restore endpoint.
- **Past-day edits** — the day-lock makes past days read-only.

Unsupported items are listed again in §7.4 so nothing gets silently invented
during design.

### 0.4 Backend sources

- `docs/decisions/api-design.md` — endpoint contract.
- `docs/decisions/database-decisions.md` — habits, entries, day-lock.
- `docs/decisions/authentication-strategy.md` — Google-only auth, sessions.
- `docs/overview.canvas` — Phase 1 feature roadmap.

---

## 1. Design system

### 1.1 Mood & direction

- **Mood**: monochrome neo-brutalist / Swiss editorial — pure white × pure black.
- **Direction**: a strict achromatic interface — pure white in light, pure black
  in dark, one editorial type ramp, hard-edged controls, hairlines, no shadows.
  The only chroma is the heatmap's green intensity ramp, the Profile accent, and
  the Google \"G\" on the sign-in button, so color reads as data, never decoration.
- **Radius as deliberate tension**: hard-edged actions sit inside soft raised
  containers. The 12px card and 20px sheet are a controlled extension of the
  brutalist language, not an exception; the role-based radius scale must not
  drift.
- **Rejected**: phosphor/terminal (green belongs to the data); mineral/graphite
  (tinted greys dilute the monochrome rule and fight the heatmap); glossy
  surfaces, colored error states, animated tab indicators.
- **No semantic color**: success, error, and destructive states use ink/chalk,
  weight, fill, border, and iconography — never red/green.

### 1.2 Palette (design tokens)

| Token | Value | Role |
|---|---|---|
| --color-ground-light | #FFFFFF | Light ground (never tinted) |
| --color-ground-dark | #000000 | Dark ground (never tinted) |
| --color-surface-light | #F4F4F4 | Raised surface on light |
| --color-surface-dark | #111111 | Raised surface on dark |
| --color-line-light | #E6E6E6 | Hairline separator, light |
| --color-line-dark | #1F1F1F | Hairline separator, dark |
| --color-ink | #000000 | Primary text/icons on light |
| --color-chalk | #FFFFFF | Primary text/icons on dark |
| --color-muted | #6B6B6B | Secondary text, light (AA ≥12px) |
| --color-muted-dark | #9B9B9B | Secondary text, dark |
| --color-heat-low | #86EFAC | Heatmap bucket 1 (green-300) |
| --color-heat-mid | #22C55E | Heatmap bucket 2 (green-500) |
| --color-heat-high | #15803D | Heatmap bucket 3 (green-700) |
| --color-cell | #EDEDED | Empty heatmap cell, light |
| --color-cell-dark | #1A1A1A | Empty heatmap cell, dark |

**Color budget**: heat ramp = heatmaps + legends + the Habit detail streak
square. Profile gets only the avatar gradient ring (lime→sky). Google "G" brand
colors on the sign-in button are the only other sanctioned color.
**No habit color is rendered. No other color anywhere. Ever.**

### 1.3 Typography

- `--font-sans` **Inter** — all UI (weights 100–900 available).
- `--font-mono` **JetBrains Mono** — clock digits, durations, and timer stats only
  (max weight 800).
- Scale: `--text-display` 64 · `--text-title` 24 · `--text-headline` 17 ·
  `--text-body` 15 · `--text-label` 13 · `--text-caption` 12.
  Screens use 30/24 (titles), 17/600 (names), 15 (body), 11–12 caps labels.
- Weights: 400 regular · 500 medium · 600 semibold · 700 bold · 800 extrabold
  (mono digits).
- Tracking: `--tracking-tight` −0.03em (display), `--tracking-caps` 0.08em
  (small caps labels use 0.08–0.12em; tracked caps get `text-indent` = tracking
  for optical centering).
- Leading: `--leading-display` 72 · `--leading-title` 30 · `--leading-body` 22.
- Caps labels: 10–12px, weight 500–700, tracking 0.08–0.12em — the Swiss
  editorial voice.

### 1.4 Spacing / radius / misc tokens

- Spacing (4pt): 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 (`--spacing-1…16`).
- Radius: `--radius-cell` 3 · `--radius-card` 12 · `--radius-full` 999.
  `--radius-sheet` 20 is reserved for future soft containers; dialogs and drawers use 0.
- `--opacity-scrim` 60% · `--breakpoint-mobile` / `--container-mobile` 390px.
- Landscape safe area: 44px horizontal padding on notched iPhones.

### 1.5 Component rules

- Full-width rectangular buttons: **sharp** (radius 0). Play/pause/stop:
  **circles**. Habit cards / PiP: `radius-card`. Dialogs: **centered floating card**
  (width 342px), sharp corners (radius 0), borderless container (no outer border),
  no grabber, no shadow. Bottom-sheet drawers: **sharp top corners** (radius 0); no rounded sheet.
- Structure via **1px hairlines** (`--color-line-*`), not boxes or shadows.
  No shadows. No gradients except the Profile avatar ring.
- Inputs: sharp 1px ink/chalk border, radius 0, focus 2px ink/chalk.
  Validation is ink-only: 2px border + 12/600 helper text, never red.
- Page padding: 24px horizontal (heatmaps and headers share this lane).
- Every portrait screen in the tab shell (03, 04, 05, 07, 08) ends with a tab
  bar + home indicator. Splash and Sign in have no tab bar; dialogs/sheets hide
  it; 06 is landscape and has no tab bar.
- Fullscreen (06) is the only landscape board; it uses no status bar, no tab bar.
- **No habit color swatches, no color picker, no colored charts.**

---

## 2. Shared components

### 2.1 Status bar

Standard iOS status bar (time, signal, Wi-Fi, battery). Never hand-draw.
Colors: black on light boards, white on dark boards.
Hide only on **Splash** and **06 Timer Fullscreen (landscape)**.
**Reuse**: duplicate an existing status-bar instance rather than re-pasting the
markup, then recolor via the tool's style API (text color, svg fill).

### 2.2 Mark & wordmark

- **Mark (64px)**: SVG viewBox 0 0 60 60; 3×3 tile grid, squares 16px at
  x/y ∈ {0,22,44}. Diagonal cells filled: (0,0) (22,22) (44,44) (44,0) (0,44).
  Off-diagonals outlined: stroke-width 2, rects 14px at (23,1) (1,23) (45,23)
  (23,45). Fill/stroke = ink (light) / chalk (dark).
- **Mini mark (18px)**: the same 3×3 mosaic as the 64px mark, scaled 0.3× —
  five filled tiles (~4.8px) on the diagonals and four outlined tiles (~4.2px,
  0.75px stroke). Used in the Sign in brand row and empty states.
- **Wordmark**: "MOSAIC", Inter 700. In-app only: 13px, letter-spacing
  0.16em. Splash shows the 64px mark alone, no wordmark.

### 2.3 Flip clock slab (core component)

- Cell: 46×72, radius 4, flex centered, overflow hidden, position relative.
- Digit: JetBrains Mono 38/800, line-height 1, letter-spacing −0.02em.
- Seam: absolutely positioned 1.5px line at exact middle, full width
  (light: bg ink, digit chalk, seam rgba(255,255,255,0.3); dark: bg chalk,
  digit ink, seam rgba(0,0,0,0.25)).
- Pair: two cells, gap 4. Colon: 14px-wide block, two 5px dots, gap 14,
  ground color. Groups joined with gap 6. Six digits + 2 colons = 328px wide
  (fits 342 inner width).
- **Big variant (Fullscreen)**: cells 72×112, radius 6, mono 60/800, seam 2px,
  colon dots 7px gap 20, pairs gap 5, groups gap 8. Use it verbatim on screen 06;
  the portrait 342px ceiling does not apply in landscape (≈511px wide).
- Clock format everywhere: **hh:mm:ss**. Durations (session rows, PiP) are
  always **hh:mm:ss** too — never bare mm:ss — so the unit is unambiguous.

### 2.4 Timer controls

- Primary circle 64px: bg ink (dark: chalk); pause glyph = two 6×22 bars
  ground-contrast; play glyph = path `M6 3.5 L16.5 10 L6 16.5 Z` filled
  ground-contrast.
- Secondary stop circle 52px: outlined 1.5px ink (dark: chalk), 16px filled
  square glyph.
- Press feedback: scale(0.97), 150ms cubic-bezier(0.23,1,0.32,1).

### 2.5 Heatmap (signature component)

The heatmap is **per habit**. The dashboard shows a compact variant; Habit detail
shows the full variant.

**Full variant (Habit detail)**

- Section shell: margin-top 28, padding 20px 24px 0, border-top 1px line.
- Header row: `ACTIVITY` 12/700 tracking 0.12em |
  `LAST 3 MONTHS` 11/500 muted.
- Month row (margin-top 16): 34px label spacer + relative container 308px;
  labels 10px caps muted: JUL left:0, AUG left:96px, SEP left:192px, OCT right:0.
- Grid (margin-top 8): 7 rows (Mon–Sun). Each row: flex, gap 4,
  margin-bottom 4 — weekday label slot 34px (show MON/WED/FRI at rows 0/2/4,
  10px muted, line-height 20) + 13 cells 20×20 radius 3. Row width = 342 exactly.
  13 weeks ≈ last 3 months (never full 365 cells on Habit detail).
- Today's cell gets border 1.5px solid ink (dark: chalk).
- Legend (margin-top 14, right-aligned, gap 6): `LESS` + four 12×12 radius-2
  swatches (empty, green-300, green-500, green-700) + `MORE`, all 10px caps
  muted.

**Mini variant (Habit card)**

- 184×74 grid: 17 columns × 7 rows, cells 8×8, gap 3, radius 2.
- No weekday labels, no month labels, no legend.
- Same level colors; today's cell gets 1px ink/chalk border.
- Empty cells use `--color-cell` / `--color-cell-dark`.

**Heatmap levels (proposed design mapping)**

This is a **design proposal** pending the backend intensity mapping decision
(`database-decisions.md` §10). For timer habits, sum all of a day's sessions:

| Level | Daily duration | Color |
|---|---|---|
| 0 | 0 / no entry | `--color-cell` (dark: `--color-cell-dark`) |
| 1 | 1s – 29m 59s | `--color-heat-low` |
| 2 | 30m – 1h 29m 59s | `--color-heat-mid` |
| 3 | 1h 30m+ | `--color-heat-high` |

- The API returns `{ date, value }`; the client maps `value` (duration seconds)
  through this table. If the backend later returns a ready-made level, the visual
  table stays the same.
- The legend on the full heatmap remains `LESS / MORE`; the component spec board
  documents the numeric legend.
- **Design mock data**: production screens render API values. Canvas boards use
  a deterministic pseudo-random generator seeded per habit; force one empty
  break column for visual rhythm, and fill the current week Mon–Thu only.
  The sample Deep Work habit keeps the last 12 days active so its `12d` streak is
  visually consistent.

### 2.6 Tab bar & home indicator

- Tab bar: margin-top auto, border-top 1px line, padding 14px 24px 0,
  three flex-1 tabs, centered, gap 8.
- Active: 8px **filled** square (ink/chalk) + label 11/700 tracking 0.1em
  ink/chalk.
- Inactive: 8px **outlined** square (stroke muted) + label 11/500 muted.
- Tabs: `HABITS`, `ANALYTICS`, `PROFILE`.
- Labels at 11px/0.1em fit the 114px tab slot; do not abbreviate.
- Home indicator: flex centered, bar 140×5 radius-full, ground-contrast color
  (Splash: padding-bottom 8; others: padding 10px 0 8px after tab bar).
- The tab bar is hidden in Habit detail? **No** — Habit detail is a stack screen
  inside the HABITS tab, so the tab bar stays at the bottom (or is pinned while
  the body scrolls). It is hidden in fullscreen, dialogs, and sheets.

### 2.7 Avatars

- Small (Habits/Analytics header): 30px circle, bg ink, initials "AS" 11/700
  chalk (dark: inverted).
- Large (Profile): 72px. Outer ring `linear-gradient(135deg, #84CC16, #0EA5E9)`
  as 3px ring (padding 3, radius-full); inner circle bg ink (dark: chalk),
  initials "AS" 24/700 chalk (dark: ink).

### 2.8 Google button

Full-width, height 56, radius 0, bg ink (dark: chalk), centered, gap 12:
Google "G" SVG 18px (viewBox 0 0 24 24, standard four brand paths
#4285F4 / #34A853 / #FBBC05 / #EA4335) + "Continue with Google" 16/600
ground-contrast.

### 2.9 Mini timer card (portrait PiP)

- 168×76, bg surface (dark: #000 + hairline), radius-card 12, padding 12.
- Top row: 6px status square + habit label `DEEP WORK` 10/600 tracking 0.1em
  muted; expand glyph 12px top-right. Running = filled square; paused =
  outlined square + label prefix `PAUSED ·`.
- Timer: `02:31:25` JetBrains Mono 20/800 ink (dark: chalk), margin-top 6.
- No shadow, no scrim. Separation by surface + 1px hairline only.
- Positioned absolute right 20, bottom = tab bar height + 20
  (approx. 92px from screen bottom), never over the tab bar or home indicator.
- Whole card is tappable; tap restores Fullscreen. Accessibility label:
  “Restore focus timer.”
- Persists over the tab shell (Habits dashboard, Habit detail, Analytics,
  Profile) while the timer runs; the board shows it over the Habits dashboard.
- While visible, scrollable content reserves 96px bottom padding.
- If the timer is stopped/ended, the card disappears.

### 2.10 Habit card (dashboard)

- Width 342, height 164, bg surface (dark: #111), radius-card 12, padding 16.
- No shadow, no color swatch. Light surface distinguishes it from the white
  ground; dark uses surface + optional hairline.
- Top row: habit name 17/600 lh24 (truncate to one line); overflow glyph 18px
  on the right.
- Meta row (margin-top 4): `12D STREAK` 10/600 caps muted left;
  today's total `02:30:55` JetBrains Mono 13/700 right-aligned on the same
  top line, sharing the overflow glyph's right edge (x=319 inside the card).
  The glyph sits above the duration, not beside it.
- Bottom row (margin-top 14): mini heatmap 184×74 left; play circle 40 right
  (bg ink, chalk triangle in light; inverted in dark).
- Whole card taps to Habit detail. Play circle starts the timer and shows the
  minimized timer (05); it does not open detail.
- Press feedback scale(0.99) on the card, scale(0.97) on the play circle.
- No aggregate “today” number on the dashboard; each card shows its own habit.

### 2.11 Stat block

- Two-column row for Habit detail: `STREAK` / `TODAY`.
- Label: 10/600 caps, tracking 0.1em, muted.
- Value: 24/700 Inter for counts (`12d`), JetBrains Mono 20/800 for durations
  (`02:30:55`, `06:12:00`). Values sit on one line; columns are flex-1.
- Border-top and border-bottom 1px line; padding 14px 0.
- The streak value gets one 8px heat-low square before it, vertically centered.

### 2.12 Segmented control (Analytics period)

- 342×36, radius 0, border 1px ink (dark: chalk), flex row, no gaps.
- Three equal segments: `YEAR`, `MONTH`, `WEEK`.
- Active segment: bg ink (dark: chalk), label chalk (dark: ink), 10/700 caps,
  tracking 0.1em.
- Inactive: ground, label muted, 10/600 caps.
- Each segment has a 1px right divider; final segment no divider.
- Press feedback scale(0.98) on the segment.

### 2.13 Habit selector (Analytics)

- 342×52, border-bottom 1px line, flex row space-between, centered vertically.
- Left: `HABIT` 10/600 caps muted; selected name `Deep Work` 15/600 ink/chalk
  immediately after (gap 12).
- Right: chevron-down glyph 14px, muted.
- Tapping opens the habit-picker sheet: 390-wide sheet, list of habits, active
  row has an 8px filled square and 15/600 name; inactive rows 15/400 muted.
  No archive/edit actions in this picker.

### 2.14 Form field

- Label: 10/700 caps, tracking 0.1em, muted; margin-bottom 8.
- Input: 342×52, radius 0, border 1px ink (dark: chalk), bg ground, padding
  0 14, Inter 15/500 ink/chalk.
- Focus: border-width 2px, no glow.
- Placeholder: 15/400 muted.
- Error: border-width 2px + 12/600 ink/chalk helper below; no color.
- Text is never centered in inputs.

### 2.15 Dialog & Sheet

**Dialog (03A, 04A, 04B, confirmations)**
- Scrim: `rgba(0,0,0,0.6)` over the underlying screen.
- Placement: floating, horizontally and vertically centered on the 390×844 canvas.
- Dimensions: width 342 (24px side margins); height fits content (max 540px, scrollable body if content overflows).
- Shell: all corners sharp (radius 0). Light: bg #FFFFFF. Dark: bg `--color-surface-dark` (#111111). Borderless container (no outer border stroke; contrast provided by 60% scrim). No shadow.
- Grabber: **none** (grabbers belong to draggable sheets only).
- Header row: padding 14px 20px, title 11/700 caps tracking 0.12em + close X 20px glyph (right-aligned). Tapping close X or tapping the scrim dismisses the dialog.
- Body: padding 20px 20px 24px; inputs and sharp rectangular action buttons at the bottom. No home indicator inside the dialog (indicator stays on the ground screen behind scrim).
- Entrance: `scale(0.96) → scale(1.0)` + opacity `0 → 1`, 180ms cubic-bezier(0.23,1,0.32,1); scrim fades in 200ms. Reduced motion: instant opacity swap.

**Sheet (drawer fallback / Habit picker)**
- Scrim: `rgba(0,0,0,0.6)` over the underlying screen.
- Sheet: anchored to bottom, all corners square (0); top corners are pointed.
  Light: bg #FFF. Dark: bg `--color-surface-dark` + border-top hairline.
- Grabber: 36×5 radius-full muted, centered, margin-top 10.
- Header row: padding 14px 24px, close X 20px on the left, title 11/700 caps
  tracking 0.12em centered, optional right action.
- Body padding 24px; buttons at the bottom with 24px bottom padding + home
  indicator.
- Entrance: translateY 100% → 0, 250ms cubic-bezier(0.23,1,0.32,1); scrim
  fades 200ms. Reduced motion: instant.

### 2.16 Session row

- 342 wide, padding 12px 0, border-top 1px line.
- Left: `ENDED 11:31` 11/600 caps muted, tracking 0.08em.
- Right: duration `02:30:55` JetBrains Mono 15/700 ink/chalk + overflow glyph
  18px, gap 12.
- Tapping the row or the overflow opens the session edit state. No swipe
  gestures.
- Rows are today-only in this design. Past sessions are not shown as editable.
- Empty state: `NO SESSIONS TODAY` 11/600 caps muted + `START A FOCUS SESSION`
  15/400 muted margin-top 4.

### 2.17 State components

**Empty state**
- Centered block, max-width 280, gap 8.
- Mark 32px (or mini mark 18px) + title 17/600 + body 15/400 muted +
  sharp primary button if there is an action.

**Loading skeleton**
- Surface blocks with no shimmer; use a slow opacity pulse 1 → 0.6 → 1,
  1.2s ease-in-out, only if reduced motion is off.
- Cards use `--color-surface-*`; text bars use `--color-line-*`; heatmap
  placeholders use `--color-cell-*`.
- Dashboard: three 342×164 skeleton cards; keep the header, tab bar, and
  `+` action. Replace the count with a 60×14 bar.
- Habit detail: keep the known title, focus row, and clock; skeleton the stat
  values, a 13×7 grid of heatmap cell placeholders, and two 52px session rows.
- Analytics: keep the title, avatar, and period control; skeleton the selected
  habit value, 223×56 total, and two stat values.
- Today dialog: four 52px skeleton rows fill the fixed 358px body.
- Skeleton only for known, blocking layouts. Keep cached content during a
  refresh; never replace a list that is already on screen.

**Loading spinner**
- Full screen: 32px, 1.5px stroke, 270° arc. Track `--color-line-*`, arc
  ink/chalk. 900ms linear; reduced motion uses a static arc. Center it on the
  ground with `LOADING` 11/600 caps muted 12px below. Keep the status bar; no
  tab bar.
- Button: 16px centered in the existing control. Replace the label, keep the
  button width and height, and do not add the 40% disabled opacity. Mark the
  control `aria-busy` and keep it non-interactive until the request settles.
- Text action: 12px spinner + `RETRYING…` 11/700 caps. Icon button: 16px
  spinner replacing the glyph.
- Use a spinner when the layout is unknown/blocking or after a button press.
  A known layout uses a skeleton; a button-triggered write uses the inline
  spinner rather than a skeleton.

**Error banner**
- 342×52, border 1px ink (dark: chalk), padding 12, flex row space-between.
- Left: `COULDN'T LOAD` 11/700 caps + optional detail 12/400 muted.
- Right: `RETRY` 10/700 caps underlined.
- No red. No icon color.

**Toast**
- Ink slab (dark: chalk slab with ink text), radius 0, padding 12 16,
  position above the tab bar, 12/600 message + optional `DISMISS` 10/700 caps.
- Used for save failures, archive completion, and midnight rejection.

### 2.18 Overflow & confirmation

- Overflow glyph: three 4px dots vertical, 18px, ink/chalk.
- Opens the Habit settings dialog (§3.7), which contains the name field and the
  archive action. There is no separate overflow menu.
- `ARCHIVE HABIT` is a 342×52 sharp outlined destructive row; its confirmation
  dialog uses the title `ARCHIVE DEEP WORK?`, body “History is kept, but the
  habit disappears from your dashboard. Restore is not available in Phase 1.”
  Actions: `CANCEL` outlined, `ARCHIVE` filled.
- Delete session confirmation: `DELETE THIS SESSION?` centered dialog with `CANCEL` /
  `DELETE SESSION`.

### 2.19 Timer state model

The timer is a **local UI state** shared by screens 05 (PiP) and 06
(Fullscreen). It is not a backend resource. Pressing play starts the timer and
shows 05 immediately; there is no modal timer screen.

- States: `idle` → `running` ⇄ `paused` → `saving` → `saved` / `error`.
- `elapsedSecs` is monotonic and survives orientation, modal, and tab changes.
  Compute it from `startedAt` / `pausedAt` timestamps, not from interval ticks.
- Only one timer runs at a time. Starting another habit while a timer is active
  opens a monochrome confirmation: `A TIMER IS ALREADY RUNNING`, body
  `Deep Work · 00:42:18` 15/400 muted, actions `OPEN CURRENT` filled and
  `END CURRENT` outlined. `OPEN CURRENT` opens the current timer (05 PiP;
  expand for 06); `END CURRENT` saves the current timer, then opens the
  requested timer; a failed save stays on the dialog/sheet.
- On fullscreen minimize, the same timer state moves to the PiP.
- On stop, the client sends `{ durationSecs }` to `POST /api/v1/entries/:habitId`.
- The API has no idempotency key. Design must disable double-submit while
  `saving`; on a lost response, show a retry affordance and warn that a retry
  may duplicate the session until the backend adds idempotency.
- Midnight rejection: show `THIS SESSION CROSSED MIDNIGHT AND WASN'T SAVED`
  and return to Habit detail without a row.

---

## 3. Screens

### 3.1 Splash — [DONE]

- Boards: `01 Splash · Light` bg #FFFFFF · `01 Splash · Dark` bg #000000.
- Full-bleed: **no status bar**. Contains only:
  1. Mark 64px, centered alone in the ground. No wordmark.
  2. Home indicator (padding-bottom 8).
- Expected geometry: mark x=163..227, y=390..454, center (195,422);
  indicator at y=831; exact 844 fit.
- Behavior: resolves the Better Auth session; routes to Habits or Sign in.

### 3.2 Sign in — [DONE]

- Boards: `02 Sign in · Light` bg #FFFFFF · `02 Sign in · Dark` bg #000000.
- Structure (page padding 24): status bar → Brand row (mini mark + wordmark,
  padding 8px 24px 0) → Copy block (`margin-top:auto`):
  headline `Sign in or create your account` 30/700 lh36 tracking −0.02em
  max-width 300; sub `Track focus, build streaks, see your year in cells.`
  15/400 lh22 muted max-width 280 margin-top 12 → Actions (padding 40px 24px 0):
  Google button (§2.8) + fine print `By continuing, you agree to the Terms of
  Service and Privacy Policy.` 12/400 muted center max-width 272 margin 16 auto 0
  → home indicator (padding 24px 0 8px).
- Google only; no email/password. On failure, show a monochrome error banner
  below the button: `COULDN'T SIGN IN` + `RETRY`.

### 3.2A Illustration studies (not placed) — [DONE]

- Fourteen separate 300×300 artboards in the study area below the app screens:
  one sign-in concept plus two directions for each tab, every one in Light + Dark.
- **Sign in** — **Heatmap Horizon**: 17×13 cell field with a monochrome level
  wave. This is the only sign-in study kept from the first round.
- **Habits**:
  1. **Cadence** — full-bleed 1px staff and irregular marks; one solid beat.
  2. **Chain** — overlapping open frames receding diagonally; one solid frame.
- **Analytics**:
  1. **Strata** — horizontal bands with one vertical cut line; two solid bands.
  2. **Signal Fold** — one continuous stepped hairline with a single solid node.
- **Profile**:
  1. **Aperture Ring** — a cropped 1px ring, one focal square, one connecting rule.
  2. **Index** — offset card outlines stacked like a personal record; one solid card.
- The previous Mosaic Field, Focus Dial, and Session Stack studies were removed;
  they read as icons rather than illustrations.
- All boards use named vector primitives, not flattened SVG, and stay monochrome.
  Motion notes live outside the artboards. Do not place a study on 02, 03, 07,
  or 08 until one direction is selected.

### 3.3 Habits dashboard — [DONE]

- Boards: `03 Habits · Light` bg #FFFFFF · `03 Habits · Dark` bg #000000.
- Structure, in order:
  1. Status bar (§2.1).
  2. Header (padding 14px 24px 0): left `THU · 15 OCT` 11/600 tracking 0.1em
     muted (sample date; runtime uses the session’s frozen timezone); right
     Avatar 30px `AS` (§2.7).
  3. Title row (padding 24px 24px 0, row space-between, align end):
     `HABITS` 30/700 lh36 tracking −0.02em; right 40×40 sharp outlined square
     with 18px plus glyph. Tap = New habit dialog (03A).
  4. Count (padding 8px 24px 0): `3 HABITS` 11/600 caps tracking 0.1em muted.
  5. Habit list (padding 20px 24px 0, gap 12): three habit cards per §2.10.
  6. Tab bar (§2.6, HABITS active) → home indicator.
- Sample cards:
  - `Deep Work` / `12D STREAK` / `02:30:55` today / mini heatmap with today high.
  - `Reading` / `4D STREAK` / `00:30:00` today / mini heatmap with today mid.
  - `Gym` / `0D STREAK` / `00:00:00` today / mini heatmap with today empty.
- Empty state (no habits): mini mark 18px + `NO HABITS YET` 17/600 +
  `Create a habit and start logging focus.` 15/400 muted + `CREATE HABIT`
  sharp filled 342×56. No tab bar change.
- Loading: three skeleton cards.
- Error: error banner above the list; keep cached cards if available.
- Interactions:
  - Tap card → Habit detail.
  - Tap play → start that timer and show the minimized timer (05), or the
    §2.19 second-timer confirmation if another timer is active.
  - Tap `+` → New habit dialog.
  - Overflow on card opens Habit settings dialog.
- Data: `GET /api/v1/habits`; per-card `GET /api/v1/habits/:id/heatmap?from&to` and
  `GET /api/v1/habits/:id/stats?period=month` (or the displayed stat). N parallel
  requests are accepted per API §7.
- Dark inversions: chalk text, muted-dark, line-dark, surface-dark cards,
  inverted play circle, cell-dark empties, chalk today-border.
- PiP: if a timer is minimized, screen 05 overlays this board; the base board
  does not show the PiP.

### 3.4 New habit dialog (03A) — [DONE]

- Boards: `03A New habit · Light` / `· Dark` — 390×844 with the Habits board
  behind + scrim; the centered dialog is the focus.
- Dialog geometry: floating card, width 342, height 328, centered horizontally
  and vertically in the 390×844 viewport (parentX=24, parentY=258). All corners
  sharp (0). Light: bg #FFFFFF (borderless). Dark: bg `--color-surface-dark`
  (#111111, borderless). Separation from background by surface against 60% scrim.
  No grabber, no shadow, no home indicator inside dialog.
- Dialog content:
  1. Header row (padding 14px 20px, border-bottom 1px line): `NEW HABIT`
     11/700 tracking 0.12em left; close X 20px glyph right. Tap X or scrim closes.
  2. Intro (padding 16px 20px 0): `Start with a name. You can rename or archive it later.`
     15/400 lh22 muted.
  3. Field `HABIT NAME` (§2.14, margin-top 16), placeholder `Deep Work`, max one line.
  4. Type row (margin-top 16): label `TYPE` 10/700 caps muted; value
     `TIMER` 15/600 + `PHASE 1` 10/600 caps muted right. Fixed row, not a picker.
     Copy below: `Tracking type can't be changed after creation.` 12/400 muted.
  5. Primary `CREATE HABIT` 302×52 sharp filled ink (dark: chalk), 16/600
     ground-contrast (margin-top 20, margin-bottom 20). Disabled when name is empty.
- Validation: empty name → `ENTER A NAME` 12/600 under the field; border 2px.
  If the API rejects a duplicate name, show the same monochrome error with
  `A HABIT WITH THIS NAME ALREADY EXISTS`.
- Data: `POST /api/v1/habits` with `{ name, valueType: "timer" }`; do not send color.
- While saving, replace the `CREATE HABIT` label with a 16px spinner; keep the
  button 302×52 and full contrast. Disable close/scrim dismissal until the
  request settles.
- On success: close dialog, add card to dashboard, navigate to Habit detail.
  On failure: keep the dialog open, show error, re-enable the button.
- No color picker. No habit-type picker beyond the fixed `TIMER` row.

### 3.5 Habit detail — [DONE]

- Boards: `04 Habit detail · Light` bg #FFFFFF · `04 Habit detail · Dark`
  bg #000000.
- Structure, in order:
  1. Status bar.
  2. Header row (padding 14px 24px 0): back chevron 20px left;
     habit name `Deep Work` 24/700 tracking −0.02em; overflow glyph 18px right.
  3. Stats row (margin-top 16 per §2.11): two equal columns,
     `STREAK 12d` (with heat square) and `TODAY 02:30:55`.
  4. Focus row (padding 20px 24px 0, row space-between): left `FOCUS SESSION`
     11 caps muted + `Deep Work` 17/600 lh24 margin-top 4; right play circle
     56 bg ink (dark: chalk) with chalk/ink triangle.
  5. Flip clock (margin-top 20px): `02:30:55` today’s total per §2.3
     (ink slabs, chalk digits). The 20px gap below the play button matches the
     20px above it. This is the habit’s today total, not a live session until
     the timer is started.
  6. Heatmap section per §2.5, full variant, 13 weeks, today’s border.
  7. Today list: header row `TODAY · 1 SESSION` 11/600 caps muted left +
     `EDIT` 10/700 caps right (opens 04A). One session row per §2.16:
     `ENDED 11:31` / `02:30:55`. Sample Deep Work total must equal the clock.
  8. Tab bar (§2.6, HABITS active) → home indicator.
- Scroll behavior: body scrolls; tab bar stays pinned. Board shows the first
  viewport with the first session row visible.
- Data:
  - `GET /api/v1/habits/:id`
  - `GET /api/v1/habits/:id/heatmap?from&to`
  - `GET /api/v1/habits/:id/stats?period=month`
  - `GET /api/v1/entries/:habitId?from&to` for today (local date range is display-only;
    the server derives write dates).
- Interactions:
  - Play → start this habit’s timer and show the minimized timer (05), or the
    §2.19 second-timer confirmation if another timer is active.
  - `EDIT` or a row → Today edit dialog (04A).
  - Overflow → Habit settings dialog (04B).
  - Back → Habits dashboard.
- States: loading skeleton; empty Today list; error banner.
- PiP: if a timer is minimized, the card overlays the bottom-right; the body
  reserves 96px.
- Dark inversions: all text/icon tokens swap; heatmap today border chalk;
  clock inverts; play circle inverts.

### 3.6 Today edit dialog (04A) — [DONE]

- Boards: `04A Today edit · Light` / `· Dark` — 390×844 with Habit detail
  behind + scrim; centered dialog floating in viewport.
- Dialog geometry: floating card, width 342, height 358, centered horizontally
  and vertically in the 390×844 viewport (parentX=24, parentY=243). All corners
  sharp (0). Light: bg #FFFFFF (borderless). Dark: bg `--color-surface-dark`
  (#111111, borderless). Separation from background by surface against 60% scrim.
  No grabber, no shadow, no home indicator inside dialog.
- Dialog content:
  1. Header row (padding 14px 20px, border-bottom 1px line): `TODAY'S SESSIONS`
     11/700 tracking 0.12em left; close X 20px glyph right. Tap X or scrim closes.
  2. Caption (padding 14px 20px 0): `Only today's sessions can be edited. Past days are locked.`
     12/400 muted.
  3. Rows per §2.16 (padding 12px 20px 0): `ENDED 11:31` / `02:30:55`. Tap row or overflow →
     edit state. If the habit has more sessions today, the dialog body scrolls internally (max-height 540).
  4. `EDIT` state (inline inside dialog): label `DURATION` 10/700 caps;
     `HH : MM : SS` masked field, 302×52, mono 20/800; `SAVE` 302×52 filled;
     `DELETE SESSION` outlined destructive row below.
  5. Delete confirmation per §2.18 (confirmation dialog).
- Data:
  - `GET /api/v1/entries/:habitId?from&to` (today)
  - `PATCH /api/v1/entries/:habitId/:id` `{ durationSecs }` → 204
  - `DELETE /api/v1/entries/:habitId/:id` → 204
- Behavior:
  - While a save or delete is in flight, replace the active button label with a
    16px spinner; keep 302×52 and full contrast.
  - Save updates the row and Habit detail totals; show a toast
    `SESSION UPDATED`.
  - Delete removes the row and updates totals; show `SESSION DELETED`.
  - Server day-lock rejection → monochrome error banner: `THIS SESSION IS
    LOCKED. ONLY TODAY CAN BE EDITED.`
  - Never show a date picker or a past-day list.
- Empty state: `NO SESSIONS TODAY` + `START A FOCUS SESSION` caption.
- Loading: keep the loaded Habit detail behind the 60% scrim; four skeleton rows
  fill the fixed dialog body. Error banner with `RETRY`.
- No color, no chart, no undo history.

### 3.7 Habit settings dialog (04B) — [DONE]

- Boards: `04B Habit settings · Light` / `· Dark` — Habit detail behind + scrim;
  centered dialog floating in viewport.
- Dialog geometry: floating card, width 342, height 338, centered horizontally
  and vertically in the 390×844 viewport (parentX=24, parentY=253). All corners
  sharp (0). Light: bg #FFFFFF (borderless). Dark: bg `--color-surface-dark`
  (#111111, borderless). Separation from background by surface against 60% scrim.
  No grabber, no shadow, no home indicator inside dialog.
- Dialog content:
  1. Header row (padding 14px 20px, border-bottom 1px line): `HABIT SETTINGS`
     11/700 tracking 0.12em left; close X 20px glyph right. Tap X or scrim closes.
  2. Field `HABIT NAME` (padding 16px 20px 0) prefilled `Deep Work`;
     `SAVE` 302×52 filled, disabled until changed.
  3. Divider + `ARCHIVE HABIT` 302×52 sharp outlined destructive row (margin-top 16).
  4. Caption (padding 12px 20px 20px): `History is kept, but the habit disappears from your dashboard.
     Restore is not available in Phase 1.` 12/400 muted.
  5. Confirmation dialog per §2.18: `ARCHIVE DEEP WORK?` + `CANCEL` / `ARCHIVE`.
- Data:
  - `PATCH /api/v1/habits/:id` `{ name }` → 204
  - `DELETE /api/v1/habits/:id` → 204 (soft archive)
- Behavior:
  - While a rename or archive request is in flight, replace the active button
    label with a 16px spinner; keep 302×52 and full contrast.
  - Rename success → toast `HABIT RENAMED`; update header and dashboard.
  - Archive success → close dialog, return to Habits dashboard, remove card.
  - No color picker, no type change, no restore.
- Errors: monochrome banner; keep the dialog open.

### 3.8 Timer Minimized (05) — portrait PiP — [DONE]

- Boards: `05 Timer Minimized · Light` / `· Dark` — 390×844 portrait.
- Entry: pressing play on any habit starts the timer and shows this screen
  immediately. There is no modal timer screen.
- Background: the **Habits dashboard** (screen 03), fully visible. No scrim,
  no dimming. The PiP floats above it; the underlying screen remains usable.
- Structure:
  1. Screen 03 behind (status bar, header, cards, tab bar, home indicator).
  2. Mini timer card per §2.9, bottom-right, 20px right, above the tab bar.
  3. Tab-root content and Habit detail reserve 96px bottom padding while the
     PiP is visible, so the last row can scroll above the card. The PiP may
     float over content at rest.
- ASCII layout:

```text
┌──────────────────────────────────────────┐
│  HABITS                               AS │
│                                          │
│  Deep Work                    Reading    │
│  ┌──────────────────┐  ┌───────────────┐ │
│  │ mini heatmap     │  │ mini heatmap  │ │
│  └──────────────────┘  └───────────────┘ │
│                                          │
│                    ┌──────────────────┐  │
│                    │ ■ DEEP WORK    ↗ │  │
│                    │ 00:42:18         │  │
│                    └──────────────────┘  │
│  HABITS      ANALYTICS      PROFILE      │
│              home indicator              │
└──────────────────────────────────────────┘
```

- Sample card: habit `DEEP WORK`, timer `00:42:18` (a running session, not
  today’s total), status square filled.
- Paused state: status square outlined; label `PAUSED · DEEP WORK`; timer
  static. Tap still restores.
- Tap card or expand glyph → Fullscreen (06), landscape, same elapsed time.
- The card persists across HABITS / ANALYTICS / PROFILE and Habit detail while
  the timer runs. The board shows it over HABITS.
- Stop is not available from the PiP; restore fullscreen to stop. Stopping or
  ending the timer removes the card.
- No drag, no resize, no shadow, no scrim.
- Data: no API calls while minimized; timer is local. On stop, POST entry.
- Dark inversions: card bg #000 + hairline, chalk timer/label; Home follows 03.

### 3.9 Timer Fullscreen (06) — landscape — [DONE]

- Boards: `06 Timer Fullscreen · Light` bg #FFFFFF ·
  `06 Timer Fullscreen · Dark` bg #000000.
- **Canvas: 844×390 landscape.** This is the only landscape board.
- Entering this screen locks the app to landscape; leaving/minimizing unlocks
  portrait. Timer state never resets during the rotation. Transition: portrait
  (03/04/07/08 + PiP) → landscape Fullscreen; minimize rotates back to portrait
  before the PiP appears.
- Full-bleed ground; **no status bar**, no tab bar. Keep the 140×5 home
  indicator at the bottom center.
- Layout (safe areas 44px horizontal, 14px top, 10px bottom):
  1. Top row: left `FOCUS SESSION · DEEP WORK` 11/700 tracking 0.12em
     ink/chalk; right minimize control.
  2. Minimize control: 18px inward-arrow/collapse glyph, 2px strokes, 44×44
     tap target, aligned to the right safe area. Accessibility label:
     “Minimize timer.” No visible label; the glyph is the existing collapse
     glyph from `DESIGN.md` §3.6.
  3. Center: big flip clock `00:00:00` per §2.3, centered horizontally and
     vertically (slightly above center to leave control room).
  4. `STARTED 9:41` 11/400 muted, centered, margin-top 24.
  5. Controls pinned low: a centered row with pause/resume 64 + sharp
     `END SESSION` button 342×52 (not full 844 width), label 11/700 caps
     tracking 0.12em, 24px gap. Keep the current control styling; the landscape
     layout is the only recomposition.
  6. Home indicator.
- Saving state: clock dims to 0.6; `SAVING…` 11/600 caps; END SESSION and
  minimize disabled.
- Failure: monochrome banner above controls with `RETRY` after the duplicate
  warning; keep the ended duration in local state until the save succeeds.
- ASCII layout:

```text
┌──────────────────────────────────────────────────────────────┐
│ FOCUS SESSION · DEEP WORK                      [minimize]    │
│                                                              │
│                      [ 00 : 00 : 00 ]                        │
│                         STARTED 9:41                         │
│                                                              │
│                  (pause)    [ END SESSION ]                  │
│                       home indicator                         │
└──────────────────────────────────────────────────────────────┘
```

- Behavior:
  - Minimize (top-right) → portrait screen + PiP (05). Timer keeps running.
  - End session → stop, save via API, unlock portrait, remove PiP, return to
    Habit detail with the new row.
  - Android back → minimize, not exit.
  - Rotate device while in fullscreen: stay landscape; on exit, portrait.
- Motion: orientation change is OS-level; fullscreen content fades/scales in
  ~180ms. Play shows the PiP with a quick fade/scale; minimize fades out and
  the PiP fades/scales in at bottom-right ~180ms after rotation. Reduced
  motion: instant.
- No color, no new gradients, no status bar. The flip clock is exactly the
  monochrome big variant from `DESIGN.md`.
- Dark inversions: chalk text, line-dark, big clock chalk slabs with ink
  digits, pause circle chalk with ink glyph.

### 3.10 Analytics — [DONE]

- Boards: `07 Analytics · Light` bg #FFFFFF · `07 Analytics · Dark`
  bg #000000.
- Structure, in order:
  1. Status bar.
  2. Header (padding 14px 24px 0): `ANALYTICS` 30/700 lh36 tracking −0.02em;
     right Avatar 30px `AS` (or date). Use the avatar for consistency with
     Habits.
  3. Habit selector per §2.13, margin-top 20: `HABIT` + `Deep Work` + chevron.
     Tap opens habit-picker sheet.
  4. Period control per §2.12, margin-top 16: `YEAR / MONTH / WEEK`.
     Default: `MONTH` (backend default is still an open question; this is the
     design proposal).
  5. Hero total (margin-top 28): `TOTAL FOCUS` 11/600 caps muted; value
     `06:12:00` JetBrains Mono 48/800 ink/chalk, margin-top 8. This is the
     selected period’s total from `stats.total`.
  6. Stats row (margin-top 28, border-top 1px line, padding 16 0):
     two flex-1 columns:
     `STREAK` 10/600 caps muted / `12d` 24/700;
     `AVG / DAY` 10/600 caps muted / `00:12:00` mono 20/800.
     Sample is coherent: 06:12:00 over 31 days = 00:12:00/day.
  7. Note (margin-top 24): `Stats are per habit. All-time totals and
     cross-habit rollups are not available in Phase 1.` 12/400 muted,
     max-width 300. This is a deliberate backend constraint, not a bug.
  8. Empty state: `NO DATA FOR THIS PERIOD` + `LOG A SESSION` (no chart).
  9. Loading: skeleton total block + stats row.
  10. Error: error banner with `RETRY`.
  11. Tab bar (`ANALYTICS` active) → home indicator.
- No chart in Phase 1: the stats endpoint returns aggregates, not a time
  series. The heatmap endpoint is a time series but belongs on Habit detail.
  Do not invent an Analytics chart from raw entries.
- Habit picker sheet: list of habits from `GET /api/v1/habits`; active row with 8px
  filled square; tapping selects and closes. No edit/archive actions.
- Data: `GET /api/v1/habits` for the selector; `GET /api/v1/habits/:id/stats?period=...`.
- PiP: if a timer is minimized, the card overlays the bottom-right; the body
  reserves 96px.
- Dark inversions: chalk text, line-dark, mono values chalk, no color.

### 3.11 Profile — [DONE]

- Boards: `08 Profile · Light` bg #FFFFFF · `08 Profile · Dark` bg #000000.
- Structure:
  1. Status bar.
  2. Identity block (padding 24, margin-top 8): ring avatar 72 per §2.7;
     name `Aditya Sharma` 24/700 tracking −0.02em margin-top 16;
     email `aditya.sharma@gmail.com` 15/400 muted margin-top 4.
  3. Account rows (margin-top 24, border-top 1px line, padding 14 0 each;
     label 15/400 muted left, value 15/600 ink/chalk right):
     `PROVIDER → Google` · `TIMEZONE → Asia/Kolkata` ·
     `WEEK STARTS → Monday` · `APPEARANCE → segmented control` · `HABITS → 3`.
  4. APPEARANCE control: 166×32, three equal segments `LIGHT / DARK / SYSTEM`,
     labels 10/700 centered. Selected segment filled ink [dark: chalk] with a
     ground-colored label; other labels muted. Light board selects `LIGHT`;
     Dark board selects `DARK`. No radius.
  5. Caption (margin-top 12): `Appearance is editable. Timezone changes and
     more providers come later.` 12/400 muted, max-width 300.
  6. Sign out: full-width sharp outlined button (1px ink border [dark: chalk],
     text 16/600 ink [dark: chalk], height 52, radius 0), margin-top 32.
  7. Tab bar (`PROFILE` active) → home indicator.
- No aggregate stats, no `CELLS`, no last-7-days strip, no other editable rows,
  no chevrons. Appearance is the only live control; stats live in Analytics.
- Data: Better Auth session for name/email/provider; `GET /api/v1/habits` for the
  habit count; sign out via Better Auth `/api/auth` (not `/api/v1`).
  Appearance is local UI state; no endpoint.
- PiP: if a timer is minimized, the card overlays the bottom-right; the body
  reserves 96px.
- Sign-out failure: monochrome banner; stay signed in.
- Dark inversions: ring avatar inner inverts; rows/lines invert; sign-out
  border chalk.

### 3.13 Component spec board — [TODO, optional]

- 720px-wide board documenting:
  - heatmap cell states at 32px (empty / green-300 / green-500 / green-700 +
    today ring + level→duration legend);
  - habit card anatomy with sizes;
  - three-tab bar with active/inactive states;
  - form field, segmented control, session row, sheet header;
  - mini timer card (running/paused);
  - landscape flip-clock anatomy with labeled sizes;
  - motion annotations per §4.

---

## 4. Motion specs (annotate, don't animate in stills)

- Flip digit: two-phase rotateX, ~300ms total, ease-in-out, **changed digits
  only**, UI runtime.
- Press feedback: scale(0.97), 150ms cubic-bezier(0.23,1,0.32,1).
  Habit card press: scale(0.99).
- Entrance (splash/sign-in): stagger 30–80ms, subtle.
- Dialog: scale(0.96) → scale(1.0) + opacity 0 → 1, 180ms cubic-bezier(0.23,1,0.32,1); scrim 200ms. Reduced motion: instant opacity swap.
- Sheet: translateY 100% → 0, 250ms cubic-bezier(0.23,1,0.32,1); scrim
  200ms. Reduced motion: instant.
- Fullscreen: OS orientation change; content fade/scale 180ms.
- Minimize: fullscreen fades; PiP scales 0.96 → 1 + fades in at bottom-right,
  ~180ms after portrait is restored. Timer never resets.
- Toast: fade/slide up 150ms.
- Reduced motion: instant digit swap, no stagger, no dialog/sheet spring, no PiP
  scale; orientation change remains OS-driven.
- Explicitly rejected: per-cell heatmap stagger (grid fades as one), animated
  tab indicator, animated chart, custom rotation animation during orientation.

---

## 5. Screen inventory & build order

Layout convention: every screen has a Light and a Dark board, 390×844 portrait,
placed side by side with ~80px gaps. The one exception is **06 Timer
Fullscreen**, which is 844×390 landscape. Name boards
`0X Screen · Light` / `0X Screen · Dark` so pairs sort together. The fourteen
illustration studies are 300×300 and live in a separate area below the screens;
they are not app screens and are never placed on 02, 03, 07, or 08.
Tool-specific node IDs and file references stay in the tool session — this
file is the source of truth for specs and status only.

| Screen | Boards | State |
|---|---|---|
| 01 Splash | 01 Splash · Light + Dark | DONE |
| 02 Sign in | 02 Sign in · Light + Dark | DONE |
| 02 Illustration studies | 14 × 300×300 boards (1 sign-in + 6 tab directions, all Light/Dark) | DONE |
| 03 Habits dashboard | 03 Habits · Light + Dark | DONE |
| 03A New habit | 03A New habit · Light + Dark | DONE |
| 04 Habit detail | 04 Habit detail · Light + Dark | DONE |
| 04A Today edit | 04A Today edit · Light + Dark | DONE |
| 04B Habit settings | 04B Habit settings · Light + Dark | DONE |
| 05 Timer Minimized | 05 Timer Minimized · Light + Dark | DONE |
| 06 Timer Fullscreen | 06 Timer Fullscreen · Light + Dark — 844×390 | DONE |
| 07 Analytics | 07 Analytics · Light + Dark | DONE |
| 08 Profile | 08 Profile · Light + Dark | DONE |
| Component spec board | 720px-wide board | TODO (optional) |

Build order:

1. 01 Splash + 02 Sign in; keep the illustration studies separate.
2. 03 Habits dashboard + 03A New habit dialog.
3. 04 Habit detail + 04A Today edit dialog + 04B Habit settings dialog.
4. 05 Minimized PiP + 06 Fullscreen landscape.
5. 07 Analytics + 08 Profile.
6. Component spec board (optional).

---

## 6. Copy bank

MOSAIC · THU · 15 OCT · AS · Aditya Sharma · aditya.sharma@gmail.com
Sign in or create your account · Track focus, build streaks, see your year in
cells. · Continue with Google · By continuing, you agree to the Terms of
Service and Privacy Policy.

HABITS · ANALYTICS · PROFILE · 3 HABITS · NEW HABIT · CREATE HABIT ·
HABIT NAME · TYPE · TIMER · PHASE 1 · Tracking type can't be changed after
creation. · ENTER A NAME · A HABIT WITH THIS NAME ALREADY EXISTS.

Deep Work · Reading · Gym · 12D STREAK · 4D STREAK · 0D STREAK ·
02:30:55 · 00:30:00 · 00:00:00 · TODAY · STREAK · AVG / DAY ·
TOTAL FOCUS · YEAR · MONTH · WEEK · 06:12:00 · 00:12:00 · 12d ·
NO HABITS YET · Create a habit and start logging focus.

FOCUS SESSION · STARTED 9:41 · END SESSION · PAUSED · MINIMIZE ·
A TIMER IS ALREADY RUNNING · OPEN CURRENT · END CURRENT ·
SAVING… · COULDN'T SAVE · RETRY · THIS SESSION CROSSED MIDNIGHT AND WASN'T
SAVED. · TODAY'S SESSIONS · Only today's sessions can be edited. Past days are
locked. · ENDED 11:31 · ENDED 08:40 · SESSION UPDATED · SESSION DELETED ·
DELETE SESSION · DELETE THIS SESSION? · NO SESSIONS TODAY · START A FOCUS
SESSION.

HABIT SETTINGS · SAVE · HABIT RENAMED · ARCHIVE HABIT · ARCHIVE DEEP WORK? ·
History is kept, but the habit disappears from your dashboard. Restore is not
available in Phase 1. · CANCEL · ARCHIVE · THIS SESSION IS LOCKED. ONLY TODAY
CAN BE EDITED.

PROVIDER · Google · TIMEZONE · Asia/Kolkata · WEEK STARTS · Monday ·
APPEARANCE · LIGHT · DARK · SYSTEM ·
Appearance is editable. Timezone changes and more providers come later. ·
SIGN OUT · NO DATA FOR THIS PERIOD · LOG A SESSION.

No `4H GOAL`, no `CELLS`, no `STOPWATCH`, no `CURRENT SESSION` aggregate.

---

## 7. Backend contract mapping

### 7.1 Screen → endpoint

All resource paths below are under `/api/v1` unless noted; Better Auth lives at
`/api/auth` (unversioned).

| Screen | Endpoint(s) | Notes |
|---|---|---|
| Splash | Better Auth session resolution | Routes to Habits or Sign in |
| Sign in | Better Auth Google flow | `/api/auth`, unversioned |
| Habits dashboard | `GET /api/v1/habits`; per habit `GET /api/v1/habits/:id/heatmap`; `GET /api/v1/habits/:id/stats?period=month` | N parallel reads accepted |
| New habit | `POST /api/v1/habits` with `{ name, valueType: "timer" }` | No color sent |
| Habit detail | `GET /api/v1/habits/:id`, `GET /api/v1/habits/:id/heatmap`, `GET /api/v1/habits/:id/stats?period=month`, `GET /api/v1/entries/:habitId?from&to` | Today range only for edit view |
| Today edit | `PATCH /api/v1/entries/:habitId/:id` `{ durationSecs }`; `DELETE /api/v1/entries/:habitId/:id` | Today only; 204 |
| Habit settings | `PATCH /api/v1/habits/:id` `{ name }`; `DELETE /api/v1/habits/:id` | Archive is soft; no restore |
| Timer | `POST /api/v1/entries/:habitId` `{ durationSecs }` | 201 + row; local timer |
| Fullscreen | No API while running; `POST /api/v1/entries/:habitId` on end | Same timer state |
| Minimized | No API; local timer | PiP resumes fullscreen |
| Analytics | `GET /api/v1/habits`; `GET /api/v1/habits/:id/stats?period={year,month,week}` | Aggregates only; no Analytics chart |
| Profile | Better Auth session; `GET /api/v1/habits` for count; sign out via `/api/auth` | No settings writes |
| Health | `GET /api/v1/health` | Ops only; no screen |

### 7.2 Data rules

- **Identity**: the client never sends `userId`; the session is the identity.
- **Habit**: `id`, `name`, `valueType` (`timer` in Phase 1), `archivedAt`.
  `color` is reserved and not rendered.
- **Entry**: `id`, `habitId`, `happenedAt` (server insert instant),
  `entryDate` (frozen server day), `durationSecs`.
- **Heatmap**: array of `{ date, value }`; for timer habits `value` is the
  day’s duration in seconds. Zero/empty days must render as level 0.
- **Stats**: per habit, period-scoped: `streak`, `total`, `averagePerDay`
  (exact field names are defined by the API implementation).
- **Writes**: only `{ durationSecs }`; clients never send dates.
- **Day-lock**: only today can be created, edited, or deleted; past days are
  read-only; future days are unreachable.
- **Timezone**: frozen at signup (`Asia/Kolkata` default, phase-1 placeholder);
  display it, never edit it.
- **Week start**: Monday is the design convention; the API does not model a
  week-start setting, so label it fixed.
- **Archive**: `DELETE /api/v1/habits/:id` sets `archivedAt`; `GET /api/v1/habits` excludes
  archived habits; history remains but there is no restore UI.
- **Retry caveat**: creation is POST/append. A retried POST can duplicate a
  session because there is no idempotency key. Disable double-submit and warn
  on retry; this is a backend gap, not a design choice.
- **Auth / not-found**: `401` → Sign in; `404` for a scoped habit or entry →
  drop it from local state and show the relevant empty state. No red error.
- **Optimistic insert**: on stop, insert a provisional row, then reconcile
  with the 201 response. On error, mark the row unsaved and offer retry.

### 7.3 Read model and empty states

- Dashboard: one initial `GET /api/v1/habits`; then N heatmap/stats reads. Skeleton
  until cards resolve; cached cards remain visible on refresh errors.
- Habit detail: skeleton heatmap + stats; Today list can render before the
  heatmap finishes.
- Analytics: skeleton total; if no data for the selected period, show
  `NO DATA FOR THIS PERIOD`.
- Empty dashboard: no habits → create CTA.
- Empty Today: no sessions → start CTA.
- Error: monochrome banner + retry; never destructive to cached data.

### 7.4 Deferred / backend gaps (do not design around them)

1. **Daily goal** — no field/endpoint. Removed.
2. **All-time stats** — `year|month|week` only. Analytics labels the period.
3. **Cross-habit aggregate** — no endpoint. Profile does not show aggregate
   totals; stats are per habit.
4. **Cells count** — no metric. Removed.
5. **Active session persistence** — no endpoint. Timer is local; closing the
   app loses the session. Keep this explicit in implementation notes.
6. **Stopwatch** — no model. Removed.
7. **Habit color** — `habit.color` exists, but the design budget forbids
   showing it. Reserved for a later visual decision.
8. **Settings writes** — no settings endpoints. Profile rows are read-only;
   timezone is frozen; week start is fixed.
9. **Archived-habit restore** — no endpoint. Archive warning says restore is
   unavailable.
10. **Session start time** — entries store `happenedAt` (insert instant), not
    a start. Session rows show `ENDED hh:mm`, not a fabricated start–end span.
11. **Heatmap intensity mapping** — backend open question; §2.5 is the design
    proposal. Backend should either return `value` (client maps) or a level.
12. **POST retry idempotency** — unresolved. The API doc’s “retry-safe” claim
    only holds for PATCH; a retried POST can double-count. Flag before build.
13. **Week-start semantics** — not modeled; design fixes Monday and labels it.
14. **Health path** — `api-design.md` §1 says unversioned, §9/§10 say
    `/api/v1/health`. Ops-only; no UI impact, but fix the doc.
15. **Binary / number / options habits** — Phase 2/3. Not designed here; the
    New habit dialog locks `TIMER`.

---

## 8. MCP build notes (hard-won, any design-tool MCP)

1. Board/artboard creation often **ignores position styles** — the board
   auto-places. Snap it afterwards with the tool's style API and verify
   position via node info.
2. Tool results are sometimes a JSON **string**, sometimes an object — parse
   defensively. Find nodes by name via a children listing rather than regexing
   escaped IDs out of raw output.
3. Screenshot output may **not be reviewable by the model** (no image input).
   Review structurally: tree summary + node info; verify child heights sum to
   844 in portrait, 390 in landscape, no clipping, 24px lanes aligned,
   light/dark geometry mirrored.
4. **Duplicate/reuse** an existing status-bar instance instead of re-pasting
   the markup; recolor after duplicating (text color, svg fill).
5. Build incrementally: one visual group per write; geometry check after each
   board.
6. **Mandatory**: call the tool's finish/release call at the end of every
   session (the "done" call that releases locked nodes), so later sessions
   aren't blocked.
7. Post the design brief (mood/palette/type/direction) before the first
   mutation.
8. If the tool is offline or over quota, sessions fail differently — check
   that it's running and quota allows work before resuming.
9. **Implementation target**: Expo/React Native (RNR components) — design
   choices map to RN: no hover states, press feedback via scale, tab bar =
   bottom tabs, modal = dialog/sheet route, fullscreen = orientation-locked screen,
   PiP = absolute overlay above the tab bar. Use `expo-screen-orientation`
   (or the platform equivalent) to lock landscape on 06 and unlock portrait on
   minimize/end.
10. **Landscape board**: create 06 at 844×390, not 390×844. The orientation
    change is not visible in a still; annotate it in the board notes. The
    minimize control must be at the top-right safe area.
11. **PiP board**: 05 is a 390×844 board with the Habits dashboard behind it;
    the PiP is an overlay, not a separate full screen. Do not dim the
    background.

---

## 9. Verification checklist (per board)

- [ ] Screen 390×844 portrait, except 06 which is 844×390 landscape.
- [ ] Correct board name + ground color.
- [ ] Status bar first child on portrait screens (except Splash); hidden on
      Splash and 06.
- [ ] Children sum to 844 (portrait) / 390 (landscape) — no clipping; home
      indicator at bottom. Scrollable bodies are intentional and clip above
      the pinned tab bar.
- [ ] All caps labels 10–12px / 500–700 / 0.08–0.12em; mono digits 700–800
      (clock 800; compact durations 700).
- [ ] No color outside heat ramp + Profile accent + Google G.
- [ ] No habit color, no green success, no red error.
- [ ] Light/dark are exact inversions (same geometry, swapped tokens).
- [ ] Tab bar is HABITS / ANALYTICS / PROFILE; active/inactive states
      match §2.6.
- [ ] Habit cards show one habit each; no aggregate today total.
- [ ] Heatmap is per habit; today’s border is drawn; empty cells level 0.
- [ ] Habit detail today total equals the sum of all today’s session rows
      (including rows below the fold).
- [ ] Session rows show `ENDED hh:mm` + `hh:mm:ss`; no fabricated start time.
- [ ] Today edit has no date picker and no past-day edit affordance.
- [ ] New habit dialog has no color picker and a locked TIMER type.
- [ ] Archive warning says history is kept and restore is unavailable.
- [ ] No 4H goal, no CELLS, no STOPWATCH, no aggregate current session.
- [ ] Play starts the timer and shows 05 immediately; no modal timer.
- [ ] 06 minimizes to 05 via top-right control; timer continues.
- [ ] 06 uses the big clock variant with 72×112 cells; no 342px portrait
      shrink in landscape.
- [ ] 05 PiP is bottom-right above the tab bar; no scrim; tap restores 06.
- [ ] 05 background is the Habits dashboard, not the OS home screen.
- [ ] 05 PiP never covers the tab bar or home indicator; content reserves 96px.
- [ ] Starting a second habit never silently switches timers; the confirmation
      appears.
- [ ] Timer state survives PiP → fullscreen → PiP without resetting.
- [ ] Empty/loading/error states use the monochrome components in §2.17.
- [ ] Every screen’s data maps to an endpoint in §7.1.
- [ ] Splash contains only the 64px mark (no wordmark), centered at y=390.
- [ ] Every habit total shares Deep Work's top line and x=319 right edge.
- [ ] Dialogs (03A, 04A, 04B) are centered floating cards with sharp corners (radius 0), borderless (contrast against scrim), no grabber, scrim backdrop.
- [ ] Profile APPEARANCE control selects LIGHT/DARK/SYSTEM per theme.
- [ ] Illustration studies are separate, monochrome, and not placed on 02, 03, 07, or 08.
- [x] §5 state updated for finished boards.

---

## 10. Session split (focused screen groups)

| Session | Implements | Boards |
|---|---|---|
| 1 | §3.1 Splash + §3.2 Sign in (reuse) | 01 + 02 Light/Dark |
| 2 | §3.3 Habits + §3.4 New habit dialog | 03 + 03A Light/Dark |
| 3 | §3.5 Habit detail + §3.6 Today edit dialog + §3.7 Habit settings dialog | 04 + 04A + 04B Light/Dark |
| 4 | §3.8 Minimized + §3.9 Fullscreen | 05 + 06 landscape Light/Dark |
| 5 | §3.10 Analytics + §3.11 Profile | 07 + 08 Light/Dark |
| 6 | §3.13 Component spec board (optional) | 720px board |

Each session prompt = this whole file + "Implement §X only".
