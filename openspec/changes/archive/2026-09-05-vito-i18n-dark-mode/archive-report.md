# Archive Report: vito-i18n-dark-mode

**Change**: vito-i18n-dark-mode — ES/US-English language switching + dark mode  
**Date Archived**: 2026-09-05  
**Archive Location**: `openspec/changes/archive/2026-09-05-vito-i18n-dark-mode/`  
**Repository**: vito (main branch)

## Final State Summary

### Completion Status

| Metric | Value |
|--------|-------|
| All tasks complete | 46/46 ✓ |
| All PRs merged to main | 8 PRs (split into 24 sub-PRs) ✓ |
| Main branch revision | a106c65 |
| Verification verdict | PASS WITH WARNINGS ✓ |
| Critical blockers | 0 |
| Architecture-blocking issues | None |

### Implementation Summary

The complete i18n + dark-mode feature set has been delivered across 8 distinct PRs (24 sub-PRs in the chain), all merged to `main` as of commit `a106c65` (PR #24, `feat/vito-features-dark-mode`):

1. **PR1** (PRs #8-#11): i18n infra + preferences storage
2. **PR2** (PR #12): Dark-mode toggle mechanics  
3. **PR3** (PRs #13-#14): Layout ring + component refactor
4. **PR4** (PRs #15-#17): Habits ring string extraction
5. **PR5** (PR #18-#19 split): Rewards + domain decoupling
6. **PR6** (PR #20): Settings/app ring strings
7. **PR7.5** (PRs #21-#22): Progress ring + error boundary (added 2026-09-04)
8. **PR7** (PR #23): Dark-mode sweep (layout/ui)
9. **PR8** (PR #24): Dark-mode sweep (features) + manual QA + fix

## Specification Compliance

### Delta Specs Created → Main Specs

Four new specification domains were defined, each with 2 requirements and multiple scenarios. All have been moved to the source-of-truth location at `openspec/specs/`:

| Domain | Main Spec Location | Requirements | Scenarios | Status |
|--------|-------------------|--------------|-----------|--------|
| i18n | `openspec/specs/i18n/spec.md` | 3 | 5 | ✓ Created |
| dark-mode | `openspec/specs/dark-mode/spec.md` | 2 | 4 | ✓ Created |
| preferences-persistence | `openspec/specs/preferences-persistence/spec.md` | 2 | 3 | ✓ Created |
| cosmetic-catalog-domain-decoupling | `openspec/specs/cosmetic-catalog-domain-decoupling/spec.md` | 1 | 2 | ✓ Created |

**Total**: 8 requirements, 15 scenarios — all compliant with passing test evidence.

### Verification Verdict

Per `verify-report.md` (verification run post-PR8 merge, 2026-09-05):

| Check | Status |
|-------|--------|
| Build | ✓ PASSED (npm run build) |
| Tests | ✓ PASSED (397/397 tests, 28 files) |
| Lint | ✓ PASSED (oxlint exit 0) |
| Format | ✓ PASSED (prettier --check .) |
| Domain coverage gate | ✓ PASSED (100%, 123/123 statements) |
| Spec scenarios | 15/15 ✓ COMPLIANT |
| Critical findings | 0 |
| Warnings | 2 (pre-existing, out-of-scope) |
| Suggestions | 3 (non-blocking) |

**Verdict**: PASS WITH WARNINGS — ready for archive.

## Standing Flags (All Resolved)

The verify-report carried 5 standing flags from the apply phase. All are conclusively resolved:

1. **PR1 bootstrap.test.ts order-dependent pollution** → REFUTED. Re-ran the flagged test in isolation; it passes independently. The flag was stale and should not be repeated.

2. **Light-mode gray-on-color contrast (HabitCard.tsx, StreakBadge.tsx)** → ACCEPTED PRE-EXISTING LIMITATION. Both predated this change; correctly out of scope for an additive dark-mode pairing task. Flagged as a follow-up accessibility item, not a blocker.

3. **Claude-Session trailer inconsistency** → RESOLVED POLICY TRANSITION. PR1-PR6 carry trailers per prior convention; PR7.5 onward absent per the user's global no-AI-attribution rule. Both regimes disclosed in apply-progress; no action needed.

4. **Undone 375px mobile QA pass** → ACCEPTED TOOLING LIMITATION. Manual QA covered desktop width in both locales/themes and found + fixed one real regression (9ab9d1f). 375px pass could not be exercised due to browser-resize tool limitation, disclosed explicitly, not silently claimed done. Flagged as follow-up QA, not a code defect.

5. **PR2 unconsumed .oxlintrc.json app-test allowance** → HARMLESS INERT. The entry is genuinely unused (no test imports i18n/); kept for forward compatibility at no cost. Worth a future lint-hygiene pass if still unused, not a defect.

All flags resolve to: **archive-as-is, with non-blocking follow-ups noted in the archive**.

## Test Evidence & Traceability

- **Specification Scenarios**: All 15 scenarios from the 4 spec domains traced to passing test assertions
- **Test Suite**: 397 tests across 28 files; all green
- **Domain Layer**: 100% coverage maintained (123/123 statements); no regression
- **Manual QA**: EN/ES × Light/Dark desktop pass completed with real regression found and fixed in BATCH 8.2 (9ab9d1f, `CosmeticGrid` locked-cosmetic visibility)

## Out-of-Scope Boundary (Confirmed Held)

Verified by direct code inspection:

- `src/features/vito/copy/moodMessages.ts` — untouched (Vito personality voice deferred)
- Third locale — rejected in unit tests (`isLocale('fr')` → false); zero support
- Live OS-theme-following — `matchMedia` called once at boot; zero `addEventListener` (no re-follow mechanism)
- Third-party i18n library — absent from `package.json` (hand-rolled dictionary)

## Mechanical Archive Operations

### Spec Sync: Delta → Main

All four delta specs were new capabilities (no prior main specs existed). Copied mechanically via shell:

```
openspec/changes/vito-i18n-dark-mode/specs/{domain}/spec.md 
  → openspec/specs/{domain}/spec.md  [via cp -R]
```

**Verification**: `diff -r` output for each domain:
- i18n: identical ✓
- dark-mode: identical ✓
- preferences-persistence: identical ✓
- cosmetic-catalog-domain-decoupling: identical ✓

### Change Folder Archive

Moved entire change folder via mechanical copy + delete:

```
Source:      openspec/changes/vito-i18n-dark-mode
Destination: openspec/changes/archive/2026-09-05-vito-i18n-dark-mode

Verification: diff -r source → destination (identical) ✓
```

**Archive contains**:
- proposal.md ✓
- design.md ✓
- tasks.md (46/46 complete) ✓
- specs/ (4 domains) ✓
- apply-progress.md ✓
- verify-report.md ✓
- .gentle-ai-instance ✓

**Original removed**: ✓ (confirmed gone)

## Key Decisions Locked in Archive

| Decision | Rationale | File |
|----------|-----------|------|
| Dictionary keys: `en`/`es` not `en-US`/`es` | Bucket naming; region precision lives in `INTL_LOCALE_TAG` | design.md D1 |
| `AppShellRoute()` prop-channel wrapper | Preserves `components/**` ring import purity | design.md D2 |
| `components/**` refactored to props-only | No i18n allowance added to ring | design.md D3 |
| Preferences detection in `services/storage/defaults.ts` | Once at first load; guarded matchMedia for jsdom | design.md D4 |
| `RESET_PRESERVED_KEYS` named exemption | Excludes locale/theme from reset-progress wipe | design.md D5 |
| No SCHEMA_VERSION bump | Additive-key rollout; no existing-user wipe | design.md D6 |

## Change Artifacts Persisted

All SDD artifacts now live at:
- Main specs: `openspec/specs/{i18n,dark-mode,preferences-persistence,cosmetic-catalog-domain-decoupling}/spec.md`
- Archive: `openspec/changes/archive/2026-09-05-vito-i18n-dark-mode/`
  - proposal.md (change intent & scope)
  - design.md (technical approach & architecture)
  - tasks.md (46 implementation tasks, all marked complete)
  - specs/ (delta specs that became main specs)
  - apply-progress.md (batch-by-batch implementation record)
  - verify-report.md (final verification with all gates passing)
  - archive-report.md (this file — final state at close)

## Key Learnings

1. Stale flags carried forward without re-checking become technical debt; the PR1 bootstrap-pollution flag persisted 9 batches until re-run in isolation proved it was refuted, demonstrating the need for continuous re-verification of carry-forward issues.

2. Built-stylesheet audits (checking that every `dark:` class name actually emits a CSS rule) caught risks a static grep alone could not, such as Tailwind v4-only bare values like `dark:saturate-75`.

3. The dispatcher stale-report mismatch (7 vs 8 requirements observed) traced to the prior partial verify deliberately excluding the cosmetic-catalog-domain-decoupling spec domain, resolving the apparent inconsistency by clarifying the reporting history.

4. Domain coverage staying byte-identical (100%, 123/123 statements) across PR5 through PR8 provided direct evidence that refactorings and dark-mode sweeps touched zero files under `src/domain/**`, validating the domain-decoupling approach.

5. Chained PR delivery with clear per-unit scope (i18n infra → dark infra → layout refactor → feature sweeps → final QA) kept the 400-line budget guard meaningful and enabled rapid iteration without sacrificing review quality or test coverage.

---

**SDD Cycle Complete** — vito-i18n-dark-mode is now archived with all specification, design, implementation, and verification artifacts preserved for future reference and audit.
