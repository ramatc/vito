# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People trying to build or sustain daily habits who respond better to warmth than to
punishment. They want a companion that reflects their effort back to them rather than
judging their failures.

## Product Purpose

Vito is a gamified habit tracker: daily habit completion feeds a virtual companion
("Vito") who visibly grows and reacts alongside the user. Success is not maximizing
streaks at any cost — it's making it easier to try again tomorrow than to give up.

## Positioning

Unlike punitive habit trackers or streak-anxiety RPGs, Vito's game systems have a
floor: momentum decays but never empties, and a broken streak resets to 1, never 0.
The product rule stated in the repo README: **a bad week must never render as
failure.**

## Operating Context

Mobile-first web app (React + TypeScript + Vite + Tailwind v4), fully local —
`localStorage` behind a repository interface, no account, no backend. Daily loop:
create habits → complete small goals → get feedback (XP, Vito's reaction) → gain
progress (level, momentum, streak) → Vito reacts/evolves → personalize Vito (closet)
→ come back tomorrow. A future React Native port is expected to reach parity with
the frozen web MVP rather than reinterpret its rules (see VISION.md).

## Capabilities and Constraints

- Four-ring architecture, inward-only dependencies: `types` → `domain` (pure, no
  React/DOM) → `services/storage` + `stores` → `hooks` → `features`/`components`.
  Enforced by lint (`.oxlintrc.json`), not just documented.
- Derived state is never persisted — level, evolution stage, and mood are always
  recomputed from `totalXp` and today's activity.
- Vito is drawn as independent composable art layers (body, face, cosmetics), never
  fused sprites. Current body/face assets (`src/features/vito/assets/*.png`) are
  line-art only — white fill, dark outline, no inherent color. Cosmetic layers
  (`src/features/rewards/assets/*.png`: Sprout Cap, Explorer's Pack, Warm Glow) are
  placeholder-quality raster art, not a locked brand constraint.
- Cosmetic unlocks are deterministic (level, XP, or streak threshold) — never random.
- Moods (thriving, happy, content, sleepy, resting) and reactions (celebrate,
  levelUp, unlock, wake, allDone) currently select art/animation variants only —
  there is no existing color-coding tied to mood or reaction.
- No account system and no plan to add one for the frozen v1.0 scope.

## Brand Commitments

- Voice: **Rioplatense, cálido y directo** (warm, direct, River Plate Spanish).
- Emotion first, decoration second — Vito is the emotional center, habits are the
  functional center.
- Vito never scolds and never shows punitive sadness; feedback always reinforces,
  never shames.
- Feedback should feel satisfying, never casino-like (no randomized rewards, no
  variable-ratio reinforcement tricks).
- Fewer surfaces, better hierarchy — new features must justify their complexity.

## Evidence on Hand

- `README.md` and `VISION.md` at the project root are the authoritative source for
  product rules, frozen v1.0 scope, and the technical stack — treat them as current.
- No `DESIGN.md` exists yet. The current visual system (undocumented) is Tailwind's
  slate grayscale plus a muted emerald accent: 5 CSS custom properties
  (`--surface`, `--surface-raised`, `--primary`, `--muted`, `--brand`) defined in
  `src/index.css`, explicitly *not* a full token layer — most of the ~24-26
  components pair a hardcoded light-mode Tailwind color with an explicit `dark:`
  utility rather than reading a token. One component (`StreakBadge`) already
  introduces an amber accent outside this system.
- An external reference project (`vito-habit-companion`, AI-Studio-generated,
  outside this repo) was reviewed for mood/inspiration only — its exact tokens are
  not being ported; see design direction work for details.

## Product Principles

1. Small steps also count — a half-completed habit still adds up.
2. Accompany before punishing — Vito never scolds.
3. Positive feedback without guilt — every interaction reinforces, none shames.
4. A bad day never destroys progress — momentum has a floor, streaks reset to 1.
5. Vito reflects the journey, it doesn't judge the user.

## Accessibility & Inclusion

No product-specific requirement established beyond standard web accessibility
practice.
