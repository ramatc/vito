```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:8aa87601c9a55b87d325088813fcbf033892c8728f7de3ceccafbdd684255127
verdict: pass_with_warnings
blockers: 0
critical_findings: 0
requirements: 8/8
scenarios: 15/15
test_command: npm test
test_exit_code: 0
test_output_hash: sha256:215e712ac0f7cd5a9e1b6c726802d8c86238e194eaef200b36f850bebf0d99aa
build_command: npm run build
build_exit_code: 0
build_output_hash: sha256:0d542fc7f2467a90f0555f0b04f5aa08d8ca19775a41345f2f08ee4abe1639c3
```

## Verification Report

**Change**: vito-i18n-dark-mode
**Version**: N/A (single spec revision, no versioning scheme in this project)
**Mode**: Strict TDD (active)
**Verification type**: FULL / FINAL - all 46/46 tasks across PR1-PR8 (PR7.5 counted separately), all
merged to `main` as of commit `a106c65` (PR #24, `feat/vito-features-dark-mode`). This report
supersedes the prior PARTIAL verify (`verify-report.md`, scoped to PR1-PR4 / tasks 1.1-4.2, 31 of
42 tasks under an earlier task count) and recomputes totals against the CURRENT 4 spec files rather
than reusing that report totals of 7/7 requirements and 13/13 scenarios. The dispatcher stale-report
finding is resolved here: the prior report deliberately excluded
`cosmetic-catalog-domain-decoupling` (1 requirement, 2 scenarios) as out of its declared scope; the
current 4 specs together define 8 requirements and 15 scenarios, and this report accounts for all
of them.

Evidence revision: `main` at `a106c65` (merge of PR #24, `feat/vito-features-dark-mode`, which itself
includes `9ab9d1f` - the dark-mode locked-cosmetic-preview fix from BATCH 8.2). Working tree clean
except for this session own `openspec/` artifacts (untracked, not part of the app).

### Completeness
| Metric | Value |
|--------|-------|
| Tasks total | 46 |
| Tasks complete | 46 |
| Tasks incomplete | 0 |

Spot-checked a sample of tasks across every PR (not only the most recent) directly against the
codebase, independent of apply-progress.md own claims:
- **1.1** (`types/models.ts`): `Locale`, `Theme`, `AppPreferences` present exactly as designed.
- **1.8/1.10** (`localStorageClient.ts`): `preferences` key plus `RESET_PRESERVED_KEYS` named exemption
  confirmed present and wired into `clearAll()` skip check.
- **1.11** (`preferencesStore.ts`): confirmed no `reset()` method exists, by design.
- **3.1** (`Modal.tsx`): `closeLabel` is a required prop with no default, confirmed.
- **5.1/5.2** (`cosmeticCatalog.ts` / `types/models.ts`): confirmed zero `name` fields remain in
  either file - grep for `name` in `cosmeticCatalog.ts` returns nothing.
- **5.3** (`cosmeticCopy.ts`): `COSMETIC_NAME_KEYS` plus `cosmeticName()` confirmed present, with
  passing unit tests covering both locales, all three ids, and the unknown-id fallback.
- **7.1/8.1** (dark-mode sweep): `dark:` class pairs confirmed present in `HabitCard.tsx`,
  `StreakBadge.tsx`, `Modal.tsx`, and other swept files.
- **8.1a** (`VitoAvatar.tsx` `STAGE_LOOK`): confirmed `descriptionKey` resolves through `t()`, not a
  hardcoded string.
- **9ab9d1f** (BATCH 8.2 fix): `CosmeticGrid.tsx` locked-item wrapper confirmed carries
  `dark:opacity-100`, canceling the compounding-opacity defect found during manual QA.

No discrepancy found between tasks.md 46/46 claim and the actual code state in the sampled tasks.

### Build & Tests Execution
**Build**: PASSED
```text
$ npm run build
> tsc -b && vite build
2298 modules transformed.
dist/index.html                   0.52 kB
dist/assets/index-*.css          38.21 kB
dist/assets/index-*.js          432.76 kB
built in ~0.8s
exit 0
```

**Tests**: 397 passed / 0 failed / 0 skipped (28 files)
```text
$ npm test
> vitest run
Test Files  28 passed (28)
     Tests  397 passed (397)
exit 0
```
Matches the change own expected numbers (approximately 397 tests / 28 files) exactly. Re-run independently in
this session, not taken on apply-progress.md word alone.

**Lint** (`npm run lint` / oxlint): PASSED, exit 0, zero errors/warnings.
**Format** (`npm run format:check` / prettier --check .): PASSED, clean.

**Coverage**: domain-layer gate only (`src/domain/**`, threshold: 100%) -> PASSED, 100%
statements/branches/functions/lines (123/123, 62/62, 44/44, 116/116) - re-run independently this
session, byte-identical to the numbers apply-progress.md reports after PR5 and PR8, confirming PR6,
PR7, PR7.5, and the BATCH 8.2 fix touch no domain file.

### Spec Compliance Matrix

| Requirement | Scenario | Test | Result |
|---|---|---|---|
| i18n / Locale Dictionary and Translation Function | Known key resolves in active locale | `i18n/__tests__/translate.test.ts` | COMPLIANT |
| i18n / Locale Dictionary and Translation Function | Unsupported locale value is rejected, falls back to en-US | `i18n/__tests__/locale.test.ts` (isLocale rejection, incl. 'fr') + `services/storage/__tests__/localRepositories.test.ts` (per-field fallback on corrupt locale) | COMPLIANT |
| i18n / Initial Locale Detection | Browser reports Spanish | `services/storage/__tests__/localRepositories.test.ts` (detectLocale from navigator.language) | COMPLIANT |
| i18n / Initial Locale Detection | Browser reports a non-Spanish language | same file, non-es branch | COMPLIANT |
| i18n / Manual Locale Override | User switches language in Settings, all strings re-render immediately | `app/__tests__/routes.test.tsx` (PR3 LanguageToggle cases, en/es both directions) | COMPLIANT |
| i18n / Manual Locale Override | Reload after manual override, detection MUST NOT re-run | `app/__tests__/bootstrap.test.ts` (loads the saved language, not the browser-detected one) + `localRepositories.test.ts` (does not re-detect once a choice has been saved) | COMPLIANT |
| dark-mode / Initial Theme Detection | OS reports dark | `services/storage/__tests__/localRepositories.test.ts` (osPrefersDark cases) | COMPLIANT |
| dark-mode / Initial Theme Detection | OS reports light | same file plus the matchMedia-undefined guard (jsdom) starts light instead of throwing | COMPLIANT |
| dark-mode / Manual Theme Override Is OS-Independent | User toggles theme, html class updates and persists | `app/__tests__/routes.test.tsx` (ThemeToggle cases) + `app/__tests__/documentPreferences.test.ts` | COMPLIANT |
| dark-mode / Manual Theme Override Is OS-Independent | OS theme changes after override, rendered theme MUST NOT move | `services/storage/__tests__/localRepositories.test.ts` (saved dark survives a disagreeing live osPrefersDark(false)) | COMPLIANT |
| preferences-persistence / Preferences Persistence Contract | Reload restores persisted preferences before render | `app/__tests__/bootstrap.test.ts` (pre-paint suite) | COMPLIANT |
| preferences-persistence / Preferences Persistence Contract | First run has no stored preferences, falls back without error | `localRepositories.test.ts` + `defaults.ts` coverage | COMPLIANT |
| preferences-persistence / Exclusion from Reset Progress | Reset clears habit/history/Vito data, locale and theme remain exactly as they were | `app/__tests__/bootstrap.test.ts` (resetAllData preserves preferences; "leaves every store readable" - re-run in isolation this session, still passes, see Confirmed/Refuted below) | COMPLIANT |
| cosmetic-catalog-domain-decoupling / Cosmetic Catalog Stays Import-Pure | Rendering a cosmetic item name, resolved via external lookup, never read from domain/ | `domain/vito/__tests__/cosmetics.test.ts` (COSMETIC_CATALOG carries no display copy, exact field set plus id survival) + `features/rewards/__tests__/cosmeticCopy.test.ts` (5 cases: both locales times 3 ids, unknown-id fallback, catalog-coverage guard) | COMPLIANT |
| cosmetic-catalog-domain-decoupling / Cosmetic Catalog Stays Import-Pure | Locale switch updates cosmetic names without any change to cosmeticCatalog.ts data | `app/__tests__/routes.test.tsx` - "repaints the cosmetic names when the language changes mid-session" (asserts the Spanish name appears and the English name is gone after a live setLocale('es'), with zero change to domain data) | COMPLIANT |

**Compliance summary**: 15/15 scenarios compliant (8/8 requirements), across all 4 spec domains.
Re-verified by reading the actual test files and confirming each named assertion exists (not taken
on apply-progress.md cross-references alone) plus a full green re-run of the suite this session.

### Correctness (Static Evidence)
| Requirement | Status | Notes |
|---|---|---|
| t(key, locale) pure translation function | Implemented | Actual signature is t(locale, key, params?) - argument order differs from the spec illustrative text but the requirement (pure, two-locale, resolves functional strings) is met. Cosmetic naming/order note only, carried forward from the prior partial verify, still non-blocking. |
| Locale internal bucket is en/es, not literal en-US | Implemented, deliberate | Design Decision 1 maps en to en-US via INTL_LOCALE_TAG for html lang / Intl. The app genuinely supports the two locales the spec names; the internal key is an implementation detail verified not to leak. |
| resetAll() excludes preferences | Implemented | RESET_PRESERVED_KEYS named-exemption list (Decision 5), covered by test, re-confirmed present in the current tree. |
| PreferencesRepository mirrors existing repo pattern | Implemented | localPreferencesRepository.ts mirrors localVitoRepository.ts structurally; per-field fallback on corrupt data. |
| components/** receives i18n strings as props only, no hook import | Implemented | Design Decision 3 - Modal/ConfirmDialog/Toaster/navItems all take required label props; .oxlintrc.json deliberately leaves components/** closed to i18n/, confirmed unchanged through PR8. |
| domain/vito/cosmeticCatalog.ts stays import-pure, ids only | Implemented | Confirmed by direct grep: zero name: fields in the file. COSMETIC_NAME_KEYS/cosmeticName() live in features/rewards/, outside domain/. |
| Dark mode is a dark class toggle, no live OS re-following after override | Implemented | documentPreferences.ts is the sole writer of html class/lang/theme-color; matchMedia is read once in defaults.ts with no addEventListener anywhere in the app - confirmed by direct grep, no live-following mechanism exists. |
| Additive dark: pairing across layout/ui (PR7) and features (PR8) rings | Implemented | Confirmed by static grep across swept files (HabitCard.tsx, StreakBadge.tsx, Modal.tsx, etc.) and by apply-progress.md own built-stylesheet audits (22 plus 39 distinct dark: classes verified emitted in dist/assets/*.css). |

### Coherence (Design)
| Decision | Followed? | Notes |
|---|---|---|
| D1 - bare en/es key naming plus INTL_LOCALE_TAG | Yes | Verified in locale.ts + locale.test.ts. |
| D2 - AppShellRoute() prop-channel wrapper | Yes | app/routes.tsx, tested in routes.test.tsx. |
| D3 - components/** gets no i18n allowance, refactor to required props instead | Yes | Confirmed via .oxlintrc.json (blocks unchanged through PR8) plus the 3 UI components required props. |
| D4 - detection lives in services/storage/defaults.ts, matchMedia guarded | Yes | defaults.ts guards typeof window.matchMedia !== 'function'. |
| D5 - RESET_PRESERVED_KEYS named exemption | Yes | localStorageClient.ts, unchanged through PR8. |
| D6 - no SCHEMA_VERSION bump | Yes | Confirmed unchanged; additive-key rollout as designed. |
| @theme inline (not plain @theme) for the 5 seeded tokens | Yes | Verified in PR2 against the built stylesheet; re-confirmed here via npm run build producing the expected dist/assets/*.css, and by PR7/PR8 own alpha-modifier composition checks (dark:bg-surface-raised/95, dark:to-surface-raised, dark:text-surface/75). |
| Mechanical, low-effort dark treatment for Vito/cosmetics placeholder art (design open item 2, resolved by proposal explicit scope cap) | Yes | VitoAvatar frame takes one dark:brightness-90 dark:saturate-75 filter rather than a per-shape palette; CosmeticGrid ItemPreview gets the same treatment once per rendered drawing. Re-raised with the user per the proposal standing instruction (BATCH 8.2 finding - locked-preview visibility), and the fix landed (9ab9d1f). |

### Standing Flags - Explicit Disposition

The task brief named five flags carried forward across almost every apply batch. Each is evaluated
independently below, not taken on apply-progress.md word alone.

**1. PR1 order-dependent bootstrap.test.ts pollution flag.**
Re-ran the exact single test in isolation this session:
`npx vitest run src/app/__tests__/bootstrap.test.ts -t "leaves every store readable"` -> 1 passed,
22 skipped - it passes on its own. Reading resetAllData() -> hydrateStores()
(app/bootstrap.ts) shows it unconditionally calls usePreferencesStore.getState().load(), and
preferencesStore.load() unconditionally sets status: ready after resolving - the assertion is
genuinely exercised by resetAllData() itself, independent of any earlier test boot() call.
Disposition: REFUTED, not a genuine defect. The flag is stale and was carried forward nine
batches without being re-checked against the actual code path. Recommendation: archive-as-is.
No fix is needed because there is nothing to fix; the flag itself should be struck from any future
reading of apply-progress.md as a live concern.

**2. Two light-mode gray-on-color contrast findings (HabitCard.tsx icon chip, StreakBadge.tsx
no-streak state).**
Confirmed present and unchanged in light mode: HabitCard.tsx line 59 still reads
bg-slate-100 text-slate-500 for its light half, and StreakBadge.tsx line 41 still reads
bg-slate-100 text-slate-600. Both are pre-existing (predate this change; PR4 and PR7.5 only shifted
their line numbers) and both are now correctly paired for dark mode
(dark:bg-slate-700 dark:text-slate-300 / dark:bg-slate-700 dark:text-slate-200) rather than
mirrored naively, which apply-progress.md documents as a deliberate choice to avoid making the dark
half worse. Disposition: accepted pre-existing limitation, out of this change scope. This
change task list is scoped to additive dark: pairing (PR7/PR8), not a light-mode colour
restyle; fixing the light-mode contrast would be a visible, unscoped design change to colours this
change was never asked to touch. Recommendation: archive-as-is, flagged as a follow-up item for
a future accessibility-focused slice, not a blocker for this change.

**3. Claude-Session trailer inconsistency across commits.**
Verified directly via git log: PR1 through PR6 commits (5c920ab, 3c6a027, de99525, and
earlier) carry a Claude-Session trailer. PR7.5, PR7, and PR8 commits (b8fc6d9, 0bfdb82,
b906b28, c1cf5a3, b0fb6e4, fb24b57, 9ab9d1f) carry none. This matches the user own global
no-AI-attribution rule, which explicitly overrides any session-level instruction asking for the
trailer, and apply-progress.md records this as a deliberate, disclosed choice in each PR7.5/PR7/PR8
batch, not an oversight. Disposition: resolved policy question, not a defect. Confirmed
consistently absent from PR7 onward as stated. Recommendation: archive-as-is. No action needed;
history correctly reflects two different policy regimes in sequence, both disclosed.

**4. The undone 375px mobile QA pass.**
Confirmed via BATCH 8.2: manual QA covered EN/ES times Light/Dark at desktop width across Today,
Habits, Closet, and Settings, and found plus fixed one real dark-mode regression (locked cosmetic
preview visibility, 9ab9d1f). The 375px viewport pass specifically could not be exercised because
the browser tool resize_window did not take effect in that session - disclosed explicitly as a
tooling gap in apply-progress.md, not silently claimed done, and task 8.2 "Done when" is recorded
as met "with one disclosed gap" rather than fully met. Disposition: accepted, disclosed limitation
- not a code defect. Everything provable without a live 375px browser session was proved (two
static/build audits confirming zero unpaired dark: utilities across all swept files).
Recommendation: archive-as-is, with the 375px pass recorded as a follow-up manual QA item for a
future session with working browser tooling - not a blocker, since it is a verification-method
limitation of this environment, not evidence of an actual visual defect.

**5. PR2 unconsumed .oxlintrc.json app-test-block allowance (!../../i18n/*).**
Re-confirmed via grep of the live .oxlintrc.json: the entry exists at line 341 under the
src/app/__tests__/*.test.tsx (etc.) block. A search across src/app/__tests__/** for any i18n
import returns nothing - every test in that directory asserts literal Spanish/English strings
instead of importing the dictionary, which apply-progress.md argues (persuasively, and consistently
across nine batches) is the stronger test: a test that reuses the production dictionary cannot
catch the dictionary itself being wrong. Inspected the actual allowlist block: the entry is one line
in a deny-by-default no-restricted-imports list that already permits several other sibling paths -
it widens the allowlist by exactly one path and does not loosen, override, or interact with any
other rule. Disposition: genuinely inert, but not weight worth removing now. It is not "dead
weight" in the sense of active risk (it cannot mask anything, and removing it would not change any
current passing behaviour), but it is also not exercised by anything in the current tree. Nine
consecutive batches independently declined to use it for the same principled reason.
Recommendation: archive-as-is. Removing it now would be a config change unrelated to any task in
this change, and keeping it costs nothing (one line in a config file, harmless by direct
inspection). If a future change adds a test that genuinely needs to import i18n/ from
app/__tests__/, the allowance is already there; if not, it can be swept in a future lint-hygiene
pass, not this one.

### TDD Compliance
| Check | Result | Details |
|---|---|---|
| TDD Evidence reported | Yes | Full TDD Cycle Evidence tables present for every batch (PR1 through PR8 plus PR7.5 plus BATCH 8.2) in apply-progress.md. |
| All tasks have tests or an explicit rationale | Yes | Declarations-only / config-only / visual-only tasks (1.1-1.3, 1.6, 1.13, 2.2, 2.5, 3.10, 6.3, 7.1, 7.5.3, 8.1) each carry an explicit non-test rationale (compile-checked, injection-probed, or visual with no assertable behaviour in jsdom), not silently skipped. The visual Test-first: no tasks (2.2, 7.1, 8.1) are legitimate: jsdom computes no styles and the only assertable thing is a literal Tailwind class string, which is a tautology that fails on every legitimate restyle. |
| RED confirmed (test files exist) | Yes, 28/28 | Every test file named in the evidence tables exists in the tree. |
| GREEN confirmed (tests pass on execution) | Yes, 397/397 | Full npm test run, this session, exit 0. |
| Triangulation adequate | Yes | Multi-case coverage confirmed across the change (e.g. translate.test.ts 16 cases, VitoAvatar.test.tsx 8 cases across 4 stages times 2 locales, cosmeticCopy.test.ts 5 cases). |
| Safety net for modified files | Yes | Each batch evidence table shows a green pre-edit baseline (e.g. PR7 starts from 387/387, PR8 from 387/387) before its first edit. |

**TDD Compliance**: 6/6 checks passed

### Assertion Quality
Re-scanned the full authored/modified test surface across the change (i18n, storage/defaults,
preferencesStore, locale, hooks, bootstrap, App, routes, documentPreferences, ErrorBoundary,
cosmetics, cosmeticCopy, VitoAvatar) for tautologies, ghost loops, orphan empty-array assertions, and
smoke-only renders.

- Tautologies: none found.
- toEqual([]) assertions: paired with explicit prior-seed steps in the same test (reset/clear
  flows) - legitimate assert-cleared checks, not orphan empty checks.
- toBeInTheDocument() usage: consistently paired with getByRole(name: exact string) or
  getByText(exact string) - the query itself is the behavioral assertion.
- Ghost-loop check: the one loop-over-collection pattern found (cosmeticCopy.test.ts
  catalog-coverage guard) is preceded by an explicit toHaveLength(3) assertion, which prevents the
  loop from vacuously passing over an empty array - the same pattern the domain test
  (cosmetics.test.ts) uses for its own field-set assertion.
- Mock/assertion ratio: no vi.mock() usage found in the scanned files; all drive real
  store/router/fake-repository state.

**Assertion quality**: All assertions verify real behavior. 0 CRITICAL, 0 WARNING.

### Quality Metrics
**Linter**: No errors (oxlint, exit 0)
**Type Checker**: No errors (tsc -b, part of npm run build, exit 0)

### Out-of-Scope Boundary - Confirmed Held
- src/features/vito/copy/moodMessages.ts: confirmed untouched. git log --follow on the file shows
  only its original feature commit; no commit in this change history modifies it.
- No third locale: confirmed by grep - the only 'fr' reference in src/i18n/ is a rejection test
  case (isLocale('fr') returns false), not a supported locale.
- No live OS-theme-following after override: confirmed by grep - matchMedia is called exactly once
  (in defaults.ts, guarded), with zero addEventListener calls anywhere relevant to theme; there is
  no mechanism that could re-follow the OS after a manual choice.
- No third-party i18n library: confirmed absent from package.json - no react-i18next, no
  react-intl.

### Issues Found
**CRITICAL**: None.

**WARNING**:
1. Two light-mode gray-on-color contrast findings (HabitCard.tsx line 59, StreakBadge.tsx line 41)
   remain unfixed in light mode. Pre-existing, not introduced by this change, correctly out of this
   change dark:-pairing-only scope. See Standing Flag 2 - recommendation is archive-as-is with a
   follow-up flag, not a blocker.
2. The 375px mobile QA pass (task 8.2) was not exercised due to a browser-tooling limitation in the
   session that ran it, disclosed rather than silently claimed. See Standing Flag 4 - recommendation
   is archive-as-is with a follow-up flag, not a blocker.

**SUGGESTION**:
1. t() actual parameter order (locale, key, params?) differs from the spec illustrative
   t(key, locale) - cosmetic only, no scenario depends on argument order; worth a one-line spec
   correction if the spec is ever revised.
2. PR2 unconsumed src/app/__tests__/* oxlintrc i18n allowance (!../../i18n/*) could be swept in
   a future lint-hygiene pass if it remains unused after further changes - currently harmless, not
   worth a dedicated fix in this change. See Standing Flag 5.
3. The prior PARTIAL verify-report.md stale bootstrap-pollution flag (Standing Flag 1) should be
   treated as resolved going forward; no apply-progress.md batch after this verify should keep
   repeating it as an open item.

### Verdict
**PASS WITH WARNINGS**

All 46/46 tasks across PR1-PR8 (including PR7.5, added 2026-09-04) are complete and merged to
main. All 8/8 requirements and 15/15 spec scenarios across all 4 spec domains (i18n, dark-mode,
preferences-persistence, cosmetic-catalog-domain-decoupling) are compliant with real, passing
runtime test evidence, independently re-verified against the actual test files and re-run this
session (397/397 tests, 28 files). Build, lint, format, and the domain-coverage gate (100%) are all
green, re-run independently. Zero CRITICAL findings. The WARNINGS qualifier reflects two disclosed,
pre-existing, deliberately out-of-scope limitations (light-mode contrast findings predating this
change; the undone 375px viewport pass, a tooling limitation not a code defect) - neither is a
defect this change introduced or was asked to fix. All five standing flags carried forward through
apply-progress.md are resolved here: one (bootstrap pollution) is REFUTED and should not be repeated
as an open item; the other four are correctly classified as accepted limitations or resolved policy
questions, each with an explicit archive-as-is recommendation. The out-of-scope boundary (no
moodMessages.ts changes, no third locale, no live OS-theme-following, no third-party i18n library)
holds. This change is ready for sdd-archive.

## Key Learnings

1. The dispatcher stale-report mismatch (7 vs 8 requirements) traced to the prior partial verify
   deliberate exclusion of the cosmetic-catalog-domain-decoupling spec domain, not a miscount.
2. Re-running a flagged order-dependent test in isolation (bootstrap.test.ts) refuted the flag -
   nine apply batches had carried it forward without re-checking it against the actual hydration
   code path.
3. Built-stylesheet audits (checking that every dark: class name actually emits a CSS rule) caught
   real risks a static grep could not, such as dark:saturate-75 using a Tailwind v4-only bare value.
4. Git log trailer inspection confirmed a policy transition mid-change: PR1-PR6 commits carry a
   Claude-Session trailer, PR7.5 onward do not, matching the user own global no-AI-attribution rule.
5. Domain coverage staying byte-identical (100%, 123/123 statements) across PR5 through PR8 is
   direct evidence that the dark-mode and progress/vito sweeps touched zero files under
   src/domain/**.
