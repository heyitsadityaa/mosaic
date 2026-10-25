# MOSAIC — Design Specification

Single source of truth for designing the MOSAIC mobile app.
Every section is self-contained. To build, paste this file into a design session
backed by any canvas/design MCP (Penpot, Paper, Figma, or similar) and say:
**"Implement §X only"** (e.g. "implement §3.4 only").
Any design change = edit this file, then re-run the affected section.
Tool-specific details (node IDs, file references) live in the tool session,
never in this file.

Status legend: **[DONE]** verified · **[PARTIAL]** started, resume instructions inside · **[TODO]** not started.

---

## 0. Product

- **App**: MOSAIC — focus timer + activity heatmap productivity app.
- **Flow**: Splash → Sign in (Google only) → Home ("Activity" tab) ⇄ Profile tab.
  Play on Home opens the **Timer** as a modal on top of Home; the Timer's expand
  icon opens **Fullscreen**. The Timer also hosts a mini stopwatch card (PiP) bottom-right.
- **Platforms/boards**: mobile, 390×844, every screen in Light + Dark.
- **North star**: color is data. The heatmap ramp (green-300→green-500→green-700) is the only
  chroma in the product, plus one licensed accent zone in Profile.

---

## 1. Design system

### 1.1 Mood & direction

- **Mood**: brutalist — pure white × pure black, no third color.
- **Direction**: A strict achromatic interface — pure white in light, pure black
  in dark, one editorial type ramp — where the only chroma is the activity
  heatmap's green intensity ramp and the profile accent, so color reads as data,
  never decoration.
- **Rejected**: phosphor/terminal (green belongs to the data), mineral/graphite
  (tinted greys dilute the monochrome rule and fight the heatmap).

### 1.2 Palette (design tokens — 50 tokens)

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

**Color budget**: heat ramp = heatmap + legend + Profile data strip only. Profile
also gets: avatar gradient ring (lime→sky) + one 8px heat square on the streak.
Google "G" brand colors on the sign-in button are the only other sanctioned color.
No other color anywhere. Ever.

### 1.3 Typography

- `--font-sans` **Inter** — all UI (weights 100–900 available).
- `--font-mono` **JetBrains Mono** — clock digits and durations only (max weight 800).
- Scale: `--text-display` 64 · `--text-title` 24 · `--text-headline` 17 · `--text-body` 15 · `--text-label` 13 · `--text-caption` 12.
  Screens use 30/24 (titles), 17/600 (names), 15 (body), 11–12 caps labels.
- Weights: 400 regular · 500 medium · 600 semibold · 700 bold · 800 extrabold (mono digits).
- Tracking: `--tracking-tight` −0.03em (display), `--tracking-caps` 0.08em
  (small caps labels use 0.08–0.12em; tracked caps get `text-indent` = tracking for optical centering).
- Leading: `--leading-display` 72 · `--leading-title` 30 · `--leading-body` 22.
- Caps labels: 10–12px, weight 500–700, tracking 0.08–0.12em — the Swiss editorial voice.

### 1.4 Spacing / radius / misc tokens

- Spacing (4pt): 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 (`--spacing-1…16`).
- Radius: `--radius-cell` 3 · `--radius-card` 12 · `--radius-sheet` 20 · `--radius-full` 999.
- `--opacity-scrim` 60% · `--breakpoint-mobile` / `--container-mobile` 390px.

### 1.5 Component rules

- Full-width rectangular buttons: **sharp** (radius 0). Play/pause/stop: **circles**.
  Cards: radius-card. Modal sheet: radius-sheet top corners only.
- Structure via **1px hairlines** (`--color-line-*`), not boxes. No shadows.
  No gradients except the Profile avatar ring.
- Page padding: 24px horizontal (heatmaps and headers share this lane).
- Every screen except Splash ends with: tab bar (where applicable) + home indicator (140×5 pill).

---

## 2. Shared components (exact specs)

### 2.1 Status bar
Standard iOS status bar (time, signal, Wi-Fi, battery). Never hand-draw.
Colors: black on light boards, white on dark boards.
**Reuse**: duplicate an existing status-bar instance rather than re-pasting the
markup, then recolor via the tool's style API (text color, svg fill).
Skip only on full-bleed Splash.

### 2.2 Mark & wordmark
- **Mark (64px)**: SVG viewBox 0 0 60 60; 3×3 tile grid, squares 16px at x/y ∈ {0,22,44}.
  Diagonal cells filled: (0,0) (22,22) (44,44) (44,0) (0,44). Off-diagonals outlined: stroke-width 2,
  rects 14px at (23,1) (1,23) (45,23) (23,45). Fill/stroke = ink (light) / chalk (dark).
- **Mini mark (18px)**: 2×2 checker — filled 8px at (0,0),(10,10); outlined stroke 1.5, 6.5px at (10.75,0.75),(0.75,10.75).
- **Wordmark**: "MOSAIC", Inter 700. Splash: 34px, letter-spacing 0.18em + text-indent 0.18em.
  In-app: 13px, letter-spacing 0.16em.

### 2.3 Flip clock slab (core component)
- Cell: 46×72, radius 4, flex centered, overflow hidden, position relative.
- Digit: JetBrains Mono 38/800, line-height 1, letter-spacing −0.02em.
- Seam: absolutely positioned 1.5px line at exact middle, full width
  (light: bg ink, digit chalk, seam rgba(255,255,255,0.3); dark: bg chalk, digit ink, seam rgba(0,0,0,0.25)).
- Pair: two cells, gap 4. Colon: 14px-wide block, two 5px dots, gap 14, ground color.
  Groups joined with gap 6. Six digits + 2 colons = 340px wide (fits 342 inner width).
- Big variant (Fullscreen): cells 72×112, radius 6, mono 60/800, seam 2px, colon dots 7px gap 20, pairs gap 5, groups gap 8 (verify ≤342, reduce cell to 68 if needed).
- Clock format everywhere: **hh:mm:ss**. Durations (session rows, stopwatch) are
  always **hh:mm:ss** too — never bare mm:ss — so the unit is unambiguous (e.g. 02:30:55).

### 2.4 Timer controls
- Primary circle 64px: bg ink (dark: chalk); pause glyph = two 6×22 bars ground-contrast;
  play glyph = path `M6 3.5 L16.5 10 L6 16.5 Z` filled ground-contrast.
- Secondary stop circle 52px: outlined 1.5px ink (dark: chalk), 16px filled square glyph.

### 2.5 Heatmap (signature component)
- Section shell: margin-top 28, padding 20px 24px 0, border-top 1px line.
- Header row: "ACTIVITY" 12/700 tracking 0.12em | "LAST 3 MONTHS" 11/500 muted.
- Month row (margin-top 16): 28px label spacer + relative container 308px;
  labels 10px caps muted: JUL left:0, AUG left:96px, SEP left:192px, OCT right:0.
- Grid (margin-top 8): 7 rows (Mon–Sun). Each row: flex, gap 4, margin-bottom 4 —
  weekday label slot 28px (show MON/WED/FRI at rows 0/2/4, 10px muted, line-height 20) + 13 cells 20×20 radius 3.
  Row width = 342 exactly. 13 weeks ≈ last 3 months (never full 365 cells on Home).
- Levels: 0 = --color-cell (dark: --color-cell-dark) · 1 = heat-low · 2 = heat-mid · 3 = heat-high.
- Data pattern (deterministic pseudo-random, generate programmatically):
  active probability = 0.35 + 0.045 × weekCol; if active → 45% lvl1, 33% lvl2, 22% lvl3.
  Force cols 5–6 fully empty (a break). Current week (col 12): Mon–Thu only; Fri–Sun empty.
  Today's cell (col 12, row 3) gets border 1.5px solid ink (dark: chalk).
- Legend (margin-top 14, right-aligned, gap 6): "LESS" + four 12×12 radius-2 swatches
  (empty, green-300, green-500, green-700) + "MORE", all 10px caps muted.

### 2.6 Tab bar & home indicator
- Tab bar: margin-top auto, border-top 1px line, padding 14px 24px 0, two flex-1 tabs, centered, gap 8.
  Active: 8px **filled** square (ink/chalk) + label 11/700 tracking 0.1em ink/chalk.
  Inactive: 8px **outlined** square (stroke muted) + label 11/500 muted. Tabs: ACTIVITY, PROFILE.
- Home indicator: flex centered, bar 140×5 radius-full, ground-contrast color (Splash: padding-bottom 8; others: padding 10px 0 8px after tab bar).

### 2.7 Avatars
- Small (Home header): 30px circle, bg ink, initials "AS" 11/700 chalk (dark: inverted).
- Large (Profile): 72px. Outer ring `linear-gradient(135deg, #84CC16, #0EA5E9)` as 3px ring
  (padding 3, radius-full); inner circle bg ink (dark: chalk), initials "AS" 24/700 chalk (dark: ink).

### 2.8 Google button
Full-width, height 56, radius 0, bg ink (dark: chalk), centered, gap 12:
Google "G" SVG 18px (viewBox 0 0 24 24, standard four brand paths
#4285F4 / #34A853 / #FBBC05 / #EA4335) + "Continue with Google" 16/600 ground-contrast.

### 2.9 Mini stopwatch card (Timer PiP)
168×76, bg surface (dark: #000 + hairline), radius-card, padding 12:
caps "STOPWATCH" 10/600 tracking 0.1em muted + "00:00:00" mono 20/800 ink (dark: chalk)
+ 12px expand glyph top-right. Positioned absolute right 20, bottom ~64 (above home indicator).

---

## 3. Screens

### 3.1 Splash — [DONE] (both boards verified)
- Boards: `01 Splash · Light` bg #FFFFFF · `01 Splash · Dark` bg #000000.
- Full-bleed: **no status bar** (allowed for splash). Contains only:
  1. Center block (flex:1, centered, gap 28): Mark 64px + Wordmark 34px.
  2. Home indicator (padding-bottom 8).
- Expected geometry: mark centered, y≈349.5; indicator at y=831; exact 844 fit.

### 3.2 Sign in — [DONE] (both boards verified)
- Boards: `02 Sign in · Light` bg #FFFFFF · `02 Sign in · Dark` bg #000000.
- Structure (page padding 24): status bar → Brand row (mini mark + wordmark, padding 8px 24px 0)
  → Copy block (`margin-top:auto`): headline "Sign in or create your account" 30/700 lh36 tracking −0.02em max-width 300;
  sub "Track focus, build streaks, see your year in cells." 15/400 lh22 muted max-width 280 margin-top 12
  → Actions (padding 40px 24px 0): Google button (§2.8) + fine print
  "By continuing, you agree to the Terms of Service and Privacy Policy." 12/400 muted center max-width 272 margin 16 auto 0
  → home indicator (padding 24px 0 8px).
- Expected heights: 62 / 26 / 128 / 148 / 37 — sums with auto margin to 844.

### 3.3 Home — [DONE] (both boards verified)
- Boards: `03 Home · Light` bg #FFFFFF · `03 Home · Dark` bg #000000.
- Structure, in order:
  1. Status bar (§2.1).
  2. Header (padding 14px 24px 0): left "THU · 15 OCT" 11/600 tracking 0.1em muted;
     right Avatar 30px "AS" (§2.7).
  3. Session (padding 24px 24px 0, row space-between): left col: "CURRENT SESSION" 11 caps muted;
     "Deep Work" 17/600 lh24 margin-top 4. Right: Play circle 56 bg ink, chalk triangle.
  4. Flip clock (padding 20px 24px 0): "02:31:25" per §2.3 (ink slabs, chalk digits).
  5. Clock meta (padding 14px 24px 0): "TODAY'S FOCUS" 11 caps muted | "2H 31M OF 4H GOAL" 11/700 ink.
  6. Heatmap section per §2.5.
  7. Today list: caps header "TODAY · 2 SESSIONS" (11 muted, margin-top 24), then two hairline
     rows (border-top line, padding 12 0): left name 15/600 + time span 11 muted margin-top 3;
     right duration mono 15/700 in **hh:mm:ss** (always explicit — never bare mm:ss). Rows:
     "Deep Work" / "09:00 – 11:31" / "02:30:55"; "Reading" / "08:10 – 08:40" / "00:00:30"
     (sum = 2:31:25 = the clock).
  8. Tab bar per §2.6 (ACTIVITY active) → home indicator.
- Dark inversions: chalk text, muted-dark, line-dark, inverted flip slabs, chalk play circle
  with ink triangle, chalk avatar with ink initials, cell-dark empties, chalk today-border.

### 3.4 Timer (modal over Home) — [TODO]
- Boards: `04 Timer · Light` bg #FFFFFF · `04 Timer · Dark` bg #000000.
- Top band (~88px): white status bar + faint Home-header ghost (opacity 0.35: caps date + circle
  silhouette) under scrim overlay rgba(0,0,0,0.5) light / rgba(0,0,0,0.6) dark.
- Sheet: from y≈88 to bottom, radius-sheet top corners only (20). Light: bg #FFF.
  Dark: bg --color-surface-dark + border-top hairline. Contains:
  1. Grabber 36×5 radius-full muted, centered, margin-top 10.
  2. Header row (padding 14px 24px): close X (20px, two 2px strokes) | "FOCUS SESSION" 11/700 tracking 0.12em |
     fullscreen glyph (four corner arrows, 18px, 2px strokes).
  3. Flip clock "00:00:00" centered, margin-top 36 (per §2.3).
  4. Caps: "STARTED 9:41 · DEEP WORK" 11/600 tracking 0.1em muted, centered, margin-top 16.
  5. Controls (margin-top 40, centered, gap 20): pause 64 primary + stop 52 outlined (§2.4).
  6. Mini stopwatch card per §2.9, absolute bottom-right.
  7. Home indicator.

### 3.5 Profile — [TODO]
- Boards: `05 Profile · Light` bg #FFFFFF · `05 Profile · Dark` bg #000000.
- Structure:
  1. Status bar.
  2. Identity block (padding 24, margin-top 8): ring avatar 72 per §2.7; name "Aditya Sharma"
     24/700 tracking −0.02em margin-top 16; email "aditya.sharma@gmail.com" 15/400 muted margin-top 4.
  3. Stats row (margin-top 24, border-top + border-bottom hairline, padding 16 0, three flex-1 cols):
     labels STREAK / TOTAL FOCUS / CELLS (10 caps muted); values 24/700: "12d" (with 8px heat-low
     square before it), "86h", "412".
  4. Last-7-days strip (margin-top 24): caps "LAST 7 DAYS" 11 muted + 7 cells 20×20 radius 3 gap 4:
     empty, heat-low, heat-mid, heat-mid, heat-high, heat-low, heat-high.
  5. Settings rows (margin-top 24, hairlines, padding 14 0, label 15/400 muted left, value 15/600 ink right):
     PROVIDER → Google · TIMEZONE → GMT+05:30 India · WEEK STARTS → Monday.
  6. Sign out: full-width sharp outlined button (1px ink border [dark: chalk], text 16/600 ink [dark: chalk],
     height 52, radius 0), margin-top 32.
  7. Tab bar (PROFILE active) → home indicator.

### 3.6 Timer Fullscreen — [TODO, optional]
- Boards: `06 Timer Fullscreen · Light` bg #FFFFFF · `06 Timer Fullscreen · Dark` bg #000000.
- Full-bleed ground; top row (padding 14px 24px 0): caps "FOCUS SESSION · DEEP WORK" 11/700 tracking 0.12em |
  collapse glyph (inward arrows, 18px). Center: giant flip clock "00:00:00" (big variant §2.3).
  Caps "STARTED 9:41" 11 muted centered margin-top 24. Controls pinned low (margin-top auto, bottom ~80):
  pause circle 64 + sharp full-width "END SESSION" 11/700 caps tracking 0.12em muted. Home indicator.

### 3.7 Component spec board — [TODO, optional]
720px-wide board documenting: heatmap cell states at 32px (empty/green-300/green-500/green-700 + today ring +
level→duration legend); flip-clock anatomy with labeled sizes; motion annotations per §4.

---

## 4. Motion specs (annotate, don't animate in stills)

- Flip digit: two-phase rotateX, ~300ms total, ease-in-out, **changed digits only**, UI runtime.
- Press feedback: scale(0.97), 150ms cubic-bezier(0.23,1,0.32,1).
- Entrance (splash/sign-in): stagger 30–80ms, subtle.
- Reduced motion: instant digit swap, no stagger.
- Explicitly rejected: per-cell heatmap stagger (grid fades as one), animated tab indicator.

---

## 5. Screen inventory & build order

Layout convention (any canvas tool): every screen has a Light and a Dark board,
390×844, placed side by side with ~80px gaps, rows in 01–06 order. Name boards
`0X Screen · Light` / `0X Screen · Dark` so pairs sort together.
Tool-specific node IDs and file references stay in the tool session — this file
is the source of truth for specs and status only.

| Screen | Boards | State |
|---|---|---|
| 01 Splash | 01 Splash · Light + Dark | DONE |
| 02 Sign in | 02 Sign in · Light + Dark | DONE |
| 03 Home | 03 Home · Light + Dark | DONE |
| 04 Timer | 04 Timer · Light + Dark | TODO |
| 05 Profile | 05 Profile · Light + Dark | TODO |
| 06 Timer Fullscreen | 06 Timer Fullscreen · Light + Dark | TODO (optional) |
| Component spec board | 720px-wide board | TODO (optional) |

---

## 6. Copy bank

MOSAIC · THU · 15 OCT · AS · Aditya Sharma · aditya.sharma@gmail.com
Sign in or create your account · Track focus, build streaks, see your year in cells. ·
Continue with Google · By continuing, you agree to the Terms of Service and Privacy Policy. ·
CURRENT SESSION · Deep Work · 02:31:25 · TODAY'S FOCUS · 2H 31M OF 4H GOAL ·
ACTIVITY · LAST 3 MONTHS · LESS / MORE · TODAY · 2 SESSIONS · 09:00 – 11:31 · 02:30:55 ·
08:10 – 08:40 · 00:00:30 · FOCUS SESSION · STARTED 9:41 · STOPWATCH · 00:00:00 ·
Profile · 12d · 86h · 412 · LAST 7 DAYS · Google · GMT+05:30 India · Monday · Sign out ·
ACTIVITY / PROFILE tabs · END SESSION.

---

## 7. MCP build notes (hard-won, any design-tool MCP)

1. Board/artboard creation often **ignores position styles** — the board
   auto-places. Snap it afterwards with the tool's style API and verify position
   via node info.
2. Tool results are sometimes a JSON **string**, sometimes an object — parse
   defensively. Find nodes by name via a children listing rather than regexing
   escaped IDs out of raw output.
3. Screenshot output may **not be reviewable by the model** (no image input).
   Review structurally: tree summary + node info; verify child heights sum to
   844, no clipping, 24px lanes aligned, light/dark geometry mirrored.
4. **Duplicate/reuse** an existing status-bar instance instead of re-pasting the
   markup; recolor after duplicating (text color, svg fill).
5. Build incrementally: one visual group per write; geometry check after each
   board.
6. **Mandatory**: call the tool's finish/release call at the end of every
   session (the "done" call that releases locked nodes), so later sessions
   aren't blocked.
7. Post the design brief (mood/palette/type/direction) before the first mutation.
8. If the tool is offline or over quota, sessions fail differently — check that
   it's running and quota allows work before resuming.
9. **Implementation target**: Expo/React Native (RNR components) — design choices
   map to RN: no hover states, press feedback via scale, tab bar = bottom tabs,
   modal = sheet route.

---

## 8. Verification checklist (per board)

- [ ] Screen 390×844, correct name + ground color.
- [ ] Status bar first child (except Splash), correct color.
- [ ] Children sum to 844 — no clipping; home indicator at bottom.
- [ ] All caps labels 11–12px/500–700/0.08–0.12em; digits mono 800 only.
- [ ] No color outside heat ramp + Profile accent + Google G.
- [ ] Light/dark are exact inversions (same geometry, swapped tokens).
- [ ] §5 state updated for finished boards.

---

## 9. Session split (one screen pair per work unit)

| Session | Implements | Boards |
|---|---|---|
| 1 | §3.1 Splash | 01 Light + Dark |
| 2 | §3.2 Sign in | 02 Light + Dark |
| 3 | §3.3 Home | 03 Light + Dark |
| 4 | §3.4 Timer | 04 Light + Dark |
| 5 | §3.5 Profile | 05 Light + Dark |
| 6 | §3.6 + §3.7 (optional) | 06 + spec board |

Each session prompt = this whole file + "Implement §X only".
