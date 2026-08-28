# Vito

A gamified habit tracker. You build habits, your buddy Vito grows with you.

The product rule that drives most of the technical decisions: **a bad week must never render
as failure**. Momentum has a floor above zero, rest days are neutral, and streaks reset to 1
instead of 0.

## Stack

| Concern            | Choice                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| Build / dev server | Vite                                                                                              |
| UI                 | React + TypeScript (strict)                                                                       |
| Styling            | Tailwind CSS v4 via `@tailwindcss/vite` (no `tailwind.config.js`, theme lives in `src/index.css`) |
| Routing            | React Router                                                                                      |
| State              | Zustand                                                                                           |
| Animation          | Framer Motion                                                                                     |
| Icons              | lucide-react                                                                                      |
| Persistence        | `localStorage` behind a repository interface                                                      |
| Tests              | Vitest + React Testing Library (jsdom)                                                            |
| Lint               | oxlint                                                                                            |

## Getting started

```bash
npm install
npm run dev
```

## Scripts

| Script                  | What it does                                    |
| ----------------------- | ----------------------------------------------- |
| `npm run dev`           | Dev server with HMR                             |
| `npm run build`         | Type-check (`tsc -b`) then production build     |
| `npm run preview`       | Serve the production build locally              |
| `npm test`              | Run the test suite once                         |
| `npm run test:watch`    | Run tests in watch mode                         |
| `npm run test:coverage` | Coverage report (scoped to `src/domain/**`)     |
| `npm run lint`          | oxlint, including the architecture import rules |
| `npm run format`        | Prettier                                        |

## Architecture

Four rings. Dependencies point inward only:

```
types/       persisted entity shapes. Imports nothing.
   ^
domain/      pure functions and all game-balance constants.
             No React, no Zustand, no DOM, no assets.
   ^
services/storage/   repository interfaces + localStorage adapters
stores/             Zustand orchestration
   ^
hooks/  ->  features/, components/     UI and animation
```

Two rules make this hold up over time:

1. **The boundary is linted, not documented.** `.oxlintrc.json` uses `no-restricted-imports`
   overrides so a `domain/` file importing React — or a `types/` file importing anything —
   fails `npm run lint`. Architecture drift becomes a broken build, not a code review debate.
2. **Derived state is never stored.** `level`, `evolutionStage` and `mood` are functions of
   `totalXp` and today's activity. `UserProgress.totalXp` is the only progression fact that
   is persisted, so retuning the level curve applies instantly to existing saves with no
   migration.

### Source layout

```
src/
  app/                  routes, providers, bootstrap (hydrate + day rollover)
  components/ui|layout  presentational primitives and app shell
  features/             habits, vito, progress, rewards, settings
  domain/               habit, progression, vito — pure game logic
  services/storage/     repository interfaces and localStorage adapters
  stores/               Zustand stores
  hooks/                the only place derived state is computed
  types/                persisted models
  utils/                date, id, cn
  test/                 Vitest setup
```

## Testing

The `domain/` ring is written test-first and is the coverage target — it is pure functions,
so anything less than full coverage there is a gap. UI coverage is not a goal. Domain
functions never call `new Date()`; `today` is always an injected `DateKey`, which is what
makes every game system deterministically testable.
