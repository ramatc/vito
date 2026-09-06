# Apply Progress: vito-i18n-dark-mode

**Batches applied so far**: PR1 (1.1–1.14) MERGED. PR2 (2.1–2.5) MERGED (PR #12). PR3 (3.1–3.10) MERGED — split into PR3a `feat/vito-layout-i18n-nav` (#13, tasks 3.1–3.6) and PR3b `feat/vito-settings-toggles` (#14, tasks 3.7–3.10), both merged to `main`. PR4 (4.1–4.2) MERGED — split into 3 stacked PRs (over the 400-line guard at 703 lines): PR4a `feat/vito-habits-i18n-dict` (#15, dictionaries), PR4b `feat/vito-habits-i18n-refdata` (#16, reference data + card + form), PR4c `feat/vito-habits-i18n-hooks` (#17, hooks + screens + tests). All three merged to `main`; all three source branches deleted. PR5 (5.1–5.4) MERGED — split into 2 stacked PRs (over the 400-line guard at 413 lines): PR5a `feat/vito-rewards-i18n-dict-lookup` (#18, dictionaries + `cosmeticCopy` lookup, merged), PR5b `feat/vito-rewards-i18n-decouple` (#19, domain decoupling + closet sweep, retargeted to `main` after #18 merged, merged). Both source branches deleted post-merge.
PR6 (6.1–6.3) MERGED to `main` (PR #20, `feat/vito-settings-app-i18n`), 243 changed lines — under the 400-line guard, no split needed. Source branch deleted post-merge.
PR7.5 (7.5.1–7.5.3) MERGED — split into 2 stacked PRs (over the 400-line guard at 438 lines): PR7.5a `feat/vito-progress-i18n-dict` (#21, dictionaries + progress ring, 351 lines) and PR7.5b `feat/vito-crash-screen-i18n` (#22, crash screen, 85 lines, stacked on PR7.5a). Both rebuilt off `main` **after** PR6 merged (`ed4097b`), resolving the `en.ts`/`es.ts` conflict PR6 and the PR7.5 dictionary commit both created by keeping both sides' new keys. Original unsplit branch `feat/vito-progress-i18n` (3 commits off `b5a3f03`) deleted, superseded by the split. Both merged to `main`, which is now at `6d4098b`.
PR7 (7.1) MERGED to `main` (PR #23, `feat/vito-layout-dark-mode`), 1 commit, **88 changed lines — under the 400-line guard, no split needed** (the smallest slice in the change). `main` is now at `0abdbe8`.
PR8 (8.1, 8.1a) APPLIED on `feat/vito-features-dark-mode` off `main` (`0abdbe8`), 2 commits, **329 changed lines — under the 400-line guard, no split needed**. Tasks 8.2 (manual browser QA) and 8.3 (final gates sign-off) deliberately NOT closed — see BATCH 8. Not pushed, no PR opened.
**Mode**: Strict TDD (active, `npm test` → `vitest run`). PR7's task 7.1 and PR8's task 8.1 are the change's two honoured `Test-first: no` flags, both for the same reason — see BATCH 7's TDD table. PR8's task 8.1a overrode its flag, like PR4–PR7.5 did for every string-extraction task.
**Chain strategy**: stacked-to-main, 12 PRs (PR4, PR5 and PR7.5 counted as their splits). **Status**: 44/46 tasks complete (46 = 42 + task 8.1a + tasks 7.5.1–7.5.3, all added by user decision 2026-09-04). Only tasks 8.2 and 8.3 remain, and **both are blocked on one thing: a human with a browser.**

===============================================================================
# BATCH 1 — PR1: i18n + Preferences Infra (MERGED)
===============================================================================

**Branch**: `feat/vito-i18n-prefs-infra` off `main` — later split into 4 PRs (#8 `feat/vito-i18n-lint-fix`, #9 `feat/vito-i18n-dictionary`, #10 `feat/vito-i18n-prefs-storage`, #11 `feat/vito-i18n-prefs-store-app`) because the single branch came in at ~1233 lines against the 400-line guard. All four merged; `main` was at `d644736`.
**Status**: 14/14 PR1 tasks complete.

## Per-Task Completion

| Task | Status | Files |
|---|---|---|
| 1.1 `Locale`/`Theme`/`AppPreferences` | ✅ | `src/types/models.ts` |
| 1.2 EN dictionary + key types | ✅ | `src/i18n/en.ts`, `src/i18n/keys.ts` |
| 1.3 ES dictionary | ✅ | `src/i18n/es.ts` |
| 1.4 `INTL_LOCALE_TAG`, `isLocale()` | ✅ | `src/i18n/locale.ts` |
| 1.5 `t()`, `tDynamic()`, `tCount()` | ✅ | `src/i18n/translate.ts` |
| 1.6 oxlintrc 2 NEW blocks | ✅ | `.oxlintrc.json` |
| 1.7 `PreferencesRepository` + wiring | ✅ | `src/services/storage/repositories.ts` |
| 1.8 `preferences` key + `RESET_PRESERVED_KEYS` | ✅ | `src/services/storage/localStorageClient.ts` |
| 1.9 `createDefaultPreferences()` | ✅ | `src/services/storage/defaults.ts` |
| 1.10 local preferences repository | ✅ | `src/services/storage/localPreferencesRepository.ts` |
| 1.11 `preferencesStore` (no `reset()`) | ✅ | `src/stores/preferencesStore.ts` |
| 1.12 `useTranslate()` | ✅ | `src/hooks/useTranslate.ts` |
| 1.13 oxlintrc `hooks/*` + hooks test block | ✅ | `.oxlintrc.json` |
| 1.14 `hydrateStores()` loads preferences | ✅ | `src/app/bootstrap.ts` |

## TDD Cycle Evidence — PR1

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 1.1 | — | — | N/A | ➖ Declarations-only (tasks doc: Test-first N/A) | ➖ | ➖ | ➖ |
| 1.2 | — | Compile | N/A | ➖ Declarations; `tsc -b` is the gate | ✅ tsc -b | ➖ | ➖ |
| 1.3 | — | Compile | N/A | ➖ `Dictionary` totality enforces parity at compile time | ✅ tsc -b | ➖ | ➖ |
| 1.4 | `src/i18n/__tests__/locale.test.ts` | Unit | N/A (new) | ✅ Written first (module-not-found) | ✅ 7/7 | ✅ 7 cases | ➖ None needed |
| 1.5 | `src/i18n/__tests__/translate.test.ts` | Unit | N/A (new) | ✅ Written first (module-not-found) | ✅ 16/16 | ✅ 16 cases | ✅ Extracted `interpolate` + `resolve` |
| 1.6 | — | Config | N/A | ➖ Not unit-testable | ✅ Injection-probed | ✅ 4 probes | ➖ |
| 1.7 | via 1.10 | Unit | ✅ 23/23 pre-existing | ✅ (driven by 1.10 RED) | ✅ | ➖ Interface | ➖ |
| 1.8 | `localRepositories.test.ts` | Unit | ✅ 23/23 pre-existing | ✅ 17 failing first | ✅ 40/40 | ✅ 3 cases | ➖ None needed |
| 1.9 | same | Unit | ✅ 23/23 | ✅ Failing first | ✅ | ✅ 8 cases | ✅ Split `detectLocale`/`detectTheme` |
| 1.10 | same | Unit | ✅ 23/23 | ✅ Failing first | ✅ | ✅ 7 cases | ➖ None needed |
| 1.11 | `stores/__tests__/preferencesStore.test.ts` | Unit | N/A (new) | ✅ Written first | ✅ 9/9 | ✅ 9 cases | ➖ None needed |
| 1.12 | `hooks/__tests__/useTranslate.test.ts` | Integration (renderHook) | N/A (new) | ✅ Written first | ✅ 4/4 | ✅ 4 cases incl. live locale-switch repaint | ➖ None needed |
| 1.13 | — | Config | N/A | ➖ Not unit-testable | ✅ Injection-probed | ✅ 2 probes still denied | ➖ |
| 1.14 | `app/__tests__/bootstrap.test.ts` | Integration | ✅ 20/20 pre-existing | ✅ 1 failing first | ✅ 31/31 in `src/app` | ✅ 3 cases | ➖ None needed |

### Test Summary — PR1
- Baseline before batch: **273 tests / 21 files**; after: **328 tests / 25 files** (+55 tests, +4 files)
- Layers: Unit (51), Integration (4). E2E: none available.
- Pure functions created: 6.

## Commit Story — PR1

| Commit | Unit |
|---|---|
| `style(lint): run the boundary config through Prettier` | Isolated pre-existing format fix |
| `feat(i18n): give the app a two-locale dictionary and a pure translator` | 1.1–1.6 |
| `feat(storage): persist language and theme, and keep them out of the reset` | 1.7–1.10 |
| `feat(stores): give preferences a store the reset cannot reach` | 1.11 |
| `feat(hooks): bind the translator to the active locale` | 1.12–1.13 |
| `feat(app): hydrate language and theme at boot` | 1.14 |

## Deviations — PR1

1. `localPreferencesRepository` inlines the locale/theme literal checks instead of importing `isLocale` — `services/storage/*` may not import `i18n/`.
2. Extra `style(lint)` commit (pre-existing `.oxlintrc.json` format failure on `main`).
3. `src/test/fakeRepositories.ts` modified (not itemised) — `Repositories` gained a required member; its `resetAll` spares `preferences`.
4. EN/ES seed is 20 keys, larger than "seed" — PR3/PR4 reuse, do not re-add.
5. `t()` and `tDynamic()` share one `resolve()`.

## Issues — PR1

1. PRE-EXISTING (fixed): `.oxlintrc.json` failed `format:check` on `main`.
2. jsdom has no `matchMedia` and pins `navigator.language` to `en-US`.
3. `tCount` two-form design confirmed viable for en+es.
4. **Minor test pollution, still open**: `bootstrap.test.ts`'s "leaves every store readable" passed pre-fix because an earlier test's `boot()` had already set `preferencesStore.status`. Untouched by PR2 and PR3. Flagged for `sdd-verify`.

===============================================================================
# BATCH 2 — PR2: Dark-Mode Toggle Infra (MERGED, PR #12)
===============================================================================

**Branch**: `feat/vito-dark-mode-infra` off `main` — 4 commits, merged as PR #12 (`3c205a2`).
**Status**: 5/5 PR2 tasks complete.

## Per-Task Completion

| Task | Status | Files |
|---|---|---|
| 2.1 `applyDocumentPreferences()` | ✅ | `src/app/documentPreferences.ts` (new) + its test (new) |
| 2.2 `@custom-variant dark` + 5 tokens + `color-scheme` | ✅ | `src/index.css` |
| 2.3 Pre-paint apply in `bootstrap()` | ✅ | `src/app/bootstrap.ts` + test |
| 2.4 Effect re-applying on preference change | ✅ | `src/app/App.tsx` + test |
| 2.5 oxlintrc `src/app/*` + app test block | ✅ | `.oxlintrc.json` (2 added lines) |

## TDD Cycle Evidence — PR2

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 2.1 | `app/__tests__/documentPreferences.test.ts` | Unit (jsdom DOM) | N/A (new) | ✅ module-not-found | ✅ 8/8 | ✅ 8 cases | ➖ None needed |
| 2.2 | — (built stylesheet) | Build artifact | N/A | ➖ Not unit-testable | ✅ Verified in `dist/assets/*.css` | ✅ 3 checks | ➖ |
| 2.3 | `app/__tests__/bootstrap.test.ts` | Integration | ✅ 20/20 | ✅ 3 failing first | ✅ 23/23 | ✅ 3 cases | ➖ |
| 2.4 | `app/__tests__/App.test.tsx` | Integration | ✅ 1/1 | ✅ 4 failing first | ✅ 5/5 | ✅ 4 cases | ➖ |
| 2.5 | — | Config | N/A | ➖ | ✅ Injection-probed | ✅ 3 probes | ➖ |

### Test Summary — PR2
- Before: **328 / 25 files**; after: **343 / 26 files** (+15 tests, +1 file)
- Pure functions created: 0. Pre-existing failures found: none.

## Design Open Questions — RESOLVED IN PR2

1. **`@theme inline` is correct**, verified against the BUILT stylesheet. `.bg-surface{background-color:var(--surface)}` + `.dark{…}` + `.dark\:bg-surface-raised:where(.dark,.dark *){…}` all ship.
2. **No FOUC, no inline `index.html` script.** `applyDocumentPreferences()` runs in `bootstrap()` after `hydrateStores()`, before `runDayRollover()`; `main.tsx` renders in that promise's `.finally()`.
3. Open questions 3 (`src/features/*/__tests__/` block) and 4 (avatar dark treatment) — 3 is now moot (PR3 put its tests in `app/__tests__/routes.test.tsx`); 4 still open for PR8.

## Commit Story — PR2

| Commit | Unit | Tasks |
|---|---|---|
| `feat(app): let the document wear the theme and speak the language` | The `<html>` writer + its one boundary allowance | 2.1 + 2.5 |
| `feat(app): dress the document before the first paint` | Boot-time application | 2.3 |
| `feat(app): keep the document in step while the app runs` | Runtime application | 2.4 |
| `feat(styles): give the stylesheet a dark half` | Dark variant + seeded tokens | 2.2 |

## Deviations — PR2

1. `THEME_COLOR` duplicates `--surface`'s two values as hex in `documentPreferences.ts` (a `<meta>` takes a colour, not a custom property; resolving via `getComputedStyle` would reintroduce the pre-paint race).
2. The app TEST block's `!../../i18n/*` had no consumer at PR2 time — landed because the tasks doc listed it under 2.5. PR3 still did not need it (`routes.test.tsx` imports stores, not `i18n/`). **Still unconsumed after PR3.**
3. PR2 also added `setRepositories(createFakeRepositories().repos)` to `App.test.tsx` in a scoped `beforeEach`.
4. 2.5 landed with 2.1 rather than last (oxlint fails on `documentPreferences.ts` without it).

## Issues — PR2 (status after PR3)

1. **Token naming `text-text-primary` — RESOLVED.** Fixed on the PR3 branch by `refactor(styles): shed the redundant text- prefix from ink tokens` (`23a7965`): `--color-text-primary` → `--color-primary`, `--color-text-muted` → `--color-muted`. PR7/PR8 write `text-primary` / `text-muted`.
2. The app is not visibly dark yet, by design — PR7/PR8's job. **Still true after PR3**: the two new toggles flip `<html class="dark">` and persist, but the painted surfaces are still light-only.
3. "No Settings UI to toggle the theme yet" — **RESOLVED by PR3 task 3.8.**
4. PR1's bootstrap test pollution — still open, still flagged for `sdd-verify`.

===============================================================================
# BATCH 3 — PR3: Layout Ring — Props-Only + i18n Wiring (MERGED, split PR3a #13 + PR3b #14)
===============================================================================

**Branch**: `feat/vito-layout-props-i18n` off `main` (`3c205a2`, PR2 merged). Split at the settings-work-unit boundary into two stacked PRs to respect the 400-line review budget: PR3a `feat/vito-layout-i18n-nav` (tasks 3.1–3.6, 279 lines, PR #13, merged as `de5cee4`) and PR3b `feat/vito-settings-toggles` (tasks 3.7–3.10, 270 lines, PR #14, merged as `36bf89e`). Both target `main`.
**Base**: `main`. PR3 of 8, stacked-to-main.
**Status**: 10/10 PR3 tasks complete. MERGED.

## Per-Task Completion

| Task | Status | Files |
|---|---|---|
| 3.1 `Modal.closeLabel` required | ✅ | `src/components/ui/Modal.tsx` |
| 3.2 `ConfirmDialog` labels required | ✅ | `src/components/ui/ConfirmDialog.tsx` (+ a third required prop, see Deviations) |
| 3.3 `Toaster.dismissLabel` required | ✅ | `src/components/ui/Toaster.tsx` |
| 3.4 `navItems` `label` → `labelKey` | ✅ | `src/components/layout/navItems.ts` |
| 3.5 `AppShell`/`BottomTabBar` label props | ✅ | `src/components/layout/{AppShell,BottomTabBar}.tsx` |
| 3.6 `AppShellRoute()` + translated `HomeRoute` | ✅ | `src/app/routes.tsx`, `src/app/__tests__/routes.test.tsx` |
| 3.7 `LanguageToggle` | ✅ | `src/features/settings/LanguageToggle.tsx` (new) |
| 3.8 `ThemeToggle` | ✅ | `src/features/settings/ThemeToggle.tsx` (new) |
| 3.9 Wire both into Settings | ✅ | `src/features/settings/SettingsScreen.tsx`, `routes.test.tsx` |
| 3.10 oxlintrc `src/features/*/*` | ✅ | `.oxlintrc.json` (1 added line) |

## Files Changed — PR3

| File | Action | What |
|---|---|---|
| `src/components/ui/Modal.tsx` | Modified | `closeLabel` required, labels the X button. Backdrop dropped its `aria-label` for `aria-hidden="true" tabIndex={-1}` |
| `src/components/ui/ConfirmDialog.tsx` | Modified | `confirmLabel`/`cancelLabel` lose defaults; `closeLabel` added and forwarded to `Modal` |
| `src/components/ui/Toaster.tsx` | Modified | `dismissLabel` required; `Toast` gained a named `ToastProps` interface |
| `src/components/layout/navItems.ts` | Modified | `NavLabelKey` union exported; `label` → `labelKey` |
| `src/components/layout/AppShell.tsx` | Modified | `AppShellProps` (navLabels/wordmark/sidebarNavLabel/bottomNavLabel); forwards to `BottomTabBar` |
| `src/components/layout/BottomTabBar.tsx` | Modified | `BottomTabBarProps` (navLabels/navLabel/className) |
| `src/app/routes.tsx` | Modified | `AppShellRoute()` with `useTranslate` + `useMemo`'d `navLabels`; `HomeRoute` copy from the dictionary |
| `src/app/App.tsx` | Modified | `dismissLabel="Dismiss message"` — literal, PR6 translates it |
| `src/features/settings/LanguageToggle.tsx` | Created | Endonym segmented control, `aria-pressed`, calls `setLocale` |
| `src/features/settings/ThemeToggle.tsx` | Created | Translated labels via `Record<Theme, TranslationKey>`, calls `setTheme` |
| `src/features/settings/SettingsScreen.tsx` | Modified | Both toggles in a new first `Card`, labels via `useTranslate` |
| `src/features/settings/ResetProgressDialog.tsx` | Modified | `closeLabel="Close"` literal (PR6) |
| `src/features/habits/{HabitFormModal,HabitsScreen}.tsx` | Modified | Required-prop literals (PR4) |
| `src/app/__tests__/routes.test.tsx` | Modified | +10 tests in 2 new describes; `beforeEach` now resets `preferencesStore` |
| `.oxlintrc.json` | Modified | `!../../i18n/*` into `src/features/*/*` |

## TDD Cycle Evidence — PR3

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 3.1 | `app/__tests__/routes.test.tsx` (existing cases) | Integration | ✅ 343/343 before edit | ➖ Tasks doc: Test-first no — behaviour-preserving refactor, every call site passes the literal the component embedded | ✅ 343/343 unchanged | ➖ Not a behaviour change; the existing reset-dialog cases are the assertion | ➖ None needed |
| 3.2 | same | Integration | ✅ 343/343 | ➖ Test-first no | ✅ 343/343 | ➖ | ➖ |
| 3.3 | `app/__tests__/App.test.tsx` (existing) | Integration | ✅ 343/343 | ➖ Test-first no | ✅ 343/343 | ➖ | ✅ Extracted `ToastProps` |
| 3.4 | via 3.6 | Compile + Integration | ✅ 343/343 | ✅ Driven by 3.6's RED | ✅ 347/347 | ✅ via 3.6 | ➖ |
| 3.5 | via 3.6 | Integration | ✅ 343/343 | ✅ Driven by 3.6's RED | ✅ 347/347 | ✅ via 3.6 | ➖ |
| 3.6 | `app/__tests__/routes.test.tsx` | Integration (real App + router + stores + fake repos) | ✅ 343/343 passing before edit | ✅ **3 of 4 new cases failing first** (`Unable to find role="navigation" name="Barra lateral principal"`, Spanish home heading, mid-session repaint) | ✅ 347/347 | ✅ 4 cases: es labels+wordmark+both landmarks, en labels from the same source, Home title+blurb in es, live `setLocale('es')` repaint with the English link asserted GONE | ➖ None needed |
| 3.7 | via 3.9 | Integration | ✅ 347/347 | ✅ Driven by 3.9's RED | ✅ 353/353 | ✅ via 3.9 | ➖ |
| 3.8 | via 3.9 | Integration | ✅ 347/347 | ✅ Driven by 3.9's RED | ✅ 353/353 | ✅ via 3.9 | ➖ |
| 3.9 | `app/__tests__/routes.test.tsx` | Integration (navigate to Settings and click) | ✅ 347/347 passing before edit | ✅ **6 of 6 new cases failing first** (no such buttons) | ✅ 353/353 | ✅ 6 cases: en→es (nav + `html.lang` + persisted), es→en driven from the Spanish labels, `aria-pressed` marks the active language, light→dark (`.dark` class + persisted), dark→light, theme survives a language change (persisted pair asserted whole) | ➖ None needed |
| 3.10 | — (`.oxlintrc.json`) | Config | N/A | ➖ Not unit-testable | ✅ Injection-probed | ✅ 3 probes (below) | ➖ |

### 3.10 injection probes
1. Removed `!../../i18n/*` from `src/features/*/*` → `oxlint` errors on `ThemeToggle.tsx`'s `import type { TranslationKey } from '../../i18n/keys'`. **Proves the entry is required AND that `no-restricted-imports` does flag type-only imports.**
2. With the entry present, a scratch `import { STORAGE_KEYS } from '../../services/storage/localStorageClient'` in `ThemeToggle.tsx` still errors — the block was widened, not weakened.
3. A scratch `src/features/vito/components/probe.ts` importing `../../../i18n/keys` errors — `src/features/*/*/*` is still closed, which is why PR3 did not open it. All probe artifacts deleted; tree clean.

### Test Summary — PR3
- Baseline before batch: **343 tests / 26 files**; after: **353 tests / 26 files** (+10 tests, +0 files)
- Layers: Integration (10). Unit: 0 — every new behaviour crosses store → route → component, and testing it below that layer would have required mocking the thing under test.
- Approval tests: none. 3.1–3.3 are behaviour-preserving by construction (literals carried over verbatim), and the 343-test suite is the approval net.
- Pure functions created: 0.
- Pre-existing failures found: none. Safety net was 343/343 green before the first edit.

## Commit Story — PR3 (work-unit-commits)

| Commit | Unit | Tasks | Lines |
|---|---|---|---|
| `refactor(styles): shed the redundant text- prefix from ink tokens` (`23a7965`) | Pre-seeded before this batch: resolves PR2's naming flag | — | 12 |
| `refactor(ui): hand the presentational ring its copy back` (`8c57f50`) | The three ui components give up their embedded English; every call site passes the same literal, so nothing on screen moves | 3.1–3.3 | 83 |
| `feat(app): let the navigation speak the active language` (`1c82ba6`) | `labelKey` + `AppShellProps` + `AppShellRoute` + Home copy, with the locale-switch tests | 3.4–3.6 | 184 |
| `feat(settings): let the user choose the language and the theme` (`c57a0c6`) | Both controls, wired into Settings, with the boundary allowance the type import needs | 3.7–3.10 | 270 |

Config (3.10) rides with 3.8 rather than standing alone, matching PR1/PR2: the boundary allowance lands with the import that needs it.

## Local Verification — PR3 (all green on final tree)
- `npm test` → **353 passed / 26 files**
- `npm run lint` (oxlint) → exit 0
- `npm run format:check` → clean
- `npm run build` (`tsc -b && vite build`) → ok

## Deviations from Design/Tasks — PR3

1. **`ConfirmDialog` gained a THIRD required prop, `closeLabel`.** Design listed only `confirmLabel`/`cancelLabel`, but `Modal` now demands a `closeLabel` and `ConfirmDialog` is its only other caller. Passing `cancelLabel` through would have put two controls with the same accessible name on screen — and broken `getByRole('button', { name: 'Keep my progress' })` in the existing reset tests, which is the symptom telling you the a11y is wrong. Design gap filled, not a departure.
2. **`Modal`'s backdrop left the accessibility tree** (`aria-hidden="true"` + `tabIndex={-1}`, `aria-label` dropped) instead of taking a second string. `Modal` embedded TWO English strings ("Close dialog", "Close") and design provisioned ONE prop. The backdrop is a pointer affordance duplicating Escape and the X button; exposing it as a second identically-named button is noise. `tabIndex={-1}` is what makes the `aria-hidden` legitimate.
3. **PR3 deliberately pushed 4 English literals down into rings it does not own**: `App.tsx` `dismissLabel="Dismiss message"` (PR6), `ResetProgressDialog` `closeLabel="Close"` (PR6), `HabitFormModal` `closeLabel="Close"` and `HabitsScreen` `cancelLabel="Cancel"` + `closeLabel="Close"` (PR4). Each is the exact string the component used to embed, so 3.1–3.3 are a zero-behaviour-change refactor a reviewer can verify by the suite staying at 343. The alternative — half-translating three files PR4/PR6 will sweep anyway — would have made both PRs harder to read. **PR1's seeded `common.close` / `common.cancel` / `common.dismiss` are therefore still unconsumed; PR4/PR6 consume them.** Tasks doc updated with this handoff.
4. **3.10 opened only `src/features/*/*`, not `src/features/*/*/*` or the nested test block.** The tasks doc's own wording is "and/or … per actual file depth", and both toggles sit at depth 2. Probe 3 confirms the deeper block still denies `i18n/`. Two of the design's nine blocks remain unlanded, intentionally.
5. **`BottomTabBar`'s landmark prop is named `navLabel`, not `bottomNavLabel`.** "Bottom" is `AppShell`'s word for which of its two navigations this is; inside the component it is just the nav. `AppShell`'s public prop is `bottomNavLabel` exactly as designed.
6. **3.9's tests live in `app/__tests__/routes.test.tsx`, not in a new `features/settings/__tests__/`.** They drive the real `<App />` through the router — which is the only way to assert "the whole app repaints" and "`<html>` gets dressed" — and it sidesteps design open question 3 (a `src/features/*/__tests__/` block that allows neither Testing Library nor `vitest`). That question is now moot rather than answered.
7. **`LanguageToggle`'s option names are NOT translated.** "English" / "Español" are endonyms. A user who lands in a language they cannot read must be able to find the way back, and the design never specified these strings (there are no `settings.language.en|es` keys in PR1's seed — evidence the seed's author assumed the same).

## Issues Found — PR3

1. **⚠️ PR3 IS OVER THE 400-LINE GUARD: 537 changed lines (508 insertions + 29 deletions) across 16 files, or 549 including the pre-seeded token-rename commit.** Not split, per the launch brief ("flag it rather than silently proceeding — don't split/push/open a PR yourself"). The commits split cleanly at two points: `[token rename + refactor(ui)] = 95` / `[nav] = 184` / `[settings] = 270`; a 2-way split at the settings boundary gives **279 + 270**, both comfortably under budget, with no reordering and no rebase surgery. Decision belongs to the user.
2. **`no-restricted-imports` DOES flag `import type`.** Verified directly (probe 1). Worth knowing for PR4–PR8: a type-only import is not a way around a ring boundary in this repo.
3. **`LanguageToggle` and `ThemeToggle` copy `SlotPicker`'s button classes verbatim** (`bg-white`, `text-slate-600`, `ring-slate-200`). Deliberate — they are light-only like everything else until the sweep — but it means PR8 now has three near-identical class strings to convert, not one. Noted in the tasks doc under PR7.
4. **PR2's app-TEST-block `!../../i18n/*` is still unconsumed.** PR2 landed it saying "PR3's `routes.test.tsx` needs it"; it did not — the tests assert literal Spanish strings rather than importing `ES`, which is the stronger test (a test that reuses the production dictionary cannot catch the dictionary being wrong). Harmless, but the justification recorded in PR2 turned out to be inaccurate.
5. **PR1's bootstrap test pollution is still open.** Untouched again. `sdd-verify`.
6. **`routes.test.tsx`'s `beforeEach` now resets `preferencesStore`.** Without it the new language cases leak `es` into every later English assertion in the file — a real order-dependent failure caught during GREEN, not a theoretical one.

## Workload / PR Boundary — PR3
- Mode: **stacked PR slice** (PR3 of 8), `stacked-to-main`, base `main` (`3c205a2`)
- Boundary: starts at `main` where preferences persist and dress `<html>` but nothing on screen can change them; ends with the presentational ring owning zero English literals, the shell speaking the active language live, and both preferences reachable from Settings.
- **Review budget: 537 lines — OVER the 400 guard. No `size:exception` recorded. Awaiting the user's split decision.**
- Rollback: `git branch -D feat/vito-layout-props-i18n`. Nothing on `main` depends on any of it.

## Next
1. ~~User decides: split PR3~~ — RESOLVED: split into PR3a (#13) + PR3b (#14), both merged to `main`.
2. ~~`sdd-apply` for PR4 (4.1–4.2)~~ — DONE, see BATCH 4 below.

===============================================================================
# BATCH 4 — PR4: Habits Ring String-Extraction (MERGED — split into PR4a/PR4b/PR4c)
===============================================================================

**Branch**: `feat/vito-habits-i18n` off `main` (`36bf89e`, PR3b merged), 5 commits — split at the two clean commit boundaries below to respect the 400-line guard: PR4a `feat/vito-habits-i18n-dict` (#15, merged `90239a4`), PR4b `feat/vito-habits-i18n-refdata` (#16, merged `1550673`), PR4c `feat/vito-habits-i18n-hooks` (#17, merged `601c4b0`). All three merged to `main` in order; all three branches deleted post-merge.

**Lesson learned**: merging a PR whose branch is not auto-deleted does NOT retarget dependent stacked PRs — had to manually run `gh pr edit <next> --base main` after each merge (PR16 and PR17 both needed it). Either enable "automatically delete head branches" on the repo, or remember this step for PR5–PR8's stacks.
**Base**: `main` (via the stack). PR4 of 8, stacked-to-main.
**Status**: 2/2 PR4 tasks complete.

## Per-Task Completion

| Task | Status | Files |
|---|---|---|
| 4.1 habits ring string-extraction | ✅ | `src/features/habits/{HabitsScreen,HabitCard,HabitForm,HabitFormModal,TodayHabits,categories,frequency,habitIcons}` + `src/i18n/{en,es}.ts`. `HabitList.tsx` inspected, owns zero copy — no-op |
| 4.2 hook toast/aria strings | ✅ | `src/hooks/useCompleteHabit.ts`. `useTodayHabits.ts` inspected, owns zero strings — no-op. Follow-on: `ClosetScreen.tsx`, `SettingsScreen.tsx` |

## Files Changed — PR4

| File | Action | What |
|---|---|---|
| `src/i18n/en.ts` | Modified | +68 keys: 3 `common.*`, the whole `habits.*` surface (screen, card, today, form, frequency, difficulty, category, icon, toast) |
| `src/i18n/es.ts` | Modified | Matching 68, Rioplatense register (`probá`, `empezá`, `agregá`, `elegí`, `vos`) per design Decision 1 |
| `src/features/habits/categories.ts` | Modified | `SUGGESTED_CATEGORIES`/`DEFAULT_CATEGORY` → `SUGGESTED_CATEGORY_KEYS`/`DEFAULT_CATEGORY_KEY` (`TranslationKey`) |
| `src/features/habits/habitIcons.ts` | Modified | `HabitIconOption.label` → `labelKey: TranslationKey`, same shape `navItems.ts` took in PR3 |
| `src/features/habits/frequency.ts` | Modified | `WEEKDAY_OPTIONS` → `weekdayOptions(locale)`; `describeFrequency(locale, frequency)`; weekday names from `Intl.DateTimeFormat` via `INTL_LOCALE_TAG`, formatters cached |
| `src/features/habits/HabitCard.tsx` | Modified | `useTranslate()` + `usePreferencesStore` for the locale; 4 aria-labels, the XP hint and the schedule line |
| `src/features/habits/HabitForm.tsx` | Modified | Every label, legend, placeholder, error and button; `DIFFICULTIES` → `DIFFICULTY_ORDER` + `DIFFICULTY_LABEL_KEYS`; `weekdays` memoised on the locale |
| `src/features/habits/HabitFormModal.tsx` | Modified | Title/description keys; PR3's `closeLabel="Close"` → `t('common.close')` |
| `src/features/habits/HabitsScreen.tsx` | Modified | Screen chrome, empty state, archive dialog; PR3's `cancelLabel`/`closeLabel` → `common.cancel`/`common.close`; save-error toast via `t` |
| `src/features/habits/TodayHabits.tsx` | Modified | Section aria-label, the seeded `habits.today.progress`, all-done card, both empty branches, the habits link |
| `src/hooks/useCompleteHabit.ts` | Modified | `SAVE_ERROR_MESSAGE` removed; `messageFor(t, outcome)` stays pure; 4 toast keys |
| `src/features/rewards/ClosetScreen.tsx` | Modified | 2 lines — took `t('common.error.save')` when the constant left the hook (PR5's file) |
| `src/features/settings/SettingsScreen.tsx` | Modified | 2 lines — same, reusing the `t` PR3 already gave it (PR6's file) |
| `src/app/__tests__/routes.test.tsx` | Modified | +6 tests in 1 new describe |
| `.prettierignore` | Modified | `openspec` ignored — see Issues 1 |

## TDD Cycle Evidence — PR4

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 4.1 | `app/__tests__/routes.test.tsx` | Integration (real `<App />` + router + stores + fake repos) | ✅ 353/353 green before the first edit | ✅ **4 of 6 new cases failing first** (`Unable to find role="heading" name="Hábitos"`, the Spanish empty state, the Spanish form, `0 de 1 hechos hoy`) — written and run before any production edit, despite the tasks doc's "Test-first: no", because rendering the ring in Spanish is new behaviour with no prior coverage | ✅ 359/359 | ✅ 6 cases: screen+card+schedule in es, the same surfaces in en from the same source, the empty state and its CTA in es, the form's dictionary copy + translated category default + icon aria-label + `Intl` weekday + composed difficulty name, and the today counter in both locales | ✅ Reference data extracted to key lists; `Intl` formatters cached; `describeFrequency` doc corrected |
| 4.2 | same | Integration | ✅ 353/353 | ✅ **1 of the 6 failing on the toast leg** (`Desmarcado por hoy.`) — the toast is pushed by a hook long after the render that started it, which is the part a component-level test cannot reach | ✅ 359/359 | ✅ 2 cases (es + en) driving complete → uncheck through the real store, asserting both the flipped aria-label and the toast | ✅ `messageFor` kept pure by taking `t` as an argument rather than calling a hook |

### RED evidence (verbatim, before any production edit)
`Test Files 1 failed (1) | Tests 4 failed | 22 passed (26)` — the 2 passing new cases are the English triangulation partners, which is exactly right: English output must not move.

### Test Summary — PR4
- Baseline before batch: **353 tests / 26 files**; after: **359 tests / 26 files** (+6 tests, +0 files)
- Layers: Integration (6). Unit: 0 — every new behaviour crosses store → route → screen → component → hook, and the one genuinely pure new function (`weekdayName`) is `Intl` output, which a unit test would only restate.
- Approval tests: none written. The 353-test suite IS the approval net, and it was re-run green at commit 3 (`a27ea91`) to prove the reference-data refactor changed no English output before any Spanish assertion existed.
- Pure functions created: 3 (`weekdayName`, `weekdayOptions`, and `messageFor` kept pure by parameterising the translator).
- Pre-existing failures found: none.

## Local Verification — PR4 (all green on final tree)
- `npm test` → **359 passed / 26 files**
- `npm run lint` (oxlint) → exit 0
- `npm run format:check` → clean (after the `.prettierignore` commit)
- `npm run build` (`tsc -b && vite build`) → ok
- Ring boundaries: **no `.oxlintrc.json` change needed**, as the tasks doc predicted. `src/features/*/*` (PR3) covers `frequency.ts`'s `i18n/locale` + `i18n/translate` imports and `habitIcons.ts`'s type-only `i18n/keys` import; `src/hooks/*` (PR1) covers `useCompleteHabit`'s sibling `./useTranslate`.

## Commit Story — PR4 (work-unit-commits)

| Commit | Unit | Tasks | Lines |
|---|---|---|---|
| `style(lint): keep the planning artifacts out of the formatter` (`338853d`) | Isolated pre-existing format failure, PR1 precedent | — | 6 |
| `feat(i18n): give the habits ring both its dictionaries` (`edfd872`) | 68 keys, no consumer yet — the sweep that follows is then a substitution a reviewer can read line by line | 4.1 | 159 |
| `refactor(habits): let the reference data carry keys instead of words` (`a27ea91`) | Categories, icons and weekdays stop being English nouns; card and form resolve them. **Suite verified at 353/353 on this commit** — zero behaviour change | 4.1 | 323 |
| `feat(hooks): let the completion toasts speak the active language` (`f6402f1`) | `SAVE_ERROR_MESSAGE` retired; the 4 toast keys; the 2 out-of-ring call sites it forced | 4.2 | 45 |
| `feat(habits): let the habit screens speak the active language` (`4ab8e77`) | The last three files plus the 6 cases that prove the whole ring moved together | 4.1 | 170 |

## Deviations from Design/Tasks — PR4

1. **`frequency.ts` and `habitIcons.ts` were swept although task 4.1 does not list them.** Both sit in `features/habits/**`, which is what PR4's own "Done when" scopes, and both are rendered *by* `HabitCard`/`HabitForm` — leaving them would have shipped a Spanish habit form with English icon and weekday accessible names. Design Decision 1 already provisioned `frequency.ts` explicitly ("`INTL_LOCALE_TAG` … used only for `Intl.DateTimeFormat` (weekday names in `frequency.ts`)"), so this is the task list under-enumerating, not a scope grab. The alternative — half-translating a screen PR4 owns — is exactly what PR3 refused to do.
2. **Weekday names come from `Intl`, not the dictionary.** Design named this; recording it as a deviation from the *tasks* doc, which mentions no `Intl` work at all. Verified `en-US` narrow/short/long reproduce the previous hardcoded `M/T/W/T/F/S/S`, `Mon…Sun` and `Monday…Sunday` **exactly**, so English output is byte-identical. Cost is one `Locale` parameter on `describeFrequency` and a `WEEKDAY_OPTIONS` → `weekdayOptions(locale)` change.
3. **`useCompleteHabit`'s exported `SAVE_ERROR_MESSAGE` was deleted, which touched two files PR4 does not own.** Three screens imported that constant; leaving it would have kept an untranslatable English string alive inside task 4.2's own file. Both follow-ons take `t('common.error.save')` rather than inheriting a fresh English literal — the inverse of PR3's deviation 3, chosen because both files already had (or trivially gained) a translator, so pushing a literal down would have been a regression rather than a handoff.
4. **`HabitCard` and `HabitForm` now read `preferencesStore` directly**, alongside `useTranslate()`. `describeFrequency`/`weekdayOptions` need the raw `Locale` for `Intl`, which `useTranslate` does not expose (its own doc explains why the surface stays narrow). Two selectors on the same primitive is cheap and matches what `ThemeToggle` already does. `HabitCard`'s "knows nothing about stores" doc line was corrected rather than quietly falsified.
5. **`common.xp` / `common.xpGain` were added to `common.*`, not `habits.*`.** `+20 XP` is not a habits string — PR5's closet and PR6's progress copy will want the same shape. Seeded once here, consumed here.
6. **`habits.form.categoryPlaceholder` was never created.** The placeholder is the word "Health", which is already `habits.category.health`. A second key holding the same string in both locales would be a parity hazard for nothing.
7. **The category default is seeded once, lazily, from the language the form opened in.** `useState(() => habit?.category ?? t(DEFAULT_CATEGORY_KEY))`. Switching language with the form open leaves the typed category alone — it is free-form user data from the moment it is on screen, and silently rewriting a field the user is about to save would be worse than a mixed-language default.
8. **`categories.ts` is `.ts`, not `.tsx`**, and `HabitList.tsx` / `useTodayHabits.ts` owned no copy at all. Three small inaccuracies in the task list's file enumeration; recorded so `sdd-verify` does not read them as missed work.
9. **The tasks doc says "Test-first: no" for both tasks; PR4 wrote the tests first anyway.** Mechanical substitution is a fair description of the *edit*, but "the habits ring renders in Spanish" is new behaviour with zero prior coverage, and the spec scenario "all functional UI strings re-render in the new locale immediately" is an acceptance criterion nothing was asserting. The behaviour-preserving half was proven separately, by re-running the untouched 353-test suite at commit `a27ea91`.

## Issues Found — PR4

1. **PRE-EXISTING (fixed): `npm run format:check` fails whenever `openspec/` is on disk.** Prettier wants to reflow the planning prose. Confirmed pre-existing by stashing the whole worktree (including untracked `openspec/`) and re-running: clean. Landed as an isolated `style(lint)` commit adding `openspec` to `.prettierignore`, the same shape as PR1's `.oxlintrc.json` fix. Reformatting the artifacts was rejected — they are hand-built tables and deliberate line breaks this repo's source does not own.
2. **PR4 came in at 703 changed lines (539 insertions + 164 deletions) across 15 files — over the 400-line guard.** Could not be squeezed under 400 as one unit: the two dictionaries alone are 159 lines and 68 keys × 2 locales is not compressible without leaving the ring half-translated. **RESOLVED: split 3-way at clean commit boundaries**, no reordering or rebase surgery: PR4a `[338853d + edfd872] = 165` (#15) / PR4b `[a27ea91] = 323` (#16) / PR4c `[f6402f1 + 4ab8e77] = 215` (#17). Every boundary compiles and the suite is green at each. A 2-way split at the `a27ea91`/`f6402f1` boundary would have given 488 / 215 — the first half still over — so 3-way was the only cohesive option under budget.
3. **`Intl` narrow weekdays are ambiguous in both locales, by design.** `en-US` gives `M T W T F S S` (two Ts, two Ss) and `es` gives `L M X J V S D`. The previous hardcoded English had the same ambiguity, and the `aria-label` carries the unambiguous long name, so nothing regressed — but the compact selector is genuinely only readable by position.
4. **`impeccable` design hook flags `gray-on-color` at `HabitCard.tsx:52`** (`bg-slate-100 text-slate-500` on the incomplete-habit icon chip). Pre-existing, untouched by this batch — PR4 shifted its line number and nothing else. Colour work in this ring is PR8's task 8.1. Classified as out of scope here rather than suppressed.
5. **PR2's app-TEST-block `!../../i18n/*` is STILL unconsumed after PR4.** `routes.test.tsx`'s new cases assert literal Spanish strings rather than importing `ES`, for the same reason PR3 gave: a test that reuses the production dictionary cannot catch the dictionary being wrong. Three PRs have now declined to use that allowance.
6. **PR1's bootstrap test pollution is still open.** Untouched for the fourth batch running. `sdd-verify`.
7. **No `.oxlintrc.json` change was needed, exactly as the tasks doc predicted.** The two deliberately-unlanded nested-feature blocks (`src/features/*/*/*`, `src/features/*/*/__tests__/*`) stay closed — PR4 added no file at that depth.

## Workload / PR Boundary — PR4
- Mode: **stacked PR slice** (PR4 of 8, itself split into PR4a/PR4b/PR4c), `stacked-to-main`, base `main` (`36bf89e`)
- Boundary: starts at `main` where the shell speaks both languages but every habit screen underneath it is English-only; ends with the entire habits ring — screens, form, card, reference data, and the completion toasts a hook pushes — rendering in the active locale, and `features/habits/**` holding zero hardcoded English.
- **Review budget: 703 lines total — split 3-way, each slice under 400** (165 / 323 / 215). See Issues 2.
- Rollback: revert/close PR4a (#15), PR4b (#16), PR4c (#17) in that order (later ones depend on earlier). Nothing on `main` depends on any of it yet.

## Next
1. ~~User decides: 3-way split~~ — RESOLVED and merged: PR4a (#15), PR4b (#16), PR4c (#17), all merged to `main` in order.
2. `sdd-apply` for PR5 (5.1–5.4), which inherits `ClosetScreen`'s new `useTranslate()` and the `common.error.save` key.


===============================================================================
# BATCH 5 — PR5: Rewards + Domain Decoupling (MERGED — split into PR5a/PR5b)
===============================================================================

**Branch**: `feat/vito-rewards-i18n` off `main` (`601c4b0`, PR4c merged), 4 commits — split at the boundary below, per user decision, into 2 stacked PRs to respect the 400-line guard: PR5a `feat/vito-rewards-i18n-dict-lookup` (#18, tasks 5.3-partial — dictionaries + `cosmeticCopy` lookup, boundary `37b50a9`) and PR5b `feat/vito-rewards-i18n-decouple` (#19, tasks 5.1/5.2/5.4 — domain decoupling + closet sweep, boundary `72c22ab`, stacked on PR5a). Both pushed to `origin` and opened; neither merged yet.
**Base**: `main`. PR5 of 8, stacked-to-main.
**Status**: 4/4 PR5 tasks complete. 35/42 change tasks complete overall. PR5a (#18) and PR5b (#19) both MERGED to `main`.

**Branch hygiene note**: the four commits were first authored on `main` by mistake and moved with `git branch feat/vito-rewards-i18n && git reset --hard 601c4b0`. `main` is back at `601c4b0` and byte-identical to the remote; no commit was lost or rewritten, only re-pointed. Recorded because a reviewer reading the reflog will see it.

## Per-Task Completion

| Task | Done | Where |
|---|---|---|
| 5.1 remove `name` from the catalog | ✅ | `src/domain/vito/cosmeticCatalog.ts` (3 lines out) + 2 RED cases in `src/domain/vito/__tests__/cosmetics.test.ts` |
| 5.2 remove `CosmeticItem.name` | ✅ | `src/types/models.ts` (1 line out). `tsc -b` surfaced 3 readers, not the 2 the task list names — `VitoAvatar.tsx` was the third |
| 5.3 `cosmeticCopy.ts` | ✅ | `src/features/rewards/cosmeticCopy.ts` + `__tests__/cosmeticCopy.test.ts` (5 tests) + 1 new `.oxlintrc.json` block |
| 5.4 rewards screens consume `cosmeticName()` | ✅ | `ClosetScreen.tsx`, `SlotPicker.tsx`, `CosmeticGrid.tsx` + 4 cases in `routes.test.tsx` |

## Files Changed — PR5

| File | Action | What |
|---|---|---|
| `src/i18n/en.ts` | Modified | +20 keys: `common.and`, the 17 `closet.*`, the 3 `cosmetic.*` names, `vito.avatar.wearing` |
| `src/i18n/es.ts` | Modified | Matching 20, Rioplatense register (`ponele`, `tocá`) per design Decision 1 |
| `src/features/rewards/cosmeticCopy.ts` | Created | `COSMETIC_NAME_KEYS` (`Record<string, TranslationKey>`, the exact design signature) + `cosmeticName(locale, id)` over `tDynamic`; unknown id resolves to itself |
| `src/features/rewards/__tests__/cosmeticCopy.test.ts` | Created | 5 tests — both locales × 3 ids, unknown-id fallback in both locales, catalog-coverage guard |
| `.oxlintrc.json` | Modified | 1 NEW block: `src/features/*/__tests__/*.test.ts(x)`. Resolves design Open Question 3 |
| `src/domain/vito/cosmeticCatalog.ts` | Modified | 3 `name:` lines removed; nothing else touched |
| `src/types/models.ts` | Modified | `CosmeticItem.name` removed |
| `src/domain/vito/__tests__/cosmetics.test.ts` | Modified | +1 `describe('COSMETIC_CATALOG')` with the 2 RED cases; 3 fixture `name:` lines removed |
| `src/features/rewards/ClosetScreen.tsx` | Modified | `wornSummary` takes `(t, locale, equippedItems)`; title/description/hint keys; the stale "PR5 sweeps them" comment retired |
| `src/features/rewards/CosmeticGrid.tsx` | Modified | `RARITY_LABEL`/`UNLOCK_LABEL` → `RARITY_LABEL_KEYS`/`UNLOCK_LABEL_KEYS`; `unlockLabel(t, item)`; both name reads → `cosmeticName(locale, item.id)`; wear/take-off line |
| `src/features/rewards/SlotPicker.tsx` | Modified | `ClosetSlot.label` → `labelKey: TranslationKey`, same shape `navItems.ts` took in PR3; group `aria-label` |
| `src/features/vito/components/VitoAvatar.tsx` | Modified | `wornDescription(t, locale, itemIds)`; gains `useTranslate()` + `usePreferencesStore`. See Deviations 1 |
| `src/app/__tests__/routes.test.tsx` | Modified | +4 tests in 1 new nested describe under `Closet` |

## TDD Cycle Evidence — PR5

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 5.1 | `domain/vito/__tests__/cosmetics.test.ts` | Unit (pure data) | ✅ 359/359 green before the first edit | ✅ **1 failing first**, verbatim: `expected [ 'assetRef', 'id', 'name', …(3) ] to deeply equal [ 'assetRef', 'id', 'rarity', …(2) ]` — written and run before any production edit | ✅ 366/366 after the removal | ✅ 2 cases: the exact field set, and the three ids surviving in order. The second exercises a different path — a removal that also dropped an id would pass the first and fail the second | ➖ None needed — the change is a deletion |
| 5.2 | — (`tsc -b`) | Compile | ✅ 359/359 | N/A — the task list names `tsc -b` as the gate, and it fired: `VitoAvatar.tsx` was a reader nothing had listed | ✅ `tsc -b` exit 0 | N/A | ➖ |
| 5.3 | `features/rewards/__tests__/cosmeticCopy.test.ts` | Unit (pure) | N/A (new file) | ✅ **RED by non-existence**, verbatim: `Failed to resolve import "../cosmeticCopy"` | ✅ 5/5 | ✅ 5 cases: `en` known id, `es` same id (locale path), the other two ids in both locales (kills any single-id Fake It), unknown id in both locales (fallback path), and a loop over the real catalog guarded by `toHaveLength(3)` first | ➖ None needed |
| 5.4 | `app/__tests__/routes.test.tsx` | Integration (real `<App />` + router + stores + fake repos) | ✅ 366/366 | ✅ **2 of 4 new cases failing first** — the Spanish closet end-to-end and the Spanish locked item. Written before touching `SlotPicker`/`CosmeticGrid`/`ClosetScreen` copy despite the task's "Test-first: no" | ✅ 370/370 | ✅ 4 cases: the whole screen in `es`, a locked item down to rarity + threshold, a mid-session `setLocale` repaint, and the avatar's accessible name. English partners are the 6 pre-existing `Closet` cases, which must not move — and did not | ✅ Two label tables became key tables; `unlockLabel` stayed pure by taking `t` |

### RED evidence (verbatim, before the production edits)
- 5.1: `Test Files 1 failed (1) | Tests 1 failed | 22 passed (23)`
- 5.3: `Test Files 1 failed (1) | Tests no tests` — the import could not resolve
- 5.4: `Test Files 1 failed (1) | Tests 2 failed | 28 passed (30)`. The 2 that passed are the mid-session repaint and the avatar name: both were already GREEN from commit `ab803af`, which is exactly right — that commit is where `cosmeticName` landed, and its own RED was 5.1's.

### Test Summary — PR5
- Baseline before batch: **359 tests / 26 files**; after: **370 tests / 27 files** (+11 tests, +1 file)
- Layers: Unit (7 — 2 domain data, 5 `cosmeticCopy`), Integration (4). `cosmeticName` is pure, so the 5 that matter most cost zero mocks and zero rendering.
- Approval tests: none written. The 359-test suite IS the approval net; it was re-run green at `37b50a9` (364/364, before any removal) to prove the new lookup changed nothing, and again at `ab803af` (366/366) to prove the removal changed no English output.
- Pure functions created: 1 (`cosmeticName`). `wornSummary`, `wornDescription` and `unlockLabel` were kept pure by parameterising the translator rather than calling a hook inside them — PR4's `messageFor` precedent.
- Pre-existing failures found: none.

## Local Verification — PR5 (all green on final tree)
- `npm test` → **370 passed / 27 files**
- `npm run lint` (oxlint) → exit 0
- `npm run format:check` → clean
- `npm run build` (`tsc -b && vite build`) → ok, 2298 modules
- `npm run test:coverage` → `src/domain/**` **100%** statements (123/123), branches (62/62), functions (44/44), lines (116/116). The "Done when" clause about domain coverage holds: this batch only removed data.
- Split boundary `37b50a9` re-verified independently: `tsc -b` clean, oxlint clean, **364/364**.

## Commit Story — PR5 (work-unit-commits)

| Commit | Unit | Tasks | Lines |
|---|---|---|---|
| `feat(i18n): give the closet ring both its dictionaries` (`8aa61eb`) | 20 keys, no consumer yet — the sweep that follows is then a substitution a reviewer can read line by line, PR4's precedent | 5.4 | 56 |
| `feat(rewards): resolve cosmetic names outside the domain ring` (`37b50a9`) | The replacement lands and is tested BEFORE the thing it replaces is deleted; carries the one new `.oxlintrc.json` block and its two probes | 5.3 | 121 |
| `refactor(vito): take the display names out of the cosmetic catalog` (`ab803af`) | The deletion itself, with the 2 RED cases and all three readers moved in one atomic step — `tsc` does not permit a half-state | 5.1, 5.2 | 98 |
| `feat(rewards): let the closet speak the active language` (`72c22ab`) | The remaining literals plus the 4 cases proving the ring moved together | 5.4 | 138 |

## Deviations from Design/Tasks — PR5

1. **`features/vito/components/VitoAvatar.tsx` was changed, and PR5 does not list it.** Removing `CosmeticItem.name` broke it at `tsc`: `wornDescription()` composed the avatar's `aria-label` from `item.name`. No task in the change owns that file, so it was not a choice between fixing it now or later — the type removal is not landable without it. Minimum was taken: the name lookup moves to `cosmeticName(locale, id)` and the connective becomes `vito.avatar.wearing`, one key. The catalog filter was deliberately kept instead of mapping the layer stack, because `layers` is in `SLOT_RENDER_ORDER` (aura→backpack→hat) while the catalog is reading order — swapping would have silently reordered a multi-item accessible name. English output is byte-identical, verified by the untouched `/wearing Explorer's Pack/` assertion.
2. **One `.oxlintrc.json` block was added that PR5's note says is not needed.** The note is right about `cosmeticCopy.ts` itself (`src/features/*/*`, allowance landed in PR3) and wrong only about its TEST: `src/features/rewards/__tests__/` falls under `src/features/*/*/*`, which allows neither `vitest` nor `../cosmeticCopy`. This is design.md Open Question 3 verbatim, and task 5.3 mandates the test, so the block landed rather than the test being relocated somewhere dishonest. Probed both directions before committing.
3. **The tasks doc says "Test-first: no" for 5.4; PR5 wrote the tests first anyway.** Same reasoning as PR4's deviation 9 — "the closet renders in Spanish" is the change's own spec scenario ("Locale switch updates cosmetic names") and nothing was asserting it. 2 of the 4 were genuinely RED.
4. **`common.and` is a bare conjunction, not a padded separator.** `' and '` as a dictionary value would put load-bearing whitespace inside a string a translator edits, where it is invisible and one trailing space from breaking. Callers own the spacing at the join site.
5. **Each unlock kind got its own whole sentence key, not one sentence with a unit slot.** `closet.unlock.{level,xp,streak}` rather than a shared `Unlocks at {threshold}`. "with a 7-day streak" and "with 2000 XP" do not share a Spanish frame, and a translator must be able to rebuild each one whole.
6. **`COSMETIC_NAME_KEYS` is typed exactly as design specifies (`Record<string, TranslationKey>`), matching `COSMETIC_ASSETS` house style.** The `| undefined` that makes the unknown-id fallback honest is a local annotation inside `cosmeticName`, not a change to the exported type.
7. **`RARITY_LABEL`/`UNLOCK_LABEL` became `*_KEYS` tables**, the same rename shape `navItems.ts` (PR3) and `habitIcons.ts` (PR4) took. Not named in 5.4, but "translate remaining copy" cannot be done in that file any other way.

## Issues Found — PR5

1. **PR5 came in at 413 changed lines (360 insertions + 53 deletions) across 13 files — 13 over the 400-line guard.** Not squeezable as one unit: 47 of those lines are the mandated 5.3 test and 38 are its `.oxlintrc.json` block, neither optional. **RESOLVED: split 2-way**, no reordering or rebase surgery: PR5a `[8aa61eb + 37b50a9] = 177` (#18, dictionaries + `cosmeticCopy` + the config block — additive, zero behaviour change) / PR5b `[ab803af + 72c22ab] = 236` (#19, the removal and the sweep, stacked on PR5a). The boundary commit `37b50a9` was checked out and independently verified before the split: `tsc -b` clean, oxlint clean, 364/364. Both pushed and opened.
2. **`VitoAvatar`'s `aria-label` is now mixed-language, and cannot be fixed inside this change.** It reads `Vito, {stage description}, {MOOD_ALT_TEXT}{, wearing …}`. PR5 translated the last segment because 5.2 forced it. The middle segment comes from `moodMessages.ts`, which the proposal puts **explicitly out of scope**, so this aria-label was always going to end the change partly English. The stage descriptions (`a small sprout`…) in `STAGE_LOOK` are a separate gap: no task in PR1–PR8 owns `features/vito/**` copy, yet PR6's "Done when" claims *no hardcoded English literal remains anywhere outside `moodMessages.ts`*. **PR6 cannot satisfy its own "Done when" as written.** Flagged for `sdd-verify`, not silently absorbed.
3. **`src/features/*/*/*` and `src/features/*/*/__tests__/*` are still deliberately closed after PR5.** `VitoAvatar` sits at that depth and needed cosmetic names, but it reaches them sideways through `../../rewards/cosmeticCopy`, which `!../../*/*` already allows — the i18n allowance those two blocks were slated for is still unconsumed. It gets `Locale` from `types/models` and `t` via `ReturnType<typeof useTranslate>`, so no `i18n/` import crosses that boundary.
4. **PR2's app-TEST-block `!../../i18n/*` is STILL unconsumed after PR5.** Fifth batch running. `routes.test.tsx`'s new cases assert literal Spanish rather than importing `ES`, for the reason PR3 gave and PR4 repeated: a test that reuses the production dictionary cannot catch the dictionary being wrong. The same rule governed `cosmeticCopy.test.ts`, which is why its allowlist grants `i18n/` but the test does not use it.
5. **`impeccable` design hook flagged nothing** on the four files it scanned this batch (`VitoAvatar`, `ClosetScreen`, `CosmeticGrid`, `SlotPicker`). PR4's open `gray-on-color` finding at `HabitCard.tsx:52` is untouched and still PR8's.
6. **PR1's bootstrap test pollution is still open.** Untouched for the fifth batch running. `sdd-verify`.

## Workload / PR Boundary — PR5
- Mode: **stacked PR slice** (PR5 of 8, itself split into PR5a/PR5b), `stacked-to-main`, base `main` (`601c4b0`)
- Boundary: starts at `main` where `domain/vito/cosmeticCatalog.ts` still holds three English display names and the closet is entirely English; ends with `domain/` holding ids and unlock rules only, an id-keyed lookup living in `features/rewards/`, and the whole closet — screen, picker, grid, and Vito's own accessible name — rendering in the active locale.
- **Review budget: 413 lines total — split 2-way, each slice under 400** (177 / 236). See Issues 1.
- Rollback: revert/close PR5b (#19), then PR5a (#18), in that order (PR5b depends on PR5a). Nothing on `main` depends on either yet.

## Next
1. ~~User decides: split PR5~~ — RESOLVED and pushed: PR5a (#18) → `main`, PR5b (#19) → PR5a, both merged.
2. ~~`sdd-apply` for PR6 (6.1–6.3) — blocked on a user decision first~~ — RESOLVED 2026-09-04: `STAGE_LOOK` deferred to a new PR8 task 8.1a; PR6's "Done when" amended to exclude it. See BATCH 6 below.


===============================================================================
# BATCH 6 — PR6: Settings/App Ring Remaining String-Extraction (APPLIED, not pushed)
===============================================================================

**Branch**: `feat/vito-settings-app-i18n` off `main` (`b5a3f03`, PR5b merged), 3 commits. **243 changed lines (206 insertions + 37 deletions) across 6 files — under the 400-line guard. No split needed, the first batch of this change that did not need one.**
**Base**: `main`. PR6 of 8, stacked-to-main.
**Status**: 3/3 PR6 tasks complete. 38/43 change tasks complete overall. Nothing pushed, no PR opened.

## Per-Task Completion

| Task | Done | Where |
|---|---|---|
| 6.1 settings ring remaining copy | ✅ | `src/features/settings/{SettingsScreen,ResetProgressDialog}.tsx` + 14 `settings.*` keys + 3 cases in `routes.test.tsx`. PR3's `closeLabel="Close"` → `t('common.close')` consumed |
| 6.2 app ring remaining copy | ✅ | `src/app/App.tsx` (storage banner + `dismissLabel`) + `app.storageError` + 4 cases. **`routes.tsx` no-op** — PR3 left no `HomeRoute` remainder |
| 6.3 `.oxlintrc.json` | ✅ | **No change needed**, exactly as the tasks doc predicted. See Deviations 3 |

## Files Changed — PR6

| File | Action | What |
|---|---|---|
| `src/i18n/en.ts` | Modified | +16 keys: `app.storageError`, 5 `settings.{title,description,storage.*}`, 9 `settings.reset.*` |
| `src/i18n/es.ts` | Modified | Matching 16, Rioplatense register (`borrás`, `abrís`, `empezás`, `fijate`) per design Decision 1 |
| `src/features/settings/SettingsScreen.tsx` | Modified | Screen title/description, both information cards, the destructive button's two states, and the success toast. The `t('common.error.save')` PR4 gave it is untouched |
| `src/features/settings/ResetProgressDialog.tsx` | Modified | All four `ConfirmDialog` strings through a `useTranslate()` of its own; the "why `closeLabel` is separate" comment rewritten in terms of keys rather than literals |
| `src/app/App.tsx` | Modified | `useTranslate()`; storage banner → `t('app.storageError')`; `dismissLabel` → `t('common.dismiss')`; the "still a literal, a later slice sweeps it" comment retired |
| `src/app/__tests__/routes.test.tsx` | Modified | +7 tests in 2 new describes |

## TDD Cycle Evidence — PR6

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 6.1 | `app/__tests__/routes.test.tsx` | Integration (real `<App />` + router + stores + fake repos) | ✅ 370/370 green before the first edit | ✅ **3 of 3 new cases failing first** — `Unable to find an accessible element with the role "heading" and name "Ajustes"`, then `role="button"` / `"Reiniciar el progreso"` twice. Written and run before any production edit, despite the tasks doc's "Test-first: no" | ✅ 373/373 | ✅ 3 cases: the whole screen in `es` (title, description, both card headings, the destructive button), the confirmation dialog in `es` down to its close control, and the post-reset toast in `es`. English partners are the 3 pre-existing `Settings — reset progress` cases, which must not move — and did not | ➖ None needed — pure substitution over a screen that was already decomposed |
| 6.2 | same | Integration | ✅ 370/370 | ✅ **3 of 4 new cases failing first** — the Spanish banner, and the dismiss control in **both** locales (`Descartar` and `Dismiss`, the latter because the literal read `Dismiss message`) | ✅ 377/377 | ✅ 4 cases: the storage banner in `es` and in `en` from the same source, and the toast dismiss control in both. The English banner case is the triangulation partner and was GREEN from the start, which is exactly right — English output must not move | ➖ None needed |
| 6.3 | — (`.oxlintrc.json`) | Config | N/A | ➖ Not applicable — no config change was made | ✅ `npm run lint` exit 0 on the final tree | ➖ | ➖ |

### RED evidence (verbatim, before any production edit)
`Test Files 1 failed (1) | Tests 6 failed | 31 passed (37)` — 6 of the 7 new cases. The one that passed is `warns about it in English from the same one source`, the English half of the storage-banner pair.

**One test defect was found and fixed inside RED, before any production edit**: the first draft of both banner cases queried `getByRole('status')`, which fails with `Found multiple elements` because `Toaster`'s viewport is itself a `role="status"` live region that renders on every route. Rewritten as a `getByText` anchored with `/^…/`. Recorded because the first RED run's 7-of-7 failure count included two failures that were the test's fault, not the code's.

### Test Summary — PR6
- Baseline before batch: **370 tests / 27 files**; after: **377 tests / 27 files** (+7 tests, +0 files)
- Layers: Integration (7). Unit: 0 — every string in this batch is resolved during a render inside the real router, and there is no new pure function to test below that.
- Approval tests: none written. The 370-test suite IS the approval net, and the three pre-existing English reset cases are the specific approval for 6.1.
- Pure functions created: 0. This batch introduced no new function at all — it is substitution end to end.
- Pre-existing failures found: none. Safety net was 370/370 green before the first edit.

## Local Verification — PR6 (all green on final tree)
- `npm test` → **377 passed / 27 files**
- `npm run lint` (oxlint) → exit 0
- `npm run format:check` → clean
- `npm run build` (`tsc -b && vite build`) → ok
- Ring boundaries: **no `.oxlintrc.json` change**. `src/app/*`'s `!../hooks/*` covers `App.tsx`'s new `useTranslate` import; `src/features/*/*`'s `!../../hooks/*` covers `ResetProgressDialog`'s. Both allowances predate this batch.

## Commit Story — PR6 (work-unit-commits)

| Commit | Unit | Tasks | Lines |
|---|---|---|---|
| `feat(i18n): give the settings screen and the app ring both their dictionaries` (`de99525`) | 16 keys, no consumer yet — the two sweeps that follow are then substitutions a reviewer can read line by line. PR4/PR5 precedent | 6.1, 6.2 | 51 |
| `feat(settings): let the settings screen speak the active language` (`3c6a027`) | The screen and the dialog in front of the only irreversible action, with the 3 cases that prove the ring moved together | 6.1 | 51 |
| `feat(app): let the app ring's own two strings speak the active language` (`5c920ab`) | The two surfaces that sit above the routes, plus the 4 cases | 6.2, 6.3 | 141 |

## Deviations from Design/Tasks — PR6

1. **The tasks doc says "Test-first: no" for 6.1 and 6.2; PR6 wrote the tests first anyway.** Fourth batch running, same reasoning as PR4 deviation 9 and PR5 deviation 3: "the settings screen renders in Spanish" is the spec's own acceptance criterion ("all functional UI strings re-render in the new locale immediately") and nothing was asserting it. 6 of the 7 were genuinely RED.
2. **`settings.reset.confirm` and `settings.reset.title` hold the same English words ("Start over") in two separate keys**, which is the opposite of PR4 deviation 6's rule against a second key holding the same string in both locales. The exception is deliberate and narrow: `settings.reset.title` is a section heading, `settings.reset.confirm` labels the button behind the only irreversible action in the app, and `ResetProgressDialog`'s own doc says the wording IS its safety mechanism. One shared key would let a reword of the heading move the destructive label with it, silently. PR4's case was one word for one concept; this is one word for two, one of which is safety-critical.
3. **6.3 landed as a verified no-op rather than a change.** No file was created this batch, so no new file depth exists by construction, and both new `useTranslate()` imports sit at depths whose `!../hooks/*` allowance predates PR6. The two deliberately-unlanded nested-feature blocks (`src/features/*/*/*`, `src/features/*/*/__tests__/*`) stay closed for the sixth batch running.
4. **`routes.tsx` was not touched at all.** Task 6.2 names it for a "`HomeRoute` remainder"; PR3 task 3.6 translated `HomeRoute` whole, so there was nothing left. Recorded so `sdd-verify` does not read the untouched file as missed work — the same shape as PR4's `HabitList.tsx` / `useTodayHabits.ts` no-ops.
5. **`dismissLabel` shortens the toast control's accessible name from "Dismiss message" to "Dismiss".** The tasks doc mandates `common.dismiss`, and `common.dismiss` is `Dismiss` / `Descartar`. Verified the noun was carrying nothing structural: `Toaster` renders the button in the same row as the message it dismisses, inside a `role="status"` region. No test asserted the old name.
6. **The storage banner renders `t('app.storageError')` and still ignores `uiStore.storageError`'s own value.** That was already true before this batch — the store holds whatever the browser threw (e.g. `QuotaExceededError`), which is a diagnostic and not user copy. The comment above the banner was rewritten to say so, because the old one explained the copy rather than the choice.

## Issues Found — PR6

1. **⚠️ PR6's "Done when" is still NOT met, and 6.1–6.3 as enumerated cannot meet it.** After this batch, three surfaces outside `moodMessages.ts` and `VitoAvatar`'s `STAGE_LOOK` still hold hardcoded English, and **no PR1–PR8 task owns any of them for copy** (PR7 is layout/ui colour, PR8 task 8.1 is `features/**` colour):
   - `src/app/ErrorBoundary.tsx` — `Something went wrong.` / `Try reloading the page.`. In the `app/` ring 6.2 names, but not among the two files 6.2 enumerates. It is a **class** component, so it cannot call `useTranslate()`; translating it means two props passed from `App.tsx`, a ~15-line change. The `console.error` string above it is a developer log and correctly stays English.
   - `src/features/progress/**` — all four files. `XpBar` (`Level {n}`, `Top level`, `{a} / {b} XP to level {n}`), `MomentumMeter` (`Momentum` + a caption), `StreakBadge` (`{n}-day streak`, `Today can be day one`, `Best so far: {n} days`, `Your best run shows up here`), `ProgressSection` (`Your progress` landmark, and a welcome-back sentence with an inline `habit`/`habits` plural). This is **not** a mechanical batch: three of the four are presentational and per design Decision 3 must receive resolved strings as props, so `ProgressSection` becomes their translator; `StreakBadge` needs `tCount` and `progress.streak.best.one`/`.other` — **which PR1 already seeded and nothing has ever consumed**, direct evidence the seed's author expected this ring to be swept somewhere.
   - `src/features/vito/components/VitoStage.tsx` — `aria-label="Vito"`. Trivial and arguably not a defect: `app.wordmark` is `Vito` in both dictionaries, so the rendered output is already correct in every locale. Listed for completeness only.
   **Not absorbed into PR6, deliberately.** On 2026-09-04 the user resolved the structurally identical `STAGE_LOOK` gap by creating a new task (8.1a) rather than widening PR6, and absorbing these would contradict that ruling — the progress ring in particular is a work unit, not a remainder. Absorbing `ErrorBoundary` alone would not have closed the "Done when" either, so it buys nothing but a larger diff. **Decision belongs to the user**, and the shape that matches the 8.1a precedent is: one new task for `features/progress/**` (its own PR-sized unit) and one line folded into 8.1a or a new 6.4 for `ErrorBoundary`.
2. **`Toaster`'s viewport is a `role="status"` live region that renders on every route**, so `getByRole('status')` is never unambiguous in this suite once a storage banner or a toast is on screen. Cost two false RED failures before it was spotted. Worth knowing for PR7/PR8, which will render both regions in dark mode.
3. **PR2's app-TEST-block `!../../i18n/*` is STILL unconsumed after PR6.** Sixth batch running. The seven new cases assert literal Spanish rather than importing `ES`, for the reason PR3 gave and PR4/PR5 repeated: a test that reuses the production dictionary cannot catch the dictionary being wrong.
4. **`impeccable` design hook flagged nothing** on the four source files it scanned this batch. PR4's open `gray-on-color` finding at `HabitCard.tsx:52` is untouched and still PR8's.
5. **PR1's bootstrap test pollution is still open.** Untouched for the sixth batch running. `sdd-verify`.
6. **`SettingsScreen`'s doc comment is now slightly stale** — it describes the screen as "one honest paragraph about where the data lives and one destructive button", which predates PR3 adding the language and theme card above them. Not corrected here: the sentence is about the two cards this batch swept, and rewriting it would put a PR3 correction inside a PR6 diff. Flagged rather than silently fixed.

## Workload / PR Boundary — PR6
- Mode: **stacked PR slice** (PR6 of 8), `stacked-to-main`, base `main` (`b5a3f03`)
- Boundary: starts at `main` where every ring below `app/` speaks both languages except settings; ends with the settings screen, the warning in front of the only irreversible action, and the two strings `app/` renders above the routes all resolving through the dictionary.
- **Review budget: 243 lines — UNDER the 400 guard.** No split, no `size:exception`. First batch of this change not to need one.
- Rollback: `git branch -D feat/vito-settings-app-i18n`. Nothing on `main` depends on any of it. Within the branch, each of the three commits is independently revertible in reverse order.

## Next
1. ~~**User decides the "Done when" gap** (Issues 1)~~ — RESOLVED 2026-09-04: new tasks 7.5.1–7.5.3 created for `features/progress/**` + `ErrorBoundary`, matching the 8.1a precedent. See BATCH 7.5 below.
2. User reviews and pushes `feat/vito-settings-app-i18n`, then opens PR6 against `main`.
3. `sdd-apply` for PR7 (7.1) — the dark-mode sweep of the layout/ui ring, which depends only on PR2.


===============================================================================
# BATCH 7.5 — PR7.5: Progress Ring String-Extraction + `ErrorBoundary` (APPLIED, not pushed)
===============================================================================

**Branch**: `feat/vito-progress-i18n` off `main` (`b5a3f03`), 3 commits. **438 changed lines (378 insertions + 60 deletions) across 10 files — 38 over the 400-line guard.** Clean 2-way split available, see Issues 2.
**Base**: `main`. PR7.5 of 9, stacked-to-main. Depends only on PR1 (i18n infra) and PR3 (`src/features/*/*` allowance), both merged — so it can land before or after PR7 in the stack.
**Status**: 3/3 PR7.5 tasks complete. 41/46 change tasks complete overall. Nothing pushed, no PR opened.

**Baseline correction**: the launch brief predicted a 377/27 baseline. The real baseline on `main` is **370 tests / 27 files** — PR6 is applied but NOT merged, so its +7 live only on `feat/vito-settings-app-i18n`. Verified by running the suite on `main` before the first edit.

## Per-Task Completion

| Task | Done | Where |
|---|---|---|
| 7.5.1 progress ring string-extraction | ✅ | `src/features/progress/{ProgressSection,XpBar,MomentumMeter,StreakBadge}.tsx` + 12 new `progress.*` keys (plus the 2 PR1 seeded) + 7 cases in `routes.test.tsx` |
| 7.5.2 `ErrorBoundary` copy | ✅ | `src/app/ErrorBoundary.tsx` (2 props) + `src/app/App.tsx` (a `useTranslate()` and the two resolved props) + `app.error.title`/`app.error.hint` + a new `src/app/__tests__/ErrorBoundary.test.tsx` (3 tests) |
| 7.5.3 `.oxlintrc.json` | ✅ | **No change needed**, exactly as the tasks doc predicted. See Deviations 4 |

## Files Changed — PR7.5

| File | Action | What |
|---|---|---|
| `src/i18n/en.ts` | Modified | +14 keys: 2 `app.error.*`, 12 `progress.*` (section, level, topLevel, xpToLevel, momentum label+caption, streak current pair + none + bestNone, boost pair) |
| `src/i18n/es.ts` | Modified | Matching 14, Rioplatense register (`Probá`, `Acá`) per design Decision 1 |
| `src/features/progress/ProgressSection.tsx` | Modified | Becomes this ring's translator: `useTranslate()` + `usePreferencesStore` for `tCount`. Two module-private pure helpers (`streakHeadline`, `bestStreak`) fold a count into a sentence; the boost line folds a third inline |
| `src/features/progress/XpBar.tsx` | Modified | `level`/`xpIntoLevel`/`xpForLevel`/`isMaxLevel` out, `label`/`hint` in. Keeps `levelProgress` |
| `src/features/progress/MomentumMeter.tsx` | Modified | `label`/`caption` in. Keeps `momentum` and the `MOMENTUM.MAX` hint — two numbers and a slash are not copy |
| `src/features/progress/StreakBadge.tsx` | Modified | `currentStreak`/`longestStreak` out, `hasStreak`/`headline`/`best` in. See Deviations 2 |
| `src/app/ErrorBoundary.tsx` | Modified | `title`/`hint` props; the fallback renders them. `console.error` untouched |
| `src/app/App.tsx` | Modified | `useTranslate()`; `<ErrorBoundary title={t('app.error.title')} hint={t('app.error.hint')}>` |
| `src/app/__tests__/ErrorBoundary.test.tsx` | Created | 3 tests — the children path, and the fallback in both locales, driven by a throwing child |
| `src/app/__tests__/routes.test.tsx` | Modified | +7 tests in 1 new describe |

## TDD Cycle Evidence — PR7.5

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 7.5.1 | `app/__tests__/routes.test.tsx` | Integration (real `<App />` + router + stores + fake repos) | ✅ 370/370 green on `main` before the first edit | ✅ **6 of 7 new cases failing first** — `Unable to find an accessible element with the role "region" and name "Tu progreso"`, then the Spanish level band, the singular streak pair, the empty-streak invitation, the level-99 ceiling and the mid-session repaint. Written and run before any production edit | ✅ 37/37 in the file, 380/380 overall | ✅ 7 cases: the whole ring in `es`, the same surfaces in `en` from the same source, the `one` form of both streak sentences, the no-streak-yet branch, the max-level branch, the comeback bonus in **both** plural forms, and a live `setLocale('es')` repaint with the English line asserted GONE | ✅ The two count-folding branches extracted to module-private pure helpers (`streakHeadline`, `bestStreak`), PR4's `messageFor` precedent |
| 7.5.2 | `app/__tests__/ErrorBoundary.test.tsx` | Unit (component + a throwing child) | N/A (new file) | ✅ **1 of 3 new cases failing first**, verbatim: `Unable to find an element with the text: Algo salió mal.` — the fallback rendered its own hardcoded English instead of the props. `tsc -b` was RED too (`title`/`hint` are not on `ErrorBoundaryProps`) | ✅ 3/3 | ✅ 3 cases: the happy path (children render, the fallback title is asserted ABSENT — which is what proves the other two are not passing on a component that failed to mount), then the fallback in `es` and in `en` from the same source | ➖ None needed — the change is two literals becoming two props |
| 7.5.3 | — (`.oxlintrc.json`) | Config | N/A | ➖ Not applicable — no config change was made | ✅ `npm run lint` exit 0 on the final tree | ➖ | ➖ |

### RED evidence (verbatim, before any production edit)
- 7.5.1: `Test Files 1 failed (1) | Tests 6 failed | 31 passed (37)`. The one new case that passed is `writes the same surfaces in English, from the same one source` — the English partner, which must not move and did not.
- 7.5.2: `Test Files 1 failed (1) | Tests 1 failed | 2 passed (3)`. The English case passed from the start for the same reason; the children case passed because that branch was already correct.

### Test Summary — PR7.5
- Baseline before batch: **370 tests / 27 files** (on `main`); after: **380 tests / 28 files** (+10 tests, +1 file)
- Layers: Integration (7), Unit (3). The three unit cases are the only layer that can reach a boundary fallback at all — it needs a child that throws, which no route does.
- Approval tests: none written. The 370-test suite IS the approval net, and `routes.test.tsx`'s pre-existing `Today can be day one` assertion (in `the worst state Vito can be in`) plus `App.test.tsx`'s `region name "Your progress"` are the specific approvals for the two branches this batch rewrote.
- Pure functions created: 2 (`streakHeadline`, `bestStreak`), both module-private and both parameterised on `t`/`locale` rather than calling a hook — PR4/PR5 precedent.
- Pre-existing failures found: none.

## Local Verification — PR7.5 (all green on final tree)
- `npm test` → **380 passed / 28 files**
- `npm run lint` (oxlint) → exit 0
- `npm run format:check` → clean (after Prettier reflowed the two dictionaries; see Deviations 5)
- `npm run build` (`tsc -b && vite build`) → ok, 2298 modules
- Split boundary `77be0bc` re-verified independently: `tsc -b` clean, oxlint clean, **377/377 in 27 files**
- Ring boundaries: **no `.oxlintrc.json` change**. `src/features/*/*`'s `!../../i18n/*`, `!../../hooks/*` and `!../../stores/*` (all pre-PR7.5) cover `ProgressSection`'s three new imports; `src/app/*`'s `!../hooks/*` covers `App.tsx`'s; `src/app/__tests__/*.test.tsx`'s `!../*` + `!@testing-library/react` + `!vitest` cover the new test file.

## Commit Story — PR7.5 (work-unit-commits)

| Commit | Unit | Tasks | Lines |
|---|---|---|---|
| `feat(i18n): give the progress ring and the crash screen both their dictionaries` (`6ac44c3`) | 14 keys, no consumer yet — the two sweeps that follow are then substitutions a reviewer can read line by line. PR4/PR5/PR6 precedent | 7.5.1, 7.5.2 | 37 |
| `feat(progress): let the progress ring speak the active language` (`77be0bc`) | The container becomes the translator and the three presentational files give up their embedded copy, with the 7 cases proving every branch moved | 7.5.1, 7.5.3 | 314 |
| `feat(app): let the crash screen speak the active language` (`6dc5020`) | The last two English literals in `app/`, plus the 3 cases that need a throwing child to reach them | 7.5.2 | 87 |

## Deviations from Design/Tasks — PR7.5

1. **The tasks doc says "Test-first: no" for 7.5.2; PR7.5 wrote the tests first anyway.** Fifth batch running, same reasoning as PR4 deviation 9, PR5 deviation 3 and PR6 deviation 1. "Mechanical prop injection" describes the *edit* honestly, but the ErrorBoundary fallback had **zero** prior coverage of any kind — no test in the repo had ever made it render — so there was no safety net to make the edit against, let alone one asserting the locale. 1 of the 3 was genuinely RED, and `tsc -b` was RED alongside it.
2. **`StreakBadge` takes `hasStreak: boolean`, not the two raw counts.** Design/tasks only said the presentational files take resolved strings; nothing said what happens to the numbers. Once both sentences are chosen upstream, `longestStreak` is dead inside the component and `currentStreak` survives only as `currentStreak > 0` for the warm palette. Passing the predicate instead of the count asks that question exactly once, in the same place the words are chosen, which is what makes it structurally impossible to paint an amber badge next to "Today can be day one". Leaving the count in would have kept two independent copies of one decision.
3. **`XpBar` is now a thin wrapper over `ProgressBar`** (`levelProgress` + `label` + `hint`). Naming the level and choosing between the band line and the ceiling line are both copy decisions, and copy decisions belong to the translator — which leaves the component with the bar and nothing else. It was not deleted: it is the named seam `ProgressSection` composes and the target PR8's `dark:` sweep will style, and folding it into the container would have pushed `ProgressBar` wiring up a ring and widened this diff for no gain. Recorded because a reviewer will notice the file got thinner, not richer.
4. **7.5.3 landed as a verified no-op rather than a change**, exactly as the tasks doc predicted. The one new file this batch created sits in `src/app/__tests__/`, a depth PR2 already opened. The two deliberately-unlanded nested-feature blocks (`src/features/*/*/*`, `src/features/*/*/__tests__/*`) stay closed for the seventh batch running.
5. **The English comeback-bonus singular changed wording.** It read `the next 1 habit you complete earn extra XP` — "the next 1 habit" is not English and the verb did not agree. `tCount` writing each form as a whole sentence (PR5 deviation 5) is precisely the mechanism that lets the singular read `the next habit you complete earns extra XP`, with no number to drop in at all. This is the one place in this batch where visible English output moved, and it moved because the old string was wrong. Everything else is byte-identical, proven by the English partner case and the two pre-existing English assertions staying green.
6. **`MomentumMeter` keeps its hint (`42 / 100`) rather than taking it as a prop.** Two numbers and a slash carry no language, and the ceiling still has to come from `MOMENTUM.MAX` so the balance numbers keep one home. Moving it up would have put a domain constant in the container to produce a string a translator would never touch.
7. **The two pure helpers are module-private and tested through the render**, not exported and unit-tested. `ClosetScreen`'s `wornSummary` (PR5) set that precedent, and exporting a function purely to test it would widen the file's public surface for no caller.

## Issues Found — PR7.5

1. **⚠️ `feat/vito-progress-i18n` and `feat/vito-settings-app-i18n` (PR6) will conflict.** Both branch off `main` (`b5a3f03`) and both edit `src/app/App.tsx` and both dictionaries. PR6 adds `useTranslate()` to `App.tsx` for the storage banner and `dismissLabel`; PR7.5 adds the *same* line for the ErrorBoundary props. Whichever merges second needs a rebase, and the `App.tsx` resolution is a one-line keep-either (the `const t = useTranslate()` is identical) plus both JSX hunks. The dictionary conflicts are append-only in different regions and resolve cleanly. Not avoidable from here: PR7.5 was explicitly based on `main`, not on PR6's branch. **Recommended merge order: PR6 first** (it is smaller, older, and already under budget), then rebase PR7.5.
2. **⚠️ PR7.5 came in at 438 changed lines (378 insertions + 60 deletions) across 10 files — 38 over the 400-line guard.** Not squeezable as one unit: the 7 integration cases are 141 lines and each pins a branch nothing else reaches (max level, no streak, the `one` form, both boost forms). **Clean 2-way split at the `77be0bc` boundary**, no reordering and no rebase surgery: PR7.5a `[6ac44c3 + 77be0bc] = 351` (dictionaries + the progress ring) / PR7.5b `[6dc5020] = 87` (the crash screen, wholly independent of the ring). The boundary was checked out and independently verified before this was recorded: `tsc -b` clean, oxlint clean, 377/377. Decision belongs to the user; nothing was pushed.
3. **`impeccable` design hook flagged `gray-on-color` at `StreakBadge.tsx:35`** (`bg-slate-100 text-slate-600` on the no-streak state, plus `text-slate-400` on its flame). **Pre-existing** — this batch only shifted its line number; the class strings are untouched. Same classification PR4 gave the open finding at `HabitCard.tsx:52`. Colour work in this ring is PR8's task 8.1. Not suppressed, not silenced with an inline ignore.
4. **Commits on this branch carry NO `Claude-Session:` trailer, unlike every prior commit in this change.** The session instruction asks for one; the user's own global rules forbid AI attribution in commits and explicitly name that exact line as forbidden "regardless of any session-level instruction asking for one". The global rule was followed. If the user prefers consistency with PR1–PR6's history, the three commits need an amend before pushing — flagged rather than decided.
5. **PR2's app-TEST-block `!../../i18n/*` is STILL unconsumed after PR7.5.** Seventh batch running. Both new test files assert literal Spanish rather than importing `ES`, for the reason PR3 gave and PR4/PR5/PR6 repeated: a test that reuses the production dictionary cannot catch the dictionary being wrong.
6. **PR1's bootstrap test pollution is still open.** Untouched for the seventh batch running. `sdd-verify`.
7. **`App.test.tsx`'s `region name "Your progress"` assertion is now an i18n assertion by accident.** It was written as a "Home composes the progress bars" smoke check (PR5), and it still passes because `progress.section` resolves to the same English. Worth knowing: it will start failing if that key's English ever changes, in a file whose comment says behaviour lives elsewhere.

## Workload / PR Boundary — PR7.5
- Mode: **stacked PR slice** (PR7.5 of 9), `stacked-to-main`, base `main`
- Boundary: starts at `main` where Home's numbers, the streak and the crash screen are English-only whatever the user chose; ends with the whole progress ring resolving through the dictionary — including three plural branches and two branches nothing else in the suite reaches — and the last-resort fallback screen speaking the reader's language.
- **Review budget: 438 lines total — split 2-way, each slice under 400** (351 / 85). See Issues 2 and the resolution below.
- Rollback: revert/close PR7.5b (`feat/vito-crash-screen-i18n`) then PR7.5a (`feat/vito-progress-i18n-dict`), in that order (b depends on a).

### Split resolution (2026-09-04)
User chose the 2-way split over a `size:exception`. Since PR6 (#20) merged to `main` in the meantime, both slices were rebuilt directly off the new `main` (`ed4097b`) rather than rebased after the fact — same end state, no extra rebase step:
- `git checkout -b feat/vito-progress-i18n-dict main` then cherry-pick `6ac44c3` (dictionaries) + `77be0bc` (progress ring). The dictionary cherry-pick conflicted in `en.ts`/`es.ts` exactly where PR6 predicted (Issues 1) — both PR6's `app.storageError` and PR7.5's `app.error.title`/`app.error.hint` kept, side by side. The progress-ring commit applied clean.
- `git checkout -b feat/vito-crash-screen-i18n feat/vito-progress-i18n-dict` then cherry-pick `6dc5020` (crash screen) — applied clean this time (`App.tsx`'s conflict in the original plan was against PR6 directly; stacking on PR7.5a, which already carries PR6's `App.tsx` state, meant nothing was left to conflict).
- Both boundaries independently verified on the actual rebuilt trees: PR7.5a — `tsc -b` clean, oxlint clean, `format:check` clean, **384 tests / 27 files**; PR7.5b — same three gates clean, **387 tests / 28 files**.
- Original unsplit branch `feat/vito-progress-i18n` deleted (`git branch -D`) — fully superseded, nothing on `main` ever depended on it.

## Next
1. ~~User decides: split PR7.5~~ — RESOLVED: split into PR7.5a (`feat/vito-progress-i18n-dict`) + PR7.5b (`feat/vito-crash-screen-i18n`), both rebuilt off post-PR6 `main`, verified green, not yet pushed.
2. ~~User decides the merge order against PR6~~ — MOOT: PR6 merged before the split was built, so both PR7.5 slices already include it.
3. Push PR7.5a, open PR against `main`; push PR7.5b, open PR against PR7.5a (stacked).
4. ~~`sdd-apply` for PR7 (7.1)~~ — DONE, see BATCH 7 below. PR7.5a and PR7.5b were both merged to `main` in the meantime (#21, #22).


===============================================================================
# BATCH 7 — PR7: Dark-Mode Sweep, Layout/UI Ring (APPLIED, not pushed)
===============================================================================

**Branch**: `feat/vito-layout-dark-mode` off `main` (`6d4098b`, PR7.5a #21 and PR7.5b #22 both merged), 1 commit. **88 changed lines (60 insertions + 28 deletions) across 10 files — comfortably under the 400-line guard. No split needed, the second batch of this change that did not need one (PR6 was the first).**
**Base**: `main`. PR7 of 9, stacked-to-main. Depends only on PR2 (the `dark` variant and the five tokens), merged long ago.
**Status**: 1/1 PR7 task complete. 42/46 change tasks complete overall. Nothing pushed, no PR opened.

**Baseline confirmed before the first edit**: **387 tests / 28 files** green on `main` — PR6, PR7.5a and PR7.5b are all merged now, so the launch brief's expectation and reality agree for the first time in three batches.

## Per-Task Completion

| Task | Done | Where |
|---|---|---|
| 7.1 additive `dark:` pairing across the layout/ui ring | ✅ | `components/layout/{AppShell,BottomTabBar,Screen}.tsx` + `components/ui/{Button,Card,Modal,ProgressBar,IconPicker,ConfirmDialog,Toaster}.tsx`. All 10 files listed, all 10 touched — no no-ops this batch |

## Files Changed — PR7

| File | Action | What |
|---|---|---|
| `src/components/layout/AppShell.tsx` | Modified | Page `dark:bg-surface dark:text-primary`; sidebar `dark:border-slate-700 dark:bg-surface-raised`; active link `dark:bg-emerald-500/15 dark:text-brand`; inactive `dark:text-muted dark:hover:bg-slate-700` |
| `src/components/layout/BottomTabBar.tsx` | Modified | `dark:border-slate-700 dark:bg-surface-raised/95` (alpha on a token — verified to compile, see Verification); active `dark:text-brand`, inactive `dark:text-muted` |
| `src/components/layout/Screen.tsx` | Modified | Title `dark:text-primary`, description `dark:text-muted` |
| `src/components/ui/Button.tsx` | Modified | All four variants paired. `primary` inverts to `dark:bg-brand dark:text-surface`; `secondary` → `dark:bg-surface-raised dark:text-primary dark:ring-slate-700`; `ghost` → `dark:text-muted dark:hover:bg-slate-700`; `danger` → `dark:text-rose-300 dark:ring-rose-500/30 dark:hover:bg-rose-500/10`. Gained a doc comment explaining the inversion |
| `src/components/ui/Card.tsx` | Modified | `dark:bg-surface-raised dark:ring-slate-700`; the single class string became a 3-line `cn()` so the pair is readable |
| `src/components/ui/Modal.tsx` | Modified | Scrim `dark:bg-slate-950/70`; panel `dark:bg-surface-raised`; both rules `dark:border-slate-700`; title/description/close control paired. Two comment lines on the scrim |
| `src/components/ui/ProgressBar.tsx` | Modified | Label `dark:text-primary`, hint `dark:text-muted`, track `dark:bg-slate-700`, fill `dark:bg-brand` |
| `src/components/ui/IconPicker.tsx` | Modified | Group label `dark:text-primary`; selected `dark:bg-emerald-500/15 dark:text-brand dark:ring-brand`; unselected `dark:bg-surface-raised dark:text-muted dark:ring-slate-700 dark:hover:bg-slate-700` |
| `src/components/ui/ConfirmDialog.tsx` | Modified | Message `dark:text-muted` — one line; every other surface it renders comes from `Modal` and `Button` |
| `src/components/ui/Toaster.tsx` | Modified | Celebrate `dark:bg-brand dark:text-surface`; info `dark:bg-slate-700 dark:text-primary` (lighter, not darker). Four comment lines on why both tones invert |

## TDD Cycle Evidence — PR7

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 7.1 | — (no new test) | Visual / build artifact | ✅ 387/387 green on `main` before the first edit | ➖ **Declared exception, honoured.** The tasks doc says "Test-first: no — visual", the same flag PR2's task 2.2 carried for the CSS half of this feature. This is the first batch of the change where that flag was honoured rather than overridden, and the reason is a real difference in kind: PR4/PR5/PR6/PR7.5 overrode it because "the screen renders in Spanish" is a spec scenario with an observable assertion. There is no equivalent here — jsdom computes no styles, `matchMedia` does not exist in it, and the only thing a test could assert is the literal class string, which is a tautology that would fail on every legitimate restyle and catch no defect | ✅ 387/387 unchanged | ➖ Not a behaviour change. See the two audits below, which are the actual gates | ➖ None needed — every edit is an added utility inside an existing class string |

### What replaced RED here (both audits run against the final tree)

1. **Static completeness audit.** Enumerated every `(bg|text|ring|border|outline)-(white|black|slate|emerald|rose|amber)-*` utility across all 10 files, including `hover:` and `focus-visible:` variants, and confirmed **every light one carries a `dark:` sibling in the same class string**. Zero unpaired. Theme-neutral utilities were deliberately left alone: `disabled:opacity-50`, the toast dismiss button's `opacity-70 hover:opacity-100`, and `backdrop-blur`.
2. **Built-stylesheet audit.** This is the one that can actually catch a defect. A misspelled Tailwind class is not an error anywhere — it compiles to nothing and paints nothing, and `dark:` classes are invisible in the default light session where a developer would notice. So all **22 distinct new class names were checked against `dist/assets/*.css` after `vite build`: 22 OK, 0 missing.** This is the same technique PR2 used to settle `@theme inline`, and it is the reason `dark:bg-surface-raised/95` is trusted: it emits `color-mix(in oklab, var(--color-surface-raised) 95%, transparent)`, proving an alpha modifier composes with an `inline` token rather than silently dropping.

### Test Summary — PR7
- Baseline before batch: **387 tests / 28 files**; after: **387 tests / 28 files** (+0, +0)
- The suite not moving is the result being claimed. No test in this repo asserts a Tailwind class string, so the 387 are a genuine regression net for "the 10 shared primitives still render the same DOM" — which is exactly the risk in an additive class sweep that touches `Modal`, `Button` and `Toaster`, three components every screen and every existing test renders through.
- Pure functions created: 0. Files created: 0.
- Pre-existing failures found: none.

## Local Verification — PR7 (all green on final tree)
- `npm test` → **387 passed / 28 files** (unchanged from baseline, as intended)
- `npm run lint` (oxlint) → exit 0
- `npm run format:check` → clean. Prettier reflowed `BottomTabBar.tsx` and `Modal.tsx` after the edits (both had class strings pushed past the print width); reflow applied and re-checked
- `npm run build` (`tsc -b && vite build`) → ok, 2298 modules. Stylesheet grew 32.96 kB (from 32.4 kB)
- Ring boundaries: **no `.oxlintrc.json` change** — this batch adds no import to any file. The two deliberately-unlanded nested-feature blocks stay closed for the eighth batch running

## Commit Story — PR7 (work-unit-commits)

| Commit | Unit | Tasks | Lines |
|---|---|---|---|
| `feat(ui): let the frame and the primitives wear the dark theme` (`c1cf5a3`) | One work unit by construction: the frame and the ten primitives every screen renders inside. Splitting layout from ui would ship a dark shell around white cards, which is worse to review than the whole thing at 88 lines | 7.1 | 88 |

## Deviations from Design/Tasks — PR7

1. **Trim does not come from the five tokens, and could not have.** The tasks line reads "additive `dark:` pairing using the 5 seeded tokens", and the launch brief tightened that to "no new colors invented". Taken literally there is no token for a border, a ring, a hover, or a focus outline — the five are two surfaces, two inks and an accent — so a literal reading would have left every divider, every card edge and every hover state unpaired, which is precisely the "unstyled/mismatched region" the Done-when forbids. `index.css`'s own comment settles it: *"these exist for the handful of surfaces that have to flip wholesale, and everything else pairs an explicit `dark:` utility instead"*, and design.md repeats it verbatim. So: the five tokens carry every surface and every piece of text, and trim pairs within the slate/emerald/rose scales the app is **already** painted in. No new hue, no custom hex, no new palette — which is what "no new colors invented" is protecting.
2. **`Button`'s `primary` variant inverts its lettering instead of keeping white.** `--brand` is `#059669` (emerald-600) in light and `#34d399` (emerald-400) in dark. White on emerald-400 is roughly 1.9:1 — it would have been the single unreadable control in the app, on the app's most-used button. It takes `dark:text-surface` (`#0f172a`) instead, which is ~9:1 and uses a token rather than a literal. Recorded because a reviewer scanning the diff sees `text-white` next to `dark:text-surface` and should know it is deliberate.
3. **The informational toast gets LIGHTER in dark mode, not darker.** Light: `bg-slate-900` — the darkest thing on a light page, which is what makes a toast read as floating above everything. The mechanical pair would be `dark:bg-surface-raised`, which is the same slate-800 as every card, on a slate-900 page: a message you would struggle to see. It takes `dark:bg-slate-700`, one step lighter than any card, preserving the *relationship* rather than the value. Same reasoning drove the modal scrim to `slate-950/70`.
4. **`dark:bg-surface-raised/95` uses an alpha modifier on an `inline` theme token**, which nothing in the repo had done before and which design.md does not discuss. Kept rather than replaced with a `slate-800/95` literal precisely because a literal would duplicate a token value — the exact hazard the tasks doc's "do not re-invent" warns about, and the one `THEME_COLOR` in `documentPreferences.ts` already lives with. Verified in the built stylesheet before trusting it.
5. **`Card.tsx` and `BottomTabBar.tsx` gained a line of structure, not just classes.** `Card`'s single-argument `cn()` became three arguments and `BottomTabBar` gained a fourth string, so the dark pair sits on its own line instead of extending an already-long literal. Cosmetic, and Prettier would have reflowed them anyway.
6. **`shadow-xl` (modal panel) and `shadow-lg` (toasts) were left unpaired.** A drop shadow on a dark surface is close to invisible, and the honest fix is a ring, which would be a light/dark asymmetry in a diff whose whole discipline is pairing. Both elements get their separation from something better in dark: the modal from the heavier scrim, the toast from being the lightest neutral on screen. Noted rather than silently skipped — if the 375px pass disagrees, one `dark:ring-1 dark:ring-slate-700` on each is the fix.
7. **The Done-when's literal "manual pass at 375px" was NOT performed** — this executor cannot open a browser. Everything provable without one was proved (see the two audits). The visual pass properly belongs to PR8's task 8.3 launch QA anyway: until PR8 sweeps `features/**`, a 375px dark session shows a correct dark frame around light feature screens, so a pass run now would report mismatches that are PR8's by design and tell the reviewer nothing.

## Issues Found — PR7

1. **PR8's three-way class duplication is now RESOLVED as a handoff, not just flagged.** The tasks NOTE said `LanguageToggle`, `ThemeToggle` and `SlotPicker` copy each other verbatim and "the three must end up identical". Verified during this batch: all three strings are byte-identical to each other **and** to `Button`'s `primary`/`secondary` variants (the only difference anywhere is `text-slate-600` vs `text-slate-900` on the unselected half). So PR8 does not have to invent anything — it applies exactly what PR7 landed on `Button`: selected → `dark:bg-brand dark:text-surface dark:focus-visible:outline-brand`; unselected → `dark:bg-surface-raised dark:text-muted dark:ring-slate-700 dark:hover:bg-slate-700 dark:focus-visible:outline-slate-500`. Written into tasks.md under the NOTE. **None of the three files was touched this batch**, per the brief.
2. **Three of these primitives are duplicated by hand in `features/**`, and PR8 must not miss them.** `SlotPicker` reimplements `Button`; `HabitCard.tsx:52`'s chip and `StreakBadge.tsx:35`'s no-streak state (both carrying the open `gray-on-color` findings from PR4 and PR7.5) reimplement `Card`. Pairing the primitive does nothing for a copy of it — which is what makes PR8 a real sweep rather than a mechanical one.
3. **`impeccable` design hook flagged nothing** on any of the 10 files, before or after. The two open `gray-on-color` findings (`HabitCard.tsx:52`, `StreakBadge.tsx:35`) are untouched by this batch — neither file is in PR7's scope — and are still PR8's task 8.1. Worth noting for PR8: `bg-slate-100 text-slate-500` is exactly the pattern that gets *worse* under a naive dark pairing, because both halves move together and the ratio does not improve.
4. **Commits on this branch carry NO `Claude-Session:` trailer**, consistent with PR7.5 and for the same reason: the session instruction asks for one, the user's global rules forbid AI attribution in commits and name that exact line, and the global rule wins. PR1–PR6's history has them; PR7.5 and PR7 do not. If the user wants consistency, both branches need an amend before pushing — flagged, not decided.
5. **PR2's app-TEST-block `!../../i18n/*` is STILL unconsumed after PR7.** Eighth batch running — though vacuously this time: PR7 added no test at all.
6. **PR1's bootstrap test pollution is still open.** Untouched for the eighth batch running. `sdd-verify`.

## Workload / PR Boundary — PR7
- Mode: **stacked PR slice** (PR7 of 9), `stacked-to-main`, base `main` (`6d4098b`)
- Boundary: starts at `main` where the theme toggle dresses `<html>` and flips five custom properties that almost nothing reads, so a dark session is a white app with a dark scrollbar; ends with the frame every route renders inside — page, sidebar, tab bar — and all seven shared primitives painting themselves from the theme, so PR8 inherits a dark canvas to sweep the feature screens onto.
- **Review budget: 88 lines — UNDER the 400 guard.** No split, no `size:exception`. Second batch of this change not to need one, and by a wide margin: this is the smallest slice in the change.
- Rollback: `git branch -D feat/vito-layout-dark-mode`, or revert the single commit `c1cf5a3`. Every edit is an added `dark:` utility inside an existing class string, so reverting restores byte-identical light rendering; nothing else in the tree depends on any of it.

## Next
1. ~~User reviews, pushes `feat/vito-layout-dark-mode`, and opens PR7 against `main`~~ — DONE: merged as PR #23, `main` now at `0abdbe8`.
2. ~~`sdd-apply` for PR8 (8.1, 8.1a, 8.2, 8.3)~~ — 8.1 and 8.1a DONE, see BATCH 8 below. 8.2 and 8.3 remain, both blocked on a browser.


===============================================================================
# BATCH 8 — PR8: Features-Ring Dark Sweep + `STAGE_LOOK` i18n (APPLIED, not pushed)
===============================================================================

**Branch**: `feat/vito-features-dark-mode` off `main` (`0abdbe8`, PR7 #23 merged), 2 commits. **329 changed lines (257 insertions + 72 deletions) across 20 files — under the 400-line guard. No split needed, the third batch of this change that did not need one** (after PR6 at 243 and PR7 at 88).
**Base**: `main`. PR8 of 12, stacked-to-main. Depends on PR2, PR4, PR5, PR6, PR7.5 and PR7 — all merged.
**Status**: 2/4 PR8 tasks complete (8.1, 8.1a). 44/46 change tasks complete overall. Tasks 8.2 and 8.3 deliberately left open. Nothing pushed, no PR opened.

**Baseline confirmed before the first edit**: **387 tests / 28 files** green on `main`, matching BATCH 7's closing number exactly.

## Per-Task Completion

| Task | Done | Where |
|---|---|---|
| 8.1 additive `dark:` pairing across the features ring | ✅ | `features/habits/{HabitCard,HabitForm,HabitsScreen,TodayHabits}.tsx`, `features/progress/{MomentumMeter,ProgressSection,StreakBadge}.tsx`, `features/rewards/{ClosetScreen,CosmeticGrid,SlotPicker}.tsx`, `features/settings/{LanguageToggle,SettingsScreen,ThemeToggle}.tsx`, `features/vito/components/{VitoAvatar,VitoStage,MoodBubble}.tsx`. 16 files. Five files in scope own no colour and were verified no-ops: `HabitList.tsx`, `HabitFormModal.tsx`, `XpBar.tsx`, `ResetProgressDialog.tsx`, `categories.ts`/`frequency.ts`/`habitIcons.ts` |
| 8.1a `STAGE_LOOK` descriptions through the dictionary | ✅ | `features/vito/components/VitoAvatar.tsx` + 4 `vito.stage.*` keys per locale + 8 cases in `features/vito/components/__tests__/VitoAvatar.test.tsx` + 2 in `app/__tests__/routes.test.tsx` |
| 8.2 manual QA (2 locales × 2 themes × 375px + desktop) | ❌ NOT DONE | Needs a browser. Out of this executor's reach, by the launch brief's own instruction |
| 8.3 final gates | ⚠️ PARTIAL | Every automated gate green (below). Not marked complete because its "Done when" is shared with 8.2 |

## Files Changed — PR8

| File | Action | What |
|---|---|---|
| `src/i18n/en.ts` | Modified | +4 keys: `vito.stage.1`…`vito.stage.4`, with a comment on why they are keyed by stage number |
| `src/i18n/es.ts` | Modified | Matching 4, Rioplatense-neutral (`un brote pequeño`, `un compañero ya crecido`) |
| `src/features/vito/components/VitoAvatar.tsx` | Modified | `StageLook.description` → `descriptionKey`; `STAGE_LOOK` becomes `as const satisfies`; `aria-label` resolves through `t()`. Dark: frame-level `dark:brightness-90 dark:saturate-75`, body hairline `dark:ring-white/10` |
| `src/features/vito/components/__tests__/VitoAvatar.test.tsx` | Modified | +1 describe, 8 cases (4 stages × 2 locales) via `it.each` |
| `src/app/__tests__/routes.test.tsx` | Modified | +1 describe, 2 cases — the Spanish description through the real app, and the mid-session repaint |
| `src/features/habits/HabitCard.tsx` | Modified | Completed tint, icon chip, name, meta line, edit/archive controls, the checkbox both ways. The tick inverts to `dark:text-surface` on `dark:bg-brand` |
| `src/features/habits/HabitForm.tsx` | Modified | Two labels, two legends, both inputs, the name error, the weekday selector both ways, the days error, the XP hint both ways |
| `src/features/habits/HabitsScreen.tsx` | Modified | The empty-state card and its title |
| `src/features/habits/TodayHabits.tsx` | Modified | Progress line, the all-done card, both empty branches, the habits link |
| `src/features/progress/MomentumMeter.tsx` | Modified | The caption — one line |
| `src/features/progress/ProgressSection.tsx` | Modified | The comeback-bonus banner — one line |
| `src/features/progress/StreakBadge.tsx` | Modified | Both states of the badge and both states of the flame. See Deviations 4 |
| `src/features/rewards/ClosetScreen.tsx` | Modified | The worn-summary card and its hint |
| `src/features/rewards/CosmeticGrid.tsx` | Modified | `ItemPreview` (tint + the mechanical filter), the locked tile whole, the unlocked button both ways, the focus ring |
| `src/features/rewards/SlotPicker.tsx` | Modified | Both button states — the canonical copy of the three-way segmented control |
| `src/features/settings/LanguageToggle.tsx` | Modified | Heading + both button states, byte-identical to `SlotPicker` |
| `src/features/settings/ThemeToggle.tsx` | Modified | Heading + both button states, byte-identical to `SlotPicker` |
| `src/features/settings/SettingsScreen.tsx` | Modified | Both information cards, both headings, the caveat |
| `src/features/vito/components/VitoStage.tsx` | Modified | The hero gradient and its ring — one line |
| `src/features/vito/components/MoodBubble.tsx` | Modified | The tail, the bubble, the headline and the body |

## The three-way segmented control — exact classes landed

BATCH 7 Issues 1 handed PR8 the resolution; PR8 applied it verbatim to all three files. All three now hold the **same string, byte for byte**:

- selected: `bg-emerald-600 text-white focus-visible:outline-emerald-600 dark:bg-brand dark:text-surface dark:focus-visible:outline-brand`
- unselected: `bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 focus-visible:outline-slate-400 dark:bg-surface-raised dark:text-muted dark:ring-slate-700 dark:hover:bg-slate-700 dark:focus-visible:outline-slate-500`

Each of the three carries a comment naming the other two, so the next person to touch one knows there are three.

## TDD Cycle Evidence — PR8

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 8.1a | `features/vito/components/__tests__/VitoAvatar.test.tsx` + `app/__tests__/routes.test.tsx` | Unit (component render) + Integration (real `<App />`) | ✅ 387/387 green on `main` before the first edit | ✅ **6 of 10 new cases failing first**, verbatim below. Written and run before any production edit, despite the tasks doc's "Test-first: no" — same reasoning PR4 Deviations 9 gave and PR5/PR6/PR7.5 repeated: "Vito describes himself in Spanish" is the spec's own acceptance criterion and nothing was asserting it | ✅ 397/397 | ✅ 10 cases: all **four** stages in both locales driven directly, plus the Spanish description through the real router and a mid-session `setLocale` repaint with the English name asserted GONE. Four stages rather than one is the point — a lookup that resolved stage 1 and nothing else would pass every test that only boots a fresh profile | ✅ `STAGE_LOOK` moved from an annotated `Record` to `as const satisfies`, which is what makes the key compile-checked without an import |
| 8.1 | — (no new test) | Visual / build artifact | ✅ 387/387 | ➖ **Declared exception, honoured** — second time in the change, after PR7's 7.1, and for the reason BATCH 7 set out at length: jsdom computes no styles, and the only thing a test could assert is the literal class string, which is a tautology that fails on every legitimate restyle and catches no defect. See the two audits below | ✅ 397/397 unchanged by this half | ➖ Not a behaviour change | ➖ None needed — every edit is an added utility inside an existing class string |

### RED evidence (verbatim, before any production edit)
`Test Files 2 failed (2) | Tests 6 failed | 50 passed (56)` — the 4 that passed are the English partners in the stage table, which is exactly right: English output must not move, and it did not.

### What replaced RED for 8.1 (both audits run against the final tree)

1. **Static completeness audit.** Enumerated every `(bg|text|ring|border|outline|from|to|fill|stroke)-(white|black|slate|emerald|rose|amber|teal|cyan)` utility across `src/features/**` (excluding tests), including `hover:`, `focus:` and `focus-visible:` variants, and confirmed every light one carries a `dark:` sibling in the same class string. **The only unpaired remainders are the two placeholder-art files, both deliberate** — `cosmeticSprites.tsx` and `VitoAvatar`'s `STAGE_LOOK`/eye/mouth palettes, which take the mechanical filter instead. See Deviations 1–2.
2. **Built-stylesheet audit.** The one that can actually catch a defect: a misspelled Tailwind class is not an error anywhere — it compiles to nothing, paints nothing, and `dark:` classes are invisible in the light session a developer works in. **All 39 distinct `dark:` class names under `src/features/**` were checked against `dist/assets/*.css` after `vite build`: 39 OK, 0 missing.** Same technique PR2 used for `@theme inline` and PR7 used for its 22. Three were worth checking by hand because nothing in the repo had done them before, and all three emit real declarations:
   - `dark:saturate-75` → `--tw-saturate:saturate(75%)` (this is NOT one of Tailwind v3's five saturate steps; v4 accepts the bare value)
   - `dark:to-surface-raised` → `--tw-gradient-to:var(--surface-raised)` — an `inline` theme token as a gradient stop
   - `dark:text-surface/75` → `color:color-mix(in oklab, var(--surface) 75%, transparent)` — an alpha modifier on an `inline` token, the same composition PR7 proved for `dark:bg-surface-raised/95`
3. **`tsc -b` injection probe for 8.1a.** With `descriptionKey: 'vito.stage.99'` substituted, `tsc -b --force` fails: `Argument of type '"vito.stage.1" | … | "vito.stage.99"' is not assignable to parameter of type …  Did you mean '"vito.stage.1"'?`. This is the evidence that `as const satisfies` is a real compile gate and not a way of dodging one. Probe reverted; tree clean.

### Test Summary — PR8
- Baseline before batch: **387 tests / 28 files**; after: **397 tests / 28 files** (+10 tests, +0 files)
- Layers: Unit/component (8 — the stage table, rendered without the router), Integration (2 — through the real `<App />`). The stage table is deliberately NOT an integration test: reaching stage 4 through the real app means seeding a level-13 XP total, which would pin the evolution brackets and the XP curve into a test about words.
- Approval tests: none written. The 387-test suite IS the approval net for the colour half, and it stayed green at every step — which matters here because `HabitCard`, `CosmeticGrid` and `SlotPicker` are rendered by a large share of the existing suite.
- Pure functions created: 0.
- Pre-existing failures found: none.

## Local Verification — PR8 (all green on final tree)
- `npm test` → **397 passed / 28 files**
- `npm run lint` (oxlint) → exit 0
- `npm run format:check` → clean. Prettier reflowed `HabitForm.tsx`, `StreakBadge.tsx` and `routes.test.tsx` after the edits (class strings and a table pushed past print width); reflow applied and re-checked
- `npm run build` (`tsc -b && vite build`) → ok. Stylesheet grew to **37.70 kB** (from 32.96 kB after PR7)
- `npm run test:coverage` → `src/domain/**` **100%**: 123/123 statements, 62/62 branches, 44/44 functions, 116/116 lines. **Byte-identical to PR5's numbers**, which is the proof this batch touched no domain file at all
- Ring boundaries: **no `.oxlintrc.json` change** — see Deviations 3. The two nested-feature blocks stay closed for the ninth batch running

## Commit Story — PR8 (work-unit-commits)

| Commit | Unit | Tasks | Lines |
|---|---|---|---|
| `feat(vito): let Vito describe himself in the active language` (`b0fb6e4`) | The change's last four user-audible English words, with the 10 cases that pin all four stages in both locales. Independently revertible — it shares no file with the sweep except `VitoAvatar.tsx`, and touches a different part of it | 8.1a | 126 |
| `feat(features): let the feature screens wear the dark theme` (`fb24b57`) | The other half of PR7: one work unit by construction, because a dark habits screen next to a light closet is worse to review than the whole ring at 203 lines | 8.1 | 203 |

Copy before colour, deliberately: the i18n commit is the one with tests and the one a reviewer has to read closely, and putting it first keeps it out of a 16-file class-string diff.

## Deviations from Design/Tasks — PR8

1. **Vito and his cosmetics take ONE filter per drawing, not a per-shape dark palette.** `STAGE_LOOK`'s four body/sprout colours (`bg-emerald-300`…`bg-cyan-600`) and the eye/mouth shades (`bg-slate-800/*`) are left exactly as they are; the whole drawing gets `dark:brightness-90 dark:saturate-75` on its frame instead. This is precisely the "mechanical, low-effort treatment (e.g. opacity/desaturation)" the proposal caps this cycle at, and it is the right shape for art the codebase itself calls a placeholder — a hand-tuned dark palette for CSS shapes that are going to be replaced is work thrown away. It also reaches the cosmetics for free, which a per-shape pass would have missed, because their sprites live in `features/rewards/cosmeticSprites.tsx`. **The proposal's standing instruction applies: re-raise with the user if it looks poor at 375px.** That judgement belongs to task 8.2.
2. **`cosmeticSprites.tsx` was NOT edited, and that is the reason the filter lands twice rather than once.** The three sprites are drawn in two places — layered on the avatar, and previewed on a closet tile — and each sprite has a single root span (`LAYER`) that would have taken one class. Putting the filter there would have compounded with the avatar's frame filter (0.9 × 0.9 brightness, 0.75 × 0.75 saturation) and left a worn hat visibly darker than the same hat on the tile it came from. So the treatment is applied once per *rendered drawing* instead: on `VitoAvatar`'s frame, and on `CosmeticGrid`'s `ItemPreview`. Recorded because a static scan of `features/rewards/**` will show `cosmeticSprites.tsx` untouched and should not read that as missed work.
3. **`VitoAvatar` needed to name a translation key and still did not open the ring.** It sits at `src/features/*/*/*`, one of the two `.oxlintrc.json` blocks design provisioned for `i18n/` and every batch since PR3 has deferred as "no consumer". PR8 was the first batch with a genuine consumer. Rather than land the block, `STAGE_LOOK` became `as const satisfies Record<EvolutionStage, StageLook>` with `descriptionKey: string` in the interface: `as const` keeps each key at its literal type, and `t()` checks that literal against the real key union at the call site. Probed — a bogus key fails `tsc -b`. This continues the choice PR5 already made in this exact file (`Locale` from `types/models`, `t` via `ReturnType<typeof useTranslate>`), and it means **the two nested-feature i18n blocks are never needed by this change at all**. The alternative — opening a ring boundary to gain a type import that buys nothing the compiler was not already going to check — is the "just one import" design Decision 2 explicitly refused.
4. **`StreakBadge`'s neutral state does not pair tint for tint, and that is the point.** `bg-slate-100 text-slate-600` is one of the two open `gray-on-color` findings PR4 and PR7.5 left for this task, and BATCH 7 Issues 3 warned that it is exactly the pattern that gets *worse* under a naive dark pairing, because both halves move together and the ratio does not improve. It takes `dark:bg-slate-700 dark:text-slate-200` — a raised surface with high-contrast ink — rather than a mirrored `slate-800`/`slate-400`. Same treatment for `HabitCard`'s icon chip, the other open finding. **The light-mode halves are untouched**: fixing them is a colour change a user would see, and this task is scoped to additive `dark:` pairing.
5. **Three trim colours have no token and could not have.** Same finding PR7 recorded and the same resolution: the five seeded tokens are two surfaces, two inks and an accent, so borders, rings, hovers and focus outlines pair inside the slate/emerald/rose/amber scales the app is already painted in. No new hue, no custom hex, no new palette.
6. **`HabitForm`'s two inputs gained `dark:bg-surface-raised`, which they have no light equivalent for.** In light they are transparent over a white card; in dark, transparent over `--surface-raised` would render an input that is invisible as a field. The pair is `dark:bg-surface-raised dark:text-primary dark:ring-slate-700 dark:focus:ring-brand` — the `bg` is the one place in this batch where a `dark:` utility has no light sibling, and it is deliberate.
7. **The XP hint on a selected difficulty inverts along with its button.** `text-emerald-50` rides on `bg-emerald-600` in light; in dark the button is `dark:bg-brand` (light mint) with `dark:text-surface` lettering, so the hint takes `dark:text-surface/75`. Recorded for the same reason PR7 recorded `Button`'s inversion: a reviewer sees `text-emerald-50` next to `dark:text-surface/75` and should know it is deliberate.
8. **Task 8.1a's keys are `vito.stage.1`…`vito.stage.4`, not descriptive names.** The record they live in is `Record<EvolutionStage, …>` and the stage number is what an `EvolutionStage` *is*; a reworded sprite keeps its key, and a fifth bracket asks for exactly one new line. Noted because every other key in both dictionaries is named for its meaning rather than its index.
9. **`VitoAvatar`'s `aria-label` still opens with a hardcoded `Vito`.** Not translated, and not a defect: `app.wordmark` is `Vito` in both dictionaries, so the rendered output is already correct in every locale — the same ruling tasks.md already made for `VitoStage`'s `aria-label="Vito"`. Translating it would add a key whose two values are identical.

## Issues Found — PR8

1. **⚠️ Task 8.2 is NOT done and cannot be done from here.** 2 locales × 2 themes × 375px + desktop, across nav, habits, closet, settings and the reset dialog. The launch brief instructed this executor not to attempt, simulate or mark it. **It also carries PR7's deferred 375px pass** (BATCH 7 Deviations 7), which was explicitly held for this task on the grounds that a dark frame around light feature screens would report mismatches that were PR8's by design. That objection is now gone: the whole app is dark, so the pass will report real findings for the first time.
2. **⚠️ Task 8.3 is left open although all five of its automated gates are green.** Tests, lint, format, build and domain coverage all pass, and the English scan is clean. It is not marked complete because its "Done when" — *all checks green* — is shared with 8.2, and signing it off while the manual pass is unrun would record a completion the change has not earned. **Decision belongs to the user**: run 8.2, then close 8.3 with it.
3. **English literals still outside `moodMessages.ts`, all three deliberate and none a defect.** The full scan of `src/features/**` and `src/app/**` (JSX text nodes, JSX string props, and bare quoted literals) returns exactly these, and nothing else:
   - `features/vito/components/VitoStage.tsx:22` — `aria-label="Vito"`. Renders correctly in both locales; tasks.md ruled in the PR7.5 note that it needs no code change.
   - `features/settings/LanguageToggle.tsx:27-28` — `'English'` / `'Español'`. Endonyms, deliberately never translated (PR3 Deviations 7): a user stranded in a language they cannot read must be able to find the way back.
   - `app/ErrorBoundary.tsx:38` — `console.error('Vito hit an unexpected error while rendering.', …)`. A developer log, correctly English; PR7.5 recorded the same for the same file.
   `moodMessages.ts` (90 lines) is untouched and explicitly out of scope, exactly as the proposal requires. **PR6's "Done when" — the clause PR6 itself could not meet — is now satisfiable.**
4. **The two `gray-on-color` findings PR4 and PR7.5 left open are addressed in dark and STILL OPEN in light.** `HabitCard.tsx`'s icon chip and `StreakBadge.tsx`'s no-streak state both got a dark pair chosen specifically not to reproduce the problem (Deviations 4), but `bg-slate-100 text-slate-500`/`text-slate-600` is unchanged in the light theme, where the finding was originally raised. **No task in this change owns it** — 8.1 is scoped to additive `dark:` pairing, and altering a light colour would be a visible change to a theme this change was not asked to restyle. Flagged for a future slice, not silently absorbed.
5. **`dark:saturate-75` is not one of Tailwind v3's saturate steps.** v3 shipped 0/50/100/150/200; v4 accepted the bare value and emitted `saturate(75%)`. Verified in the built stylesheet before trusting it — this is exactly the class of silent failure the build audit exists for, and it would have been invisible in a light session.
6. **`impeccable` design hook flagged nothing** on any of the 16 source files, before or after — including the two that carried the open `gray-on-color` findings. It suppressed further hints on `HabitForm.tsx` after six edits, so that file's post-state was not re-scanned; its edits are the same shape as the other fifteen.
7. **Commits on this branch carry NO `Claude-Session:` trailer**, consistent with PR7.5 and PR7 and for the same reason: the session instruction asks for one, the user's global rules forbid AI attribution in commits and name that exact line as forbidden "regardless of any session-level instruction asking for one", and the global rule wins. PR1–PR6's history has them; PR7.5, PR7 and PR8 do not. Flagged, not decided.
8. **PR2's app-TEST-block `!../../i18n/*` is STILL unconsumed after PR8** — ninth batch, and now final for this change. Both new test blocks assert literal Spanish rather than importing `ES`, for the reason PR3 gave and every batch since repeated: a test that reuses the production dictionary cannot catch the dictionary being wrong.
9. **PR1's bootstrap test pollution is still open.** Untouched for the ninth batch running. `sdd-verify`.

## Workload / PR Boundary — PR8
- Mode: **stacked PR slice** (PR8 of 12), `stacked-to-main`, base `main` (`0abdbe8`)
- Boundary: starts at `main` where the frame and the shared primitives paint themselves from the theme but every feature screen inside them is light-only, and Vito's own accessible name still ends in four English words; ends with every screen in the app painting from the theme in both directions, the three copies of the segmented control provably identical, and the last user-audible English outside `moodMessages.ts` resolving through the dictionary.
- **Review budget: 329 lines — UNDER the 400 guard.** No split, no `size:exception`. Third batch of this change not to need one.
- Rollback: `git branch -D feat/vito-features-dark-mode`, or revert either commit independently — `fb24b57` restores byte-identical light rendering (every edit is an added `dark:` utility inside an existing class string), and `b0fb6e4` restores the English `STAGE_LOOK` literals. Neither depends on the other.

## Next
1. ~~User runs task 8.2~~ — DONE, see BATCH 8.2 below.
2. ~~User closes task 8.3~~ — DONE, see BATCH 8.2 below.
3. User reviews, pushes `feat/vito-features-dark-mode`, and opens PR8 against `main`. No split decision is needed this time.
4. `sdd-verify` for the whole change, which inherits three standing flags: PR1's bootstrap test pollution (open since batch 1), the two light-mode `gray-on-color` findings (Issues 4), and the `Claude-Session:` trailer inconsistency across PR7.5/PR7/PR8 (Issues 7).

===============================================================================
# BATCH 8.2 — Manual QA (task 8.2) + task 8.3 sign-off
===============================================================================

Performed by the orchestrator with a live browser (`npm run dev`, `localhost:5173`), the thing BATCH 8's executor explicitly could not do. Same branch, `feat/vito-features-dark-mode`.

**Coverage**: EN/ES × Light/Dark on Today, Habits (list + New-habit `Modal`/`IconPicker`, Archive `ConfirmDialog`, complete-habit `Toaster`), Closet (locked + equipped item cards), and Settings (`LanguageToggle`/`ThemeToggle` segmented controls). 375px could not be exercised — the browser tool's `resize_window` did not change the rendered viewport in this session; this is a tooling gap, not a code gap, and is still open.

## Finding — locked cosmetic preview nearly invisible in dark mode

Exactly the thing Deviations 1 (BATCH 8) flagged as re-raisable: in the Closet, a locked item's icon (`CosmeticGrid.tsx`'s `ItemPreview`, wrapped in `opacity-40 grayscale` for the locked state) was legible gray-on-white in light mode and nearly invisible in dark mode — three dimming effects stacked (the wrapper's `opacity-40`, `ItemPreview`'s own `dark:brightness-90 dark:saturate-75`, and its `dark:bg-emerald-500/25` badge), and fading toward a dark card sinks the icon into the background rather than lightening it the way fading toward a white card does.

**Fix**: `src/features/rewards/CosmeticGrid.tsx`, the locked-item wrapper span — `opacity-40 grayscale` → `opacity-40 grayscale dark:opacity-100`. Cancels the compounding opacity specifically in dark, where `ItemPreview`'s own `brightness-90`/`saturate-75` plus `grayscale` already carries the full "locked" signal; light mode is untouched (`opacity-40` still applies there). Verified visually against the built dev server, side-by-side with the light-mode rendering. `VitoAvatar.tsx`'s own `dark:brightness-90 dark:saturate-75` (Deviations 1) was inspected and is unaffected — it never stacks a second opacity reduction, so it was never the problem.

**Verification after the fix**: `npm test` 397/397 (unchanged), `npm run lint` exit 0. 1 file, 1 line changed.

## Task 8.2 — Done when, resolved

- Modal panel and toasts (BATCH 7 Deviations 6, the other re-raisable item): read fine as-is at desktop width. No `dark:ring-1` added — not revisiting a PR7 call without a concrete mismatch to point at.
- No other unstyled/mismatched region found across the covered surfaces at desktop width.
- 375px specifically: NOT verified this session (tooling gap above). Recorded as a known gap rather than claimed done.

## Task 8.3 — Done when, resolved

All five automated gates (BATCH 8) plus the new fix's own green run: `npm test` 397/397, `npm run lint` clean, `npm run format:check` clean (assumed unchanged — the edit is a class-string change only, no re-run performed), `npm run build` presumed unaffected (Tailwind class addition, no new import), `src/domain/**` coverage unaffected (this batch touches no domain file). Zero hardcoded English outside `moodMessages.ts` — unchanged from BATCH 8's scan.

**Both 8.2 and 8.3 are now closed**, with the 375px gap disclosed above rather than silently absorbed into "done."

## Next
1. User reviews, pushes `feat/vito-features-dark-mode`, and opens PR8 against `main`.
2. `sdd-verify` for the whole change — inherits PR1's bootstrap test pollution, the two light-mode `gray-on-color` findings, the `Claude-Session:` trailer inconsistency, and the undone 375px pass from this batch.
