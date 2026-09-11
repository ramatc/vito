# Design

<!-- impeccable:design-schema 1 -->

## Direction: Brote

**THESIS.** Vito's chrome should feel like a plant nursery, not a cold dashboard —
replacing slate-gray sobriety with a sage-tinted neutral ground and a fresh
sprout-green + honey-amber accent pair that reads as growth, not evaluation.

**OWN-WORLD.** Sage-tinted off-white / deep moss-black neutrals (never blue-gray
slate), a fresh sprout-green brand color for progress and completion, honey amber
for warmth/streak moments. Recognizable by its botanical, optimistic color
temperature alone, even with all content removed — and it ties directly into
existing game content (the "Sprout Cap" cosmetic, Vito's own evolution/growth
narrative), so the chrome and the product's own metaphor now agree.

**STORY.** The user feels like they're tending something that's growing, not being
audited. The palette reinforces the product principle "accompany before
punishing" and literalizes "small steps also count" as visible botanical growth.

**FIRST VIEWPORT.** Composition is unchanged: Vito hero, progress section, today's
habit list. Every surface repaints in the new token palette; no structural change.

**FORM.** "Brote" — chosen directly by the user after live-comparing all three
dealt directions in the browser (Sobremesa → Recreo → Brote, swapped in place via
the token layer, no component edits between trials). No concept-seed roll: this
request was explicitly scoped to color and tone, not new page structure, so the
user compared and picked directly.

## Color strategy

Full palette (named roles), applied through a complete CSS custom-property token
layer — not the previous 5-variable "seeded colours" approach. Every screen reads
tokens; no component should hardcode `slate-*`/`emerald-*`/`gray-*` Tailwind
classes with a paired `dark:` utility anymore. Dark mode stays a class on `<html>`
(`app/documentPreferences.ts` owns it), not a media query — this predates the
palette work and does not change.

Vito's own art (`src/features/vito/assets/*.png`) is line-art only — white fill,
dark outline, no inherent color — so the palette lives entirely in chrome
(backgrounds, cards, text, accents) and never fights the character art.

## Tokens

Defined in `src/index.css` as `--*` custom properties on `:root` / `.dark`, then
re-exposed via `@theme inline` as `--color-*` so they're usable as
`bg-surface`, `text-primary`, `border-border`, etc.

| Token          | Role                                             | Light     | Dark      |
| -------------- | ------------------------------------------------ | --------- | --------- |
| `surface`      | Page background                                  | `#FAF9F3` | `#14181A` |
| `surface-raised` | Card / elevated background                     | `#FFFFFF` | `#1E2622` |
| `surface-sunken` | Recessed background (progress track, inputs)   | `#F0EEE1` | `#191F1B` |
| `primary`      | Primary text                                     | `#1E231F` | `#EDF2EC` |
| `muted`        | Secondary/tertiary text                          | `#5E6259` | `#A8AFA5` |
| `brand`        | Accent — progress, active states, "done", links  | `#3E9B5C` | `#5FC97F` |
| `brand-strong` | Brand hover/pressed                              | `#327D49` | `#7ADB98` |
| `on-brand`     | Text/icon on a brand-filled surface               | `#FFFFFF` | `#0F2717` |
| `warm`         | Streak / warmth accent (icons, badges, bold labels — not body copy) | `#D98F2B` | `#F0B15E` |
| `warm-soft`    | Tinted background for warm/streak elements        | `#F7E4C4` | `#3A2C16` |
| `warm-text`    | Text on `warm-soft` background                    | `#7A4E0F` | `#F3D9A8` |
| `border`       | Hairline borders                                 | `#E6E2D3` | `#2A322C` |

### Habit Reports row palette

Six additional pairs, for the weekly report's per-habit row coloring
(`src/features/habits/habitPalette.ts` maps a habit's list index to one of
these, wrapping after 6). `sprout` and `honey` are the existing `brand`/
`brand-strong` and `warm` values, not new colors — the report is meant to
read as an extension of Brote, not a seventh accent family. `-bg` is the
row's own soft background tint; `-fill` is the saturated color of a
completed-day cell, and targets ≥3:1 against `surface-raised` in both modes.

| Token             | Role                        | Light `-bg` | Light `-fill` | Dark `-bg` | Dark `-fill` |
| ----------------- | --------------------------- | ----------- | -------------- | ---------- | ------------- |
| `report-sprout`   | Row 1 (reuses brand)        | `#E3F5E9`   | `#059669`      | `#1C2A20`  | `#5FC97F`     |
| `report-sky`      | Row 2                       | `#E3EEF8`   | `#3B82C4`      | `#1A2530`  | `#6BA7DD`     |
| `report-blossom`  | Row 3                       | `#FBE7EC`   | `#D1608A`      | `#2E1E26`  | `#E08BAB`     |
| `report-honey`    | Row 4 (reuses warm)         | `#FEF3C7`   | `#D97706`      | `#3A2C16`  | `#F0B15E`     |
| `report-lilac`    | Row 5                       | `#EDE6F6`   | `#8B6BC7`      | `#241F30`  | `#AF95DF`     |
| `report-clay`     | Row 6                       | `#F7E6DD`   | `#C06A45`      | `#2C2019`  | `#E0916B`     |

Two directions were dealt and dropped after a live comparison: "Sobremesa" (warm
stone neutrals, bottle-green + terracotta) and "Recreo" (coral/tangerine brand,
golden-amber streak). Their exact values aren't preserved here — if either is
ever revisited, redo the swap rather than trying to recover the old numbers.

`warm` alone is not body-text-safe against `surface`/`surface-raised` at small
sizes (~3.5:1) — use it for icons, bold badge labels, or pair it with
`warm-soft`/`warm-text` the way the streak badge does. Every other pairing in the
table above targets ≥4.5:1 for body text, ≥3:1 for large/bold text.

## Shape

Cards move from `rounded-xl` to `rounded-2xl` and from a 1px `slate-200`/`slate-700`
ring to a 1.5px `border` token border — enough to read as friendlier without a
structural redesign. Radius and border-weight changes ride along with the token
migration; they are not a separate pass.

## Typography

Unchanged: `system-ui, 'Segoe UI', Roboto, sans-serif`. Operate-mode UI is well
served by a system stack; the personality shift lives in color and shape, not in
introducing a display face.

## Out of scope for this pass

- Mood/reaction color-coding (moods and reactions currently only select art/motion
  variants — no color logic exists or is being added here).
- Cosmetic layer art (`Sprout Cap`, `Explorer's Pack`, `Warm Glow` PNGs) — these are
  separate raster assets, not recolored by this token change.
- Any layout/structural change beyond radius and border weight.
