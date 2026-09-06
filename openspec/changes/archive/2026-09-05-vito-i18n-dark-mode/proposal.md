## Proposal: vito-i18n-dark-mode — ES/US-English language switching + dark mode

### Intent
- Problem: Vito is currently English-only and light-mode-only; zero i18n infra and zero dark-mode infra exist anywhere in the codebase (verified in exploration #411).
- Why now: MVP is complete through PR6 and stable; the app can absorb a cross-cutting UI change without competing with active feature work.
- Success looks like: the app auto-detects a sensible language and theme on first load, the user can override both from Settings, both preferences persist across reloads independent of habit data, and all functional UI strings render correctly in both locales.

### Scope — In scope
- New i18n ring at `src/i18n/` (hand-rolled dictionary + pure `t()` function, no new dependency) covering functional UI strings: buttons, labels, forms, empty states, Settings screen, toasts/errors/confirmations, nav labels, aria-labels.
- New dark-mode mechanism: Tailwind v4 `@custom-variant dark (&:where(.dark, .dark *));` class-based toggle + a small seeded semantic-token layer for the most-reused colors (surface/background, primary text, muted text, emerald brand accent).
- New `preferencesStore` + `PreferencesRepository` (mirrors existing `HabitRepository`/`ProgressRepository`/`VitoRepository` pattern) persisting `{ locale, theme }` via `services/storage`, hydrated in `bootstrap.ts` alongside the existing three stores.
- Initial detection: language from `navigator.language` (Spanish if the browser reports Spanish, else US English); theme from `prefers-color-scheme`, evaluated once at first load only.
- Manual override for both language and theme, exposed in the Settings screen; once toggled, no further live-following of OS theme changes.
- Both preferences explicitly excluded from the "Reset progress" wipe (`resetAll()` clears habits/history/Vito progress only).
- `domain/vito/cosmeticCatalog.ts` refactor: move embedded `name` display strings out of the pure domain ring into an id-keyed lookup in `features/rewards/` (or `i18n/`), keeping only `id` in domain data — required because domain must stay import-pure and cannot pull in i18n.
- `.oxlintrc.json` updates allowing the new `i18n/` ring to be imported from every consuming ring found in exploration: `components/**`/`components/*/*` (for the `Modal`/`ConfirmDialog`/`Toaster`/`navItems.ts` hardcoded-copy exceptions), `features/*/*`, `features/*/*/*`, `hooks/*`, `app/*`.
- Incremental, file-by-file i18n string-extraction sweep (~28-32 files) and dark-mode color sweep (~28 files), delivered as multiple slices, not one PR.

### Scope — Out of scope (explicit non-goals this cycle)
- `src/features/vito/copy/moodMessages.ts` (Vito's mood/personality voice copy) stays English-only; explicitly deferred to a future slice per user decision.
- Any language/locale beyond ES and US-English.
- Any 3rd-party i18n library (`react-i18next`, `react-intl`) or ICU-style pluralization/interpolation tooling — hand-rolled dictionary only, because the hook-based consumption model both libraries require would violate the `components/**` ring's hook-import restriction.
- Real design/illustration rework of Vito's avatar or cosmetic sprites for dark mode — this cycle gets at most a mechanical, low-effort treatment (e.g. opacity/desaturation) until real art lands.
- A 3-way System/Light/Dark toggle with live OS-following after an explicit user choice — theme is detected once at first load, then fully user-controlled (2-way Light/Dark toggle behavior going forward).
- Locale-aware date/number reformatting beyond what already exists ad hoc in `frequency.ts` (weekday names via native `Intl` where sensible) — no broader `Intl` adoption push.
- Any change to habit/completion/progress domain data or to the reset-progress wipe's existing scope, beyond excluding the two new preference keys from it.

### Approach
1. **i18n**: hand-rolled dictionary ring at `src/i18n/` (`locales/en-US.ts`, `locales/es.ts` + pure `translate.ts`), following the same "leaf ring, no state, no React" pattern already used by `types/`/`utils/`. The current locale value flows as a prop via route-level injection, extending the existing `SettingsRoute` wrapper precedent in `app/routes.tsx` to also cover `AppShell` (which currently has no prop channel from routing) — not via context/hook, which is what keeps this compatible with the `components/**` ring's hook-import restriction and is why `react-i18next`/`react-intl` were rejected in exploration.
2. **Dark mode**: Tailwind v4 CSS-first `@custom-variant dark` toggled via a `dark` class on `<html>`, applied from `app/` based on the persisted theme preference. A small semantic-token layer (`@theme` mapping for surface/text/accent) seeds the most-reused colors so the ~28-file sweep proceeds additively (`dark:` class pairing) rather than as a big-bang rewrite.
3. **Persistence**: new `PreferencesRepository` in `services/storage/`, added to the existing `Repositories` interface, backing a new `preferencesStore.ts`, hydrated in `bootstrap.ts`'s `hydrateStores()` alongside `habits`/`completions`/`progress`/`vito` — mirrors the established repository pattern exactly, no new persistence mechanism invented.
4. **Domain decoupling**: `cosmeticCatalog.ts`'s embedded `name` strings move to an id-keyed lookup outside `domain/`, keeping the domain ring pure.
5. **Delivery**: ~8 identified slices (i18n infra; 4 string-extraction slices by ring — layout, habits, rewards+domain+vito-copy, settings/app+toggle UI; dark-mode toggle infra; 2 dark-mode sweep slices — layout ring, features ring+avatar/cosmetics). Given this project's established discipline of ~400-line-budgeted, stacked-to-main chained PRs across all 6 prior MVP PRs, this is explicitly NOT a single PR — `sdd-tasks` should plan a chained delivery.

### Decisions formalized (from proposal-inputs, engram #414 — already made by the user, not open for re-litigation)
- Initial language: browser-detected (`navigator.language`); Spanish if the browser reports Spanish, else US English. Settings toggle overrides thereafter.
- Initial theme: `prefers-color-scheme`, evaluated once at first load. Settings toggle overrides thereafter (no live re-following after an explicit choice).
- Copy scope this cycle: functional UI strings only; `moodMessages.ts` explicitly deferred.
- Reset progress: wipes habit/history/Vito data only; language and theme preferences are excluded from the wipe.

### Open items deferred to design/tasks (flagged, not blocking this proposal)
- Dictionary key naming (`en-US` vs bare `en`, anticipating future English variants) — a design-phase technical call, not a product one.
- Vito avatar/cosmetic dark-mode treatment: default is the mechanical low-effort pass described in Out-of-scope; if that pass looks visually poor once implemented, re-raise with the user before committing to it as final.

### Risks
- `.oxlintrc.json` has ~10 depth-specific override blocks that all need the same new `i18n/` allowance added consistently — must land as one deliberate, reviewed diff, not ad hoc edits.
- `components/ui/Modal.tsx`, `ConfirmDialog.tsx`, `Toaster.tsx`, and `components/layout/navItems.ts` currently hardcode copy inside the presentational ring — needs either an import-allowance exception for `i18n/` or a refactor forcing props-only defaults.
- `AppShell` has no existing prop channel from routing — needs the `SettingsRoute`-style wrapper pattern extended to it via a new `AppShellRoute()`.
- Vito's avatar/cosmetics are explicitly unfinished placeholder art in the codebase — dark-mode treatment there is the highest-uncertainty, least-mechanical slice of the whole change.
- ~8-slice delivery size is a strong signal for `sdd-tasks` to plan chained/stacked PRs; treating this as a single PR or a size-exception would contradict the project's own established delivery pattern.

### Provenance
Builds directly on exploration `sdd/vito-i18n-dark-mode/explore` (engram #411) and the answered proposal question round `sdd/vito-i18n-dark-mode/proposal-inputs` (engram #414). No new question round was run for this proposal — the user explicitly asked, when answering #414, to persist those answers so a future session could go straight to `sdd-propose` without re-asking.

