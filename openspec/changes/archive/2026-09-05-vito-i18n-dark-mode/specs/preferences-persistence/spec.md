# Spec: vito-i18n-dark-mode

New capabilities — no prior specs exist for i18n, dark mode, or preferences persistence. Full specs below, grouped by domain. Derived strictly from approved proposal (engram #418); no design-phase assumptions.

## Domain: Preferences Persistence (`preferencesStore` / `PreferencesRepository`)

### Requirement: Preferences Persistence Contract
The system MUST persist `{ locale, theme }` via a `PreferencesRepository` following the existing repository pattern (`HabitRepository`/`ProgressRepository`/`VitoRepository`), hydrated in `bootstrap.ts` alongside the existing stores.

#### Scenario: Reload restores persisted preferences
- GIVEN locale and theme were previously set and persisted
- WHEN the app reloads
- THEN `preferencesStore` hydrates from `PreferencesRepository` before rendering, without re-running detection

#### Scenario: First run has no stored preferences
- GIVEN no preferences have ever been persisted
- WHEN the app boots
- THEN the store MUST fall back to the detected initial locale/theme, and MUST NOT error

### Requirement: Exclusion from Reset Progress
`resetAll()` MUST NOT clear `locale` or `theme`. It clears habit, history, and Vito progress data only.

#### Scenario: User resets progress
- GIVEN habits, completions, and Vito progress exist, and the user has set locale/theme preferences
- WHEN the user triggers "Reset progress"
- THEN habit/history/Vito data is cleared, AND locale and theme remain exactly as they were

