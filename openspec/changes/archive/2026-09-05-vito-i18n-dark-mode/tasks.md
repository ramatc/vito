# Tasks: vito-i18n-dark-mode

> Size note: exceeds the 530-word tasks budget by design, same precedent as `sdd/vito/tasks` and
> this change's own spec/design. 9 PRs (PR7.5 added 2026-09-04 to close a gap PR6 surfaced),
> per-task file paths, Test-first flags, and a verified `.oxlintrc.json` block list were all
> explicitly required inputs.

Built strictly from spec #420, design #421, proposal #418. No new requirements invented.

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | 2600–3400 across 8 PRs (150–600 each) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR1 i18n+prefs infra → PR2 dark-mode infra → PR3 layout+components refactor → PR4 habits sweep → PR5 rewards+domain decouple → PR6 settings/app sweep → PR7.5 progress+ErrorBoundary sweep (added 2026-09-04) → PR7 dark sweep (layout) → PR8 dark sweep (features) |
| Delivery strategy | ask-on-risk |
| Chain strategy | **stacked-to-main** (confirmed at PR1 apply; matches `sdd/vito` MVP precedent PR1–PR6) |

Decision needed before apply: Yes — RESOLVED (stacked-to-main, PR1 sliced)
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|---|---|---|---|
| 1 | i18n dictionary/runtime + PreferencesRepository/store + oxlintrc infra blocks | PR 1 | No consuming UI touched; base = main |
| 2 | Dark-mode toggle mechanics (`documentPreferences.ts`, CSS `@custom-variant`, App effect) | PR 2 | Depends on PR1's `preferencesStore` |
| 3 | Layout ring: components go props-only (Decision 3), `AppShellRoute`, Language/ThemeToggle, Settings wiring | PR 3 | Depends on PR1+PR2 |
| 4 | Habits ring string-extraction | PR 4 | Depends on PR1+PR3 pattern |
| 5 | Rewards+domain decoupling (`cosmeticCatalog` name removal, `cosmeticCopy.ts`) | PR 5 | Depends on PR1 |
| 6 | Settings/App ring remaining string-extraction | PR 6 | Depends on PR1+PR3 |
| 7.5 | Progress ring string-extraction + `ErrorBoundary` copy | PR 7.5 | Depends on PR1+PR3. Added 2026-09-04 — see BATCH 6 Issues 1 |
| 7 | Dark-mode sweep — layout/ui ring | PR 7 | Depends on PR2 |
| 8 | Dark-mode sweep — features ring + avatar/cosmetics + launch QA | PR 8 | Depends on PR2, PR4, PR5, PR6, PR7.5 |

## PR1: i18n + Preferences Infra — ✅ MERGED to `main` (split into PRs #8–#11)

- [x] 1.1 `types/models.ts`: add `Locale`, `Theme`, `AppPreferences` (no `CosmeticItem.name` removal yet — deferred to PR5, see 5.2). Test-first: N/A — declarations-only.
- [x] 1.2 `i18n/keys.ts` + `i18n/en.ts`: seed EN dictionary + `TranslationKey`/`Dictionary` types. Test-first: no — declarations, compile-checked.
- [x] 1.3 `i18n/es.ts`: matching ES dictionary (compile-enforced parity). Test-first: no.
- [x] 1.4 `i18n/locale.ts`: `INTL_LOCALE_TAG`, `isLocale()`. Test-first: yes — `i18n/__tests__/locale.test.ts` (7 tests).
- [x] 1.5 `i18n/translate.ts`: `t()`, `tDynamic()`, `tCount()`. Test-first: yes — `i18n/__tests__/translate.test.ts` (16 tests: interpolation, fallback chain, en+es plural forms).
- [x] 1.6 `.oxlintrc.json`: 2 NEW blocks — `src/i18n/*`, `src/i18n/__tests__/*.test.ts`. Test-first: no — injection-probed (both fired on `zustand` + the sibling stores import + `@testing-library/react`).
- [x] 1.7 `services/storage/repositories.ts`: `PreferencesRepository` interface, wire into `createRepositories()`. Test-first: N/A — see 1.10.
- [x] 1.8 `services/storage/localStorageClient.ts`: `+preferences` key, `RESET_PRESERVED_KEYS` skipped by `clearAll()`. Test-first: yes — extended `localRepositories.test.ts`.
- [x] 1.9 `services/storage/defaults.ts`: `createDefaultPreferences()` from `navigator.language` + guarded `matchMedia`. Test-first: yes — RED covered ES/non-ES browser, casing, OS dark/light, jsdom `matchMedia`-undefined guard (8 tests).
- [x] 1.10 `services/storage/localPreferencesRepository.ts`: mirrors `localVitoRepository`; per-field fallback on corrupt values. Test-first: yes (7 tests).
- [x] 1.11 `stores/preferencesStore.ts`: `load/setLocale/setTheme`, deliberately no `reset()`. Test-first: yes — fake-repo pattern (9 tests).
- [x] 1.12 `hooks/useTranslate.ts`: store-bound `t`. Test-first: yes (4 tests, incl. live locale-switch repaint).
- [x] 1.13 `.oxlintrc.json`: MODIFY `src/hooks/*` and `src/hooks/__tests__/*.test.ts` — add the sibling i18n allowance at matching depth. Test-first: no — injection-probed (features/ + services/storage still denied).
- [x] 1.14 `app/bootstrap.ts`: `hydrateStores()` loads `preferencesStore`. Test-first: yes — extended bootstrap test (3 new incl. reset-preserves-preferences).

Done when: `npm test` green; `resetAll()`/`clearAll()` preserve `preferences`; zero UI files touched outside `i18n/`, `services/storage/`, `stores/`, `hooks/useTranslate.ts`, `app/bootstrap.ts`. — **ALL MET**. 328 tests / 25 files (from 273/21). Lint, format:check, build, domain-coverage gate all green.

## PR2: Dark-Mode Toggle Infra — ✅ MERGED to `main` (PR #12)

- [x] 2.1 `app/documentPreferences.ts`: `applyDocumentPreferences()` — `.dark` class, `html.lang`, `theme-color` meta. Test-first: yes — `app/__tests__/documentPreferences.test.ts` (8 tests).
- [x] 2.2 `index.css`: `@custom-variant dark`, `:root`/`.dark` vars, `@theme inline` 5 seeded tokens, `color-scheme`. Test-first: no — VERIFIED via built stylesheet (see below).
- [x] 2.3 `app/bootstrap.ts`: call `applyDocumentPreferences()` pre-paint, before `createRoot().render()`. Test-first: yes — 3 new tests through the real repositories.
- [x] 2.4 `app/App.tsx`: effect re-applying on every `preferences` change. Test-first: yes — 4 new tests driven through `setTheme`/`setLocale`.
- [x] 2.5 `.oxlintrc.json`: MODIFY `src/app/*`, `src/app/__tests__/*.test.ts(x)` — add the sibling i18n allowance at matching depth. Test-first: no — injection-probed.

Done when: `setTheme` flips `<html class="dark">` live; persisted dark theme has zero pre-paint flash; build stylesheet contains the custom variant. — **ALL MET**. 343 tests / 26 files (from 328/25). Lint, format:check, build, domain coverage (100%) all green. PR diff 371 lines — under the 400 guard.

**Design open questions RESOLVED in PR2:**
1. `@theme inline` vs `@theme` — **`inline` confirmed correct**, empirically. Built stylesheet emits `.bg-surface{background-color:var(--surface)}` (runtime lookup) and `.dark{--surface:#0f172a;…}`. Plain `@theme` would freeze the five at their `:root` values.
2. Pre-paint flash — **resolved, no inline `index.html` script needed.** `applyDocumentPreferences()` runs inside `bootstrap()` right after `hydrateStores()` and before `runDayRollover()`; `main.tsx` renders in that promise's `finally`, so the class lands before React's first paint.

**Token naming flag — RESOLVED before PR3** by `refactor(styles): shed the redundant text- prefix from ink tokens` on `feat/vito-layout-props-i18n`: `--color-text-primary` → `--color-primary`, `--color-text-muted` → `--color-muted`. PR7/PR8 write `text-primary` / `text-muted`, NOT `text-text-primary`.

**Seeded token values** (PR7/PR8 consume these, do not re-invent): `--surface` `#f8fafc`/`#0f172a`, `--surface-raised` `#ffffff`/`#1e293b`, `--text-primary` `#0f172a`/`#f1f5f9`, `--text-muted` `#64748b`/`#94a3b8`, `--brand` `#059669`/`#34d399` (light/dark). `THEME_COLOR` in `documentPreferences.ts` mirrors `--surface` and must be kept in step.

## PR3: Layout Ring — Components Props-Only + i18n Wiring — ✅ MERGED to `main` (split into PR3a #13 `feat/vito-layout-i18n-nav` + PR3b #14 `feat/vito-settings-toggles`)

- [x] 3.1 `components/ui/Modal.tsx`: `closeLabel` required (drop default). Test-first: no — mechanical, tests updated.
- [x] 3.2 `components/ui/ConfirmDialog.tsx`: `confirmLabel`/`cancelLabel` required. Test-first: no. **+`closeLabel` required** (design gap — `Modal` now demands one and reusing `cancelLabel` would put two identically-named controls on screen).
- [x] 3.3 `components/ui/Toaster.tsx`: `dismissLabel` required. Test-first: no.
- [x] 3.4 `components/layout/navItems.ts`: `label` → `labelKey: NavLabelKey`. Test-first: no — `tsc -b` verifies.
- [x] 3.5 `components/layout/{AppShell,BottomTabBar}.tsx`: accept `navLabels`/`wordmark`/`sidebarNavLabel`/`bottomNavLabel` props. Test-first: no — mechanical.
- [x] 3.6 `app/routes.tsx`: new `AppShellRoute()` (extends `SettingsRoute` precedent) resolving labels via `useTranslate()`; translate `HomeRoute` copy. Test-first: yes — 4 new cases in `routes.test.tsx` (RED: 3 failing).
- [x] 3.7 `features/settings/LanguageToggle.tsx`: new, calls `setLocale`. Test-first: no (covered by 3.9).
- [x] 3.8 `features/settings/ThemeToggle.tsx`: new, calls `setTheme`. Test-first: no (covered by 3.9).
- [x] 3.9 `features/settings/SettingsScreen.tsx`: wire both toggles in. Test-first: yes — 6 new cases in `routes.test.tsx` (RED: 6 failing) covering both spec scenarios.
- [x] 3.10 `.oxlintrc.json`: MODIFY `src/features/*/*` — add the sibling i18n allowance two levels up. Test-first: no — injection-probed 3×. `src/features/*/*/*` and `src/features/*/*/__tests__/*` deliberately NOT opened (no consumer at that depth; probed still-denied).

Done when: language switch re-renders nav+Home live (spec); reload after manual override does not re-run detection (spec); theme toggle flips+persists. — **ALL MET**. 353 tests / 26 files (from 343/26). Lint, format:check, build all green. Original diff was 537 lines (549 incl. the token rename), over the 400 guard; split into PR3a (279 lines, #13) + PR3b (270 lines, #14), both merged to `main`.

## PR4: Habits Ring String-Extraction — ✅ MERGED to `main` (split into PR4a #15 + PR4b #16 + PR4c #17) — ✅ APPLIED on `feat/vito-habits-i18n` (not pushed)

- [x] 4.1 `features/habits/{HabitList,HabitCard,HabitForm,HabitFormModal,HabitsScreen,TodayHabits,categories}.tsx`: replace hardcoded copy with `useTranslate()`; add keys to `en.ts`/`es.ts`. Test-first: no — mechanical; existing English-copy assertions updated alongside. **Scope corrected**: `categories` is `.ts` not `.tsx`; `HabitList` had no copy (no-op); `frequency.ts` and `habitIcons.ts` were NOT listed but sit in `features/habits/**` and are rendered by `HabitCard`/`HabitForm`, so the "Done when" required them too.
- [x] 4.2 `hooks/{useCompleteHabit,useTodayHabits}.ts`: translate owned toast/aria strings. Test-first: no. **`useTodayHabits.ts` owns zero strings — no-op.** `useCompleteHabit.ts` lost its exported `SAVE_ERROR_MESSAGE` constant, which forced a 2-line follow-on in `ClosetScreen` (PR5) and `SettingsScreen` (PR6).

NOTE for PR4: `habits.today.progress` is already seeded in PR1 for `TodayHabits`. PR3 pushed three literals INTO this ring that PR4 must now translate: `HabitFormModal` `closeLabel="Close"`, `HabitsScreen` `cancelLabel="Cancel"` + `closeLabel="Close"` (→ `common.close`, `common.cancel`). — **ALL THREE CONSUMED.**

Done when: no hardcoded English literal remains in `features/habits/**`; existing habit-flow tests still green. — **ALL MET**. 359 tests / 26 files (from 353/26). Lint, format:check, build all green.

**⚠️ PR4 IS OVER THE 400-LINE GUARD: 703 changed lines (539 insertions + 164 deletions) across 15 files.** Not split — the launch brief asked for one prepared branch. Commits split cleanly into three under-budget PRs with no reordering and no rebase surgery: `[style + dictionaries] = 165` / `[reference data + card + form] = 323` / `[hooks + screens + tests] = 215`. Decision belongs to the user.

**PR4 discovery — `format:check` and `openspec/`**: the planning artifacts on disk fail `prettier --check .` (prose Prettier wants to reflow). Landed as an isolated `style(lint)` commit adding `openspec` to `.prettierignore`, mirroring PR1's `.oxlintrc.json` precedent.

**Handoff to PR5/PR6**: `common.error.save` is now the key for the save-failure toast. `ClosetScreen` and `SettingsScreen` already call `t('common.error.save')` — do not re-add a constant. `common.xp` (`'{count} XP'`) and `common.xpGain` (`'+{count} XP'`) are seeded and consumed; reuse them for any remaining XP copy.

## PR5: Rewards + Domain Decoupling — ✅ APPLIED on `feat/vito-rewards-i18n` (not pushed)

- [x] 5.1 `domain/vito/cosmeticCatalog.ts`: remove `name`, keep only `id`s. Test-first: yes — 2 RED cases in `domain/vito/__tests__/cosmetics.test.ts` (exact field set; ids survive). Domain stays import-pure — `.oxlintrc.json`'s 4 domain blocks untouched.
- [x] 5.2 `types/models.ts`: remove `CosmeticItem.name` (paired with 5.1/5.3, not PR1 — avoids a window where the field exists unused). Test-first: N/A — `tsc -b` was the gate and it found a **third** reader the task list does not name: `features/vito/components/VitoAvatar.tsx`. See Deviations 1.
- [x] 5.3 `features/rewards/cosmeticCopy.ts`: `COSMETIC_NAME_KEYS` id→key map + `cosmeticName(locale, id)` via `tDynamic`. Test-first: yes — `features/rewards/__tests__/cosmeticCopy.test.ts` (5 tests: both locales × 3 ids, unknown-id fallback, catalog coverage). Needed ONE new `.oxlintrc.json` block — see Deviations 2.
- [x] 5.4 `features/rewards/{ClosetScreen,SlotPicker,CosmeticGrid}.tsx`: consume `cosmeticName()`; translate remaining copy. Test-first: **yes anyway** — 4 cases in `routes.test.tsx`, 2 of them RED, same reasoning as PR4's deviation 9.

NOTE for PR5: `features/rewards/cosmeticCopy.ts` sits at `src/features/*/*`, whose sibling i18n allowance PR3 already landed. No further `.oxlintrc.json` change needed. PR4 already gave `ClosetScreen` a `useTranslate()` for the save-error toast — reuse that `t`, do not add a second one. — **First half held; second half held. The note was wrong only about the TEST depth**: `src/features/rewards/__tests__/` is a depth with no block, exactly design.md Open Question 3.

Done when: closet names render correctly per locale (spec scenario "Locale switch updates cosmetic names"); `src/domain/**` coverage unaffected (only removes data). — **BOTH MET**. 370 tests / 27 files (from 359/26). Lint, format:check, build all green; `src/domain/**` still 100% statements/branches/functions/lines.

**⚠️ PR5 IS 13 LINES OVER THE 400-LINE GUARD: 413 changed lines (360 insertions + 53 deletions) across 13 files.** Clean 2-way split available at the `37b50a9`/`ab803af` boundary with no reordering: PR5a `[8aa61eb + 37b50a9] = 177` / PR5b `[ab803af + 72c22ab] = 236`. Boundary verified green (`tsc -b`, oxlint, 364/364). Decision belongs to the user.

**Handoff to PR6/PR8**: `common.and` is seeded as a bare conjunction (`and` / `y`) — the caller owns the spacing. `closet.*` and `cosmetic.*` are complete; `vito.avatar.wearing` is the only `vito.*` key. `VitoAvatar` now holds a `useTranslate()` + `usePreferencesStore` pair, so PR6 has a translator in place if it decides to finish that aria-label (see Issues 2).

## PR6: Settings/App Ring Remaining String-Extraction — ✅ APPLIED on `feat/vito-settings-app-i18n` (not pushed)

- [x] 6.1 `features/settings/{SettingsScreen,ResetProgressDialog}.tsx`: remaining copy. Test-first: **yes anyway** — 3 cases in `routes.test.tsx`, all 3 RED, same reasoning as PR4/PR5. PR3's `closeLabel="Close"` → `t('common.close')` consumed. 14 new `settings.*` keys.
- [x] 6.2 `app/{routes.tsx (HomeRoute remainder),App.tsx}`: `App.tsx` storage banner → `app.storageError`; PR3's `dismissLabel="Dismiss message"` → `t('common.dismiss')`. Test-first: **yes anyway** — 4 cases, 3 RED. **`routes.tsx` was a no-op**: PR3 translated all of `HomeRoute`, so there was no remainder.
- [x] 6.3 `.oxlintrc.json`: **no change needed**, exactly as predicted. No file was created this batch, so no new depth exists; `src/app/*`'s `!../hooks/*` (read-only) (pre-existing) and `src/features/*/*`'s `!../../hooks/*` (read-only) (pre-existing) already cover both new `useTranslate()` imports. Confirmed by full `npm run lint` green.

Done when: no hardcoded English literal remains anywhere outside `moodMessages.ts` (explicitly out of scope) and `features/vito/**`'s `STAGE_LOOK` descriptions in `VitoAvatar.tsx` (deferred to PR8 task 8.1a — see PR5 Issues 2; user decision 2026-09-04). — **NOT MET, and not meetable by 6.1–6.3 as enumerated.** Three more surfaces hold English that no PR1–PR8 task owns for copy; see BATCH 6 Issues 1. 377 tests / 27 files (from 370/27). Lint, format:check, build all green. 243 changed lines — **under** the 400 guard, no split needed. **Gap closed by PR7.5** (`features/progress/**` + `ErrorBoundary`) and PR8 task 8.1a (`STAGE_LOOK`); `VitoStage`'s `aria-label="Vito"` needed no code change.

## PR7.5: Progress Ring String-Extraction + `ErrorBoundary` — ✅ APPLIED, split into PR7.5a `feat/vito-progress-i18n-dict` + PR7.5b `feat/vito-crash-screen-i18n` (both rebased onto `main` post-PR6, not pushed)

Added by user decision 2026-09-04 to close the gap BATCH 6 Issues 1 flagged: PR6's "Done when" could not be met because `app/ErrorBoundary.tsx` and `features/progress/**` still hold hardcoded English, and no PR1–PR6 task owns either for copy. `features/vito/components/VitoStage.tsx`'s `aria-label="Vito"` needs no code change — `app.wordmark` already resolves to `"Vito"` in both dictionaries, so its rendered output is already correct. Depends only on PR1 (i18n infra) and PR3 (`src/features/*/*` oxlintrc allowance) — can land before or after PR7's dark-mode sweep in the stack.

- [x] 7.5.1 `features/progress/**` (4 files): translate presentational copy. Not mechanical — per design Decision 3, presentational components take resolved strings as props, so `ProgressSection` becomes this ring's translator. `StreakBadge` needs `tCount`, consuming PR1-seeded `progress.streak.best.one`/`.other` (unconsumed since PR1). Test-first: yes — new behavior, same TDD discipline PR4–PR6 applied. **All four files swept**; 12 new `progress.*` keys and the 2 PR1-seeded ones now consumed. `StreakBadge` takes `hasStreak` instead of the two raw counts (one predicate, chosen where the words are); `XpBar` keeps only `levelProgress` + the 2 resolved strings. 7 cases in `routes.test.tsx`, 6 of them RED.
- [x] 7.5.2 `app/ErrorBoundary.tsx`: translate `Something went wrong.` / `Try reloading the page.`. Class component — cannot call `useTranslate()` directly; takes the two strings as props from `App.tsx`, its only render site. Test-first: **yes anyway** — 3 cases in a new `app/__tests__/ErrorBoundary.test.tsx`, 1 RED. `App.tsx` gains a `useTranslate()` — which is the same line PR6 adds to that file, so the two branches conflict there (see BATCH 7.5 Issues 1). `console.error` stays English (developer log).
- [x] 7.5.3 `.oxlintrc.json`: only if 7.5.1/7.5.2 surface a genuinely new file-depth pattern — none expected, `features/progress/**` sits at `src/features/*/*`, already open since PR3. **No change needed, exactly as predicted.** `src/features/*/*` covers `ProgressSection`'s `../../i18n/translate` (read-only), `../../hooks/useTranslate` (read-only) and `../../stores/preferencesStore` (read-only); the new test sits in `src/app/__tests__/`, whose block PR2 landed. Confirmed by `npm run lint` exit 0.

Done when: no hardcoded English literal remains in `features/progress/**` or `app/ErrorBoundary.tsx`; existing progress/error-boundary tests still green. — **BOTH MET.** Every remaining quoted English in those five files is a doc-comment example or the `console.error` developer log. 380 tests / 28 files (from 370/27 on `main`). Lint, format:check, build all green.

**PR7.5 WAS 38 LINES OVER THE 400-LINE GUARD: 438 changed lines (378 insertions + 60 deletions) across 10 files. RESOLVED: split 2-way**, no reordering — PR7.5a `[6ac44c3 + 77be0bc] = 351` (dictionaries + the progress ring, branch `feat/vito-progress-i18n-dict`) / PR7.5b `[6dc5020] = 85` (the crash screen, branch `feat/vito-crash-screen-i18n`, stacked on PR7.5a). Both branches rebuilt off `main` post-PR6 merge (PR6 and the dictionary commit both touched `en.ts`/`es.ts`; conflict resolved by keeping both sides' new keys — `app.storageError` from PR6 alongside `app.error.title`/`app.error.hint` from PR7.5). Each boundary independently verified: PR7.5a `tsc -b` clean, oxlint clean, format:check clean, **384/27**; PR7.5b same, **387/28**.

## PR7: Dark-Mode Sweep — Layout/UI Ring — ✅ APPLIED on `feat/vito-layout-dark-mode` (not pushed)

- [x] 7.1 `components/layout/{AppShell,BottomTabBar,Screen}.tsx`, `components/ui/{Button,Card,Modal,ProgressBar,IconPicker,ConfirmDialog,Toaster}.tsx`: additive `dark:` pairing using the 5 seeded tokens. Test-first: no — visual. **Honoured**: no test was written; the 387-test suite is the regression net and stayed at 387/387 (nothing in this repo asserts a Tailwind class string). Every light colour utility in all 10 files now carries a `dark:` pair. The 5 tokens carry the wholesale surfaces and the ink; borders, rings, hovers and focus rings pair with the slate/emerald/rose scales the app is already painted in, exactly as `index.css`'s own comment prescribes ("everything else pairs an explicit `dark:` utility instead").

NOTE for PR7: the two new settings controls (`LanguageToggle`, `ThemeToggle`) copy `SlotPicker`'s light-only button classes verbatim — they are PR8's, not PR7's, but the three must end up identical. **Verified during PR7 and resolved for PR8**: all three strings are byte-identical to each other AND to `Button`'s `primary` / `secondary` variants (only `text-slate-600` vs `text-slate-900` differs). PR8 pairs all three with exactly what PR7 landed on `Button`: selected → `dark:bg-brand dark:text-surface dark:focus-visible:outline-brand`; unselected → `dark:bg-surface-raised dark:text-muted dark:ring-slate-700 dark:hover:bg-slate-700 dark:focus-visible:outline-slate-500`.

Done when: manual pass at 375px in dark mode shows no unstyled/mismatched regions. — **MET as far as this ring can prove it.** Static audit: zero unpaired colour utilities remain in the 10 files. Build audit: all 22 distinct new `dark:` classes emit real rules in `dist/assets/*.css` (no silently-dropped typo). 387 tests / 28 files, lint, format:check and build all green. The literal 375px browser pass is still owed and cannot be done from here — it belongs with PR8's launch QA (task 8.3), when the feature screens inside this frame are dark too.

## PR8: Dark-Mode Sweep — Features Ring + Avatar/Cosmetics + Launch QA — ✅ ALL TASKS APPLIED on `feat/vito-features-dark-mode` (not pushed)

- [x] 8.1 `features/{habits,progress,rewards,settings}/**`, `features/vito/components/{VitoAvatar,VitoStage,MoodBubble}.tsx`: additive `dark:` pairing; avatar/cosmetics get the mechanical low-effort treatment (opacity/desaturation) per proposal's explicit scope cap — re-raise with the user if it looks poor. Test-first: no. **Honoured** (second time in the change, after PR7): no test written, the 387-test suite is the regression net and stayed green. 16 files touched; static audit shows zero unpaired light colour utilities outside the two deliberate placeholder-art exceptions (see BATCH 8 Deviations 1–2). All 39 distinct `dark:` classes under `src/features/**` emit real rules in `dist/assets/*.css`.
- [x] 8.1a `features/vito/**` `STAGE_LOOK` stage descriptions (`VitoAvatar.tsx`): translate via the dictionary, reusing the `useTranslate()` + `usePreferencesStore` pair PR5 already wired in. Added by user decision 2026-09-04 to close the gap PR5 Issues 2 flagged (PR6's "Done when" cannot cover it since no PR1–PR6 task owns `features/vito/**` copy). `moodMessages.ts` stays explicitly out of scope. Test-first: **yes anyway** — 10 cases (8 in `features/vito/components/__tests__/VitoAvatar.test.tsx`, 2 in `routes.test.tsx`), 6 of them RED. Same reasoning PR4/PR5/PR6/PR7.5 gave. 4 new `vito.stage.*` keys per locale. **No `.oxlintrc.json` change**: the key stays a literal inside `as const satisfies`, so `t()` still compile-checks it without `TranslationKey` crossing the ring boundary — probed, `vito.stage.99` fails `tsc -b`.
- [x] 8.2 Manual QA: 2 locales × 2 themes × 375px+desktop — nav, habits, closet, settings, reset dialog. Test-first: no — manual, mirrors `sdd/vito/tasks` 8.4. **Done by the orchestrator with a live browser** (BATCH 8.2). EN/ES × Light/Dark covered at desktop width across Today, Habits (list, New-habit modal/icon-picker, archive confirm-dialog, complete toast), Closet (locked + equipped cards), Settings (both segmented controls). Found and fixed one real dark-mode regression (locked cosmetic preview nearly invisible — see BATCH 8.2). Modal/toast shadows (BATCH 7 Deviations 6) read fine as-is, not touched. **375px NOT verified** — the browser tool's viewport resize did not take effect this session; disclosed as a known gap, not claimed done.
- [x] 8.3 Full `npm test` + `npm run lint` + `npm run format:check` + `npm run build`; confirm `src/domain/**` coverage unaffected; confirm zero hardcoded English outside `moodMessages.ts`. Test-first: no. **All five automated gates green**, re-verified after the BATCH 8.2 fix — 397 tests / 28 files, oxlint exit 0. `src/domain/**` unaffected (fix touches only `features/rewards/CosmeticGrid.tsx`). English scan unchanged from BATCH 8 (clean, 3 deliberate exceptions).

Done when: all checks green. MVP's still-open M1/M2 manual items are explicitly NOT re-scoped here. — **MET, with one disclosed gap.** Every automated gate is green and the manual pass ran at desktop width in both locales and themes; the 375px pass specifically could not be exercised in this session's browser tooling and is recorded as open rather than claimed.

**PR8 review budget: 329 changed lines (257 insertions + 72 deletions) across 20 files — UNDER the 400 guard.** No split needed, the third batch of this change not to need one (after PR6 and PR7). Two commits, split at the copy/colour boundary: `[8.1a] = 126` / `[8.1] = 203`.

## `.oxlintrc.json` — Verified Against Actual File

Read the live file (18 override blocks). Design's list is accurate:

**2 NEW**: `src/i18n/*`, `src/i18n/__tests__/*.test.ts` — ✅ DONE in PR1
**7 MODIFIED** (add the sibling i18n import allowance at matching depth): `src/hooks/*` ✅ PR1, `src/hooks/__tests__/*.test.ts` ✅ PR1, `src/features/*/*` ✅ PR3, `src/features/*/*/*` (deferred — no consumer; PR5 confirmed still none, `VitoAvatar` reaches `cosmeticCopy` sideways through the already-allowed `!../../*/*` (read-only)), `src/features/*/*/__tests__/*.test.ts(x)` (deferred — no consumer), `src/app/*` ✅ PR2, `src/app/__tests__/*.test.ts(x)` ✅ PR2

**+1 NEW, unplanned: `src/features/*/__tests__/*.test.ts(x)` — ✅ PR5.** This is design.md Open Question 3 ("If the sweep adds a test at `src/features/<feature>/__tests__/`, that path currently falls under `src/features/*/*/*`, which allows neither Testing Library nor `vitest`… Not added preemptively"). Task 5.3's mandated unit test is that consumer, so the block landed. Total affected is now **10**. Injection-probed twice: with the block, `services/storage` is refused by the block's own message; with its glob disabled, `vitest` and `../cosmeticCopy` (read-only) are both refused by the nested-feature rule underneath.

Total affected: **9** (2 new + 7 modified) — this exceeds the exploration's original "~6-8" estimate; flagged as a verified correction, not a design defect (design itself already had the accurate count). 7 of 9 landed (PR1: 4, PR2: 2, PR3: 1); the last 2 are the nested-feature depths and stay closed until something at that depth actually needs `i18n/`. **Still 7 of 9 after PR4, PR5's extra block, PR6, PR7.5, PR7 and PR8** — the two nested-feature depths have now gone nine batches unneeded, and PR8 was the batch that finally had a candidate: `VitoAvatar.tsx` needed to name a translation key. It did so with `as const satisfies` instead, so the blocks stay closed for the whole change. See BATCH 8 Deviations 3.

**PR3 lint discovery**: `no-restricted-imports` DOES flag `import type` — a type-only import from `i18n/keys` in `features/settings/` errors without the allowance. Probed directly. Type-only imports are not a loophole in this boundary.

PR1 discovery: `.oxlintrc.json` was failing `npm run format:check` on `main` (pre-existing). PR1 landed the Prettier reflow as an isolated `style(lint)` commit so PR2/PR3/PR6 config hunks stay small and reviewable. Confirmed effective — PR2's config diff is exactly 2 added lines, PR3's is 1.

## Out of Scope (per spec, not tasked)
Third locale, live OS-theme-following after override, `moodMessages.ts`, any 3rd-party i18n library.

