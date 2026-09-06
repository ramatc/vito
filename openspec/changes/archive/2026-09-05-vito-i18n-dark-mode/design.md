# Design: vito-i18n-dark-mode

> Size note: over the 800-word design budget by design. The phase brief required exact
> signatures, exact file layout, and every affected `.oxlintrc.json` override block.
> Same precedent as `sdd/vito/design`.

Builds on proposal #418 and exploration #411. Codebase read: `.oxlintrc.json` (all 18 override
blocks), `bootstrap.ts`, `routes.tsx`, `App.tsx`, `main.tsx`, `repositories.ts`,
`localStorageClient.ts`, `localVitoRepository.ts`, `vitoStore.ts`, `defaults.ts`,
`types/models.ts`, `index.css`, `index.html`, `AppShell.tsx`, `navItems.ts`,
`cosmeticCatalog.ts`, `SettingsScreen.tsx`.

## Technical Approach

The locale is a **persisted value in a store**, not a context. Everything above `components/`
(`features/`, `hooks/`, `app/`) reads it from `preferencesStore` and calls a pure `t()`.
`components/` stays string-dumb and receives resolved strings as props. That single split is
what makes a hand-rolled dictionary strictly better than `react-i18next` here — the ring rule
`components/*/*` already forbids arbitrary hooks, and prop injection is only needed for the one
ring that was already props-only by contract.

Dark mode is a `dark` class on `<html>`, written from the `app/` ring by one helper called at
two moments: once in `bootstrap()` before the first React paint, and on every preference change
from an effect in `App.tsx`.

## Architecture Decisions

### Decision 1 — Dictionary key naming: bare `en` | `es` (RESOLVES proposal open item 1)

| Option | Tradeoff | Decision |
|---|---|---|
| `en-US` / `es` | Symmetric future for `en-GB`; asymmetric today (`es-ES` would be *wrong* — this project's Spanish is Rioplatense, not peninsular) | Rejected |
| `en` / `es` + separate Intl tag map | Key names a language bucket, not a region; regional precision lives where it actually matters | **Chosen** |

**Choice**: `export type Locale = 'en' | 'es'`, dictionaries `src/i18n/en.ts` / `src/i18n/es.ts`,
plus `export const INTL_LOCALE_TAG: Record<Locale, string> = { en: 'en-US', es: 'es' }` used only
for `Intl.DateTimeFormat` (weekday names in `frequency.ts`) and `<html lang>`.

**Rationale**: the dictionary key names a *bucket*, and this cycle has exactly two; region
precision is a formatting concern, not a lookup concern, so it belongs in the Intl tag map. A
future `en-GB` is a new key plus a normalize in a parse function that already validates and falls
back — not a migration.

### Decision 2 — AppShell prop channel: yes, `AppShellRoute()` (RESOLVES proposal open item 2)

| Option | Tradeoff | Decision |
|---|---|---|
| `AppShell` reads the store | Breaks `components/*/*` ("a component that needs those is a feature container") | Rejected |
| Allow `i18n/` into `components/**` | Cheapest diff, but re-opens the ring for the next "just one import" | Rejected — see D3 |
| `AppShellRoute()` wrapper in `app/routes.tsx` | One wrapper, extends the existing `SettingsRoute` precedent verbatim | **Chosen** |

**Rationale**: `<Route element={<AppShell />}>` has no prop channel, and `SettingsRoute` already
establishes route-level capability injection for exactly this reason. `app/*` cannot import
`lucide-react` (verified: its allowlist has react / react-dom / react-router-dom / framer-motion
only), so **icons stay in `navItems.ts` and only labels flow as props**.

### Decision 3 — `components/**` gets NO i18n allowance (refinement of the proposal)

The proposal listed `components/**` in the oxlintrc changes; its own risk section offered the
alternative ("or a refactor forcing props-only defaults"). Design picks the refactor.

**Choice**: 4 files lose their embedded copy instead — `Modal.tsx` (`closeLabel` required),
`ConfirmDialog.tsx` (`confirmLabel`/`cancelLabel` lose their defaults), `Toaster.tsx`
(`dismissLabel` required), `navItems.ts` (`label` → `labelKey`, labels arrive as a
`navLabels` prop forwarded by `AppShell` to `BottomTabBar`).

**Rationale**: 2 fewer override blocks, a smaller reviewed config diff, and the presentational
ring's stated invariant survives intact. Cost is ~3 call sites gaining explicit label props.
**This is a deliberate delta from the proposal's In-scope bullet — flagged for spec/tasks.**

### Decision 4 — Preference detection lives in `services/storage/defaults.ts`

`createDefaultPreferences()` reads `navigator.language` and `matchMedia('(prefers-color-scheme: dark)')`.
That file is already documented as "what a brand new profile looks like, and what a corrupt save
falls back to", which is exactly the once-at-first-load semantics #414 asked for. **Gotcha**:
guard `matchMedia` — jsdom does not implement it, so an unguarded call breaks every existing test.

### Decision 5 — `resetAll()` exclusion via a named preserved-keys list

`clearAll()` loops `Object.values(STORAGE_KEYS)`. Add `preferences: 'vito:v1:preferences'` to
`STORAGE_KEYS` (so the owned-key inventory stays complete) and add
`const RESET_PRESERVED_KEYS: readonly StorageKey[] = [STORAGE_KEYS.preferences]`, skipped by
`clearAll()`. One named, commented exemption beats an incomplete key list.

### Decision 6 — Do NOT bump `SCHEMA_VERSION`

`preferences` is additive and its absence *is* the first-run path. Bumping to 2 makes
`ensureSchemaVersion()` call `clearAll()` and wipe every existing user's habits. `CosmeticItem.name`
removal is a type change only — `VitoState` persists ids, never names.

## Data Flow

    main.tsx  bootstrap()
      ├ setRepositories(createRepositories())            // + preferences
      ├ hydrateStores()  ─→ preferencesStore.load()
      │                       └→ PreferencesRepository.get()
      │                            └→ read(KEYS.preferences, parse, createDefaultPreferences())
      │                                 └→ navigator.language / matchMedia   [first run only]
      └ applyDocumentPreferences(prefs)   // <html class="dark" lang="es">, theme-color meta
    → createRoot().render(<App/>)                         // no FOUC: sync localStorage, pre-paint

    toggle:  SettingsScreen ─→ preferencesStore.setLocale|setTheme
                                 ├ set({preferences})  ─→ every subscriber re-renders
                                 └ PreferencesRepository.save()
             App.tsx useEffect([preferences]) ─→ applyDocumentPreferences()

    strings: features/* + hooks/*  ─→ useTranslate()  ─→ t(locale, key, params)
             app/routes.tsx        ─→ AppShellRoute ─→ <AppShell navLabels> ─→ BottomTabBar

## New Files and Signatures

`src/i18n/` is **FLAT** (no `locales/` subdirectory — the proposal's illustrative layout).
The ring rule models depth explicitly; a flat ring needs one override block, a nested one needs two.

```ts
// src/types/models.ts  (additions — leaf ring, "if it is persisted, it lives here")
export type Locale = 'en' | 'es'
export type Theme = 'light' | 'dark'
export interface AppPreferences { locale: Locale; theme: Theme }
// CosmeticItem: `name` REMOVED

// src/i18n/en.ts   — source of truth for the key union
export const EN = { 'nav.today': 'Today', /* … */ } as const satisfies Record<string, string>

// src/i18n/keys.ts
import { EN } from './en'
export type TranslationKey = keyof typeof EN
export type Dictionary = Record<TranslationKey, string>   // es.ts: missing key = compile error

// src/i18n/es.ts
export const ES: Dictionary = { /* … */ }

// src/i18n/locale.ts
export const INTL_LOCALE_TAG: Record<Locale, string> = { en: 'en-US', es: 'es' }
export function isLocale(value: unknown): value is Locale

// src/i18n/translate.ts
export type TranslationParams = Record<string, string | number>
export function t(locale: Locale, key: TranslationKey, params?: TranslationParams): string
export function tDynamic(locale: Locale, key: string, params?: TranslationParams): string
export function tCount(
  locale: Locale,
  forms: { one: TranslationKey; other: TranslationKey },
  count: number,
  params?: TranslationParams,
): string
```

`t()` interpolates `{name}` placeholders. Static keys are compile-checked, so `tDynamic` exists
only for the cosmetic-id lookup and falls back `ES[key] ?? EN[key] ?? key`. `tCount` is two-form
only — en and es cardinals have exactly `one`/`other`, so `Intl.PluralRules` buys nothing.

```ts
// src/services/storage/repositories.ts
export interface PreferencesRepository {
  get(): Promise<AppPreferences>
  save(preferences: AppPreferences): Promise<void>
}
export interface Repositories { /* … */ preferences: PreferencesRepository }

// src/services/storage/localPreferencesRepository.ts
export function createLocalPreferencesRepository(): PreferencesRepository
// parse: unknown locale/theme → that field falls back to the detected default, not the whole object

// src/services/storage/defaults.ts
export function createDefaultPreferences(): AppPreferences

// src/stores/preferencesStore.ts
export interface PreferencesStore {
  preferences: AppPreferences
  status: StoreStatus
  load(): Promise<void>
  setLocale(locale: Locale): Promise<void>
  setTheme(theme: Theme): Promise<void>
}
// NO reset() — deliberately. The absence is what enforces "reset never touches preferences".

// src/hooks/useTranslate.ts
export function useTranslate(): (key: TranslationKey, params?: TranslationParams) => string

// src/app/documentPreferences.ts
export function applyDocumentPreferences(preferences: AppPreferences): void
// html.lang = INTL_LOCALE_TAG[locale]; html.classList.toggle('dark', …); theme-color meta

// src/components/layout/navItems.ts   (modified)
export type NavLabelKey = 'today' | 'habits' | 'closet' | 'settings'
export interface NavItem { to: string; labelKey: NavLabelKey; Icon: …; end?: boolean }

// src/components/layout/AppShell.tsx  (modified)
export interface AppShellProps {
  navLabels: Record<NavLabelKey, string>
  wordmark: string
  sidebarNavLabel: string
  bottomNavLabel: string
}

// src/features/rewards/cosmeticCopy.ts   (new — display names leave domain/)
export const COSMETIC_NAME_KEYS: Record<string, TranslationKey>   // id → 'cosmetic.hatSprout.name'
export function cosmeticName(locale: Locale, id: string): string  // unknown id tolerated
```

## CSS (`src/index.css`)

```css
@import 'tailwindcss';
@custom-variant dark (&:where(.dark, .dark *));

:root { color-scheme: light; --surface: …; --surface-raised: …; --text-primary: …; --text-muted: …; --brand: … }
.dark { color-scheme: dark;  --surface: …; --surface-raised: …; --text-primary: …; --text-muted: …; --brand: … }

@theme inline {              /* inline → utilities resolve var() at runtime, not build time */
  --color-surface: var(--surface);
  --color-text-primary: var(--text-primary);
  /* … 4-5 seeded tokens only */
}
```

Five seeded tokens, not a token rewrite. Everything else uses additive `dark:` pairing so the
~28-file sweep stays incremental. `color-scheme` makes native scrollbars and form controls follow.

## `.oxlintrc.json` — every affected block

**2 NEW blocks**

| Glob | Allowlist |
|---|---|
| `src/i18n/*` | `["*","**","!./*","!../types/*"]` — leaf ring: pure dictionaries and a pure `t()`. No React, no stores. |
| `src/i18n/__tests__/*.test.ts` | `["*","**","!../*","!../../types/*","!vitest"]` |

**7 MODIFIED blocks** (add one entry each)

| Glob | Add |
|---|---|
| `src/hooks/*` | `"!../i18n/*"` |
| `src/hooks/__tests__/*.test.ts` | `"!../../i18n/*"` |
| `src/features/*/*` | `"!../../i18n/*"` |
| `src/features/*/*/*` | `"!../../../i18n/*"` |
| `src/features/*/*/__tests__/*.test.ts(x)` | `"!../../../../i18n/*"` |
| `src/app/*` | `"!../i18n/*"` |
| `src/app/__tests__/*.test.ts(x)` | `"!../../i18n/*"` |

**9 blocks deliberately UNCHANGED**: `src/domain/**`, `src/domain/*`, `src/domain/*/*`,
`src/domain/*/__tests__/*` (domain stays pure — names move out); `src/types/**` (imports nothing);
`src/services/storage/*` + its test block (needs only `types/` + siblings, already allowed);
`src/stores/*` + its test block (needs `types/` + `services/storage/repositories` + `zustand`,
already allowed); `src/components/**` and `src/components/*/*` (Decision 3); `src/features/**`
depth guard.

Land as ONE reviewed config commit in the infra slice, before any consuming import exists.

## File Changes

| File | Action | Description |
|---|---|---|
| `src/i18n/en.ts`, `es.ts`, `keys.ts`, `locale.ts`, `translate.ts` | Create | The i18n ring |
| `src/services/storage/localPreferencesRepository.ts` | Create | Mirrors `localVitoRepository` |
| `src/stores/preferencesStore.ts` | Create | Mirrors `vitoStore`, minus `reset()` |
| `src/hooks/useTranslate.ts` | Create | Store-bound `t` for `features/` |
| `src/app/documentPreferences.ts` | Create | The only writer of `<html>` class/lang/theme-color |
| `src/features/rewards/cosmeticCopy.ts` | Create | id → name key, out of `domain/` |
| `src/features/settings/LanguageToggle.tsx`, `ThemeToggle.tsx` | Create | Settings controls |
| `.oxlintrc.json` | Modify | 2 new + 7 modified blocks |
| `src/types/models.ts` | Modify | `+Locale/Theme/AppPreferences`, `-CosmeticItem.name` |
| `src/services/storage/repositories.ts` | Modify | `+PreferencesRepository`, wire into `createRepositories()` |
| `src/services/storage/localStorageClient.ts` | Modify | `+preferences` key, `RESET_PRESERVED_KEYS` |
| `src/services/storage/defaults.ts` | Modify | `+createDefaultPreferences()` |
| `src/app/bootstrap.ts` | Modify | `+preferences` in `hydrateStores()`, apply doc prefs |
| `src/app/App.tsx` | Modify | Effect syncing document to preferences |
| `src/app/routes.tsx` | Modify | `+AppShellRoute()`, translated `HomeRoute` copy |
| `src/index.css` | Modify | `@custom-variant dark`, 5 seeded tokens, `color-scheme` |
| `src/domain/vito/cosmeticCatalog.ts` | Modify | Drop `name` |
| `src/components/layout/{AppShell,BottomTabBar,navItems}` | Modify | `labelKey` + label props |
| `src/components/ui/{Modal,ConfirmDialog,Toaster}.tsx` | Modify | Copy defaults become required props |
| ~28 files (`features/**`, `hooks/useCompleteHabit`) | Modify | String extraction + `dark:` pairing sweep |
| `index.html` | Modify | Nothing structural — `lang`/`theme-color` are written by JS |

## Testing Strategy

| Layer | What | How |
|---|---|---|
| Compile | Dictionary parity ES↔EN | `Dictionary = Record<TranslationKey, string>` — a missing key fails `tsc -b`, no test needed |
| Unit | `t` interpolation, `tDynamic` fallback chain, `tCount` en+es | `src/i18n/__tests__/translate.test.ts`, pure |
| Unit | Preferences round-trip, corrupt value → per-field default, `clearAll()` preserves the key | Extend `services/storage/__tests__/localRepositories.test.ts` |
| Unit | `setLocale`/`setTheme` persist | `stores/__tests__/preferencesStore.test.ts` with the existing fake-repo pattern |
| Integration | Bootstrap applies `.dark` + `lang`; `resetAllData()` KEEPS locale/theme | `app/__tests__/bootstrap.test.ts` |
| Component | `AppShellRoute` passes translated nav labels; toggling locale re-renders nav in ES | `app/__tests__/routes.test.tsx` |

Strict TDD applies to `i18n/translate.ts`, the repository, and the store (real behaviour, RED
first). The string/color sweep files are mechanical substitution — existing tests asserting on
English copy are updated with them, not driven test-first. The `src/domain/**` 100% coverage gate
is unaffected: this change only *removes* data from domain.

## Migration / Rollout

No data migration. `SCHEMA_VERSION` stays `1` (Decision 6). Existing users get detected
preferences on their next load because the key is absent, which is the first-run path.

## Open Questions

- [ ] `@theme inline` vs `@theme` for runtime-switchable tokens: exploration #411 warned against
      `inline`, but `inline` is the documented v4 pattern when a theme value references another
      custom property. Verify against the BUILT stylesheet in the dark-mode-infra slice. Risk is
      contained — the sweep uses additive `dark:` pairing, so the token layer is an optimization
      for 5 colors, not a dependency.
- [ ] Pre-JS paint: no inline `index.html` script, to keep "`localStorageClient` is the only place
      that touches localStorage" intact. `bootstrap()` is synchronous and runs before
      `createRoot().render()`, so `.dark` lands before the first React paint; only a user who
      explicitly chose the opposite of their OS can see a sub-frame background mismatch. Accepted.
- [ ] If the sweep adds a test at `src/features/<feature>/__tests__/`, that path currently falls
      under `src/features/*/*/*`, which allows neither Testing Library nor `vitest` — a new
      `src/features/*/__tests__/*.test.ts(x)` block would be needed. Not added preemptively.
- [ ] Vito avatar/cosmetic dark treatment — already deferred by the proposal to a mechanical pass;
      re-raise with the user if it looks poor.

