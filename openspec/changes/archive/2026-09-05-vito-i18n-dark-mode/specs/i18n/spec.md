# Spec: vito-i18n-dark-mode

New capabilities — no prior specs exist for i18n, dark mode, or preferences persistence. Full specs below, grouped by domain. Derived strictly from approved proposal (engram #418); no design-phase assumptions.

## Domain: i18n (`src/i18n/`)

### Requirement: Locale Dictionary and Translation Function
The system MUST provide a pure `t(key, locale)` function resolving functional UI strings for exactly two supported locales: `es` and `en-US`. The system MUST NOT support any other locale.

#### Scenario: Known key resolves in active locale
- GIVEN a dictionary key exists in both locale files
- WHEN `t(key, locale)` is called with `locale = "es"`
- THEN the Spanish string is returned

#### Scenario: Unsupported locale value is rejected
- GIVEN a locale value other than `es` or `en-US`
- WHEN preference resolution encounters that value
- THEN the system MUST fall back to `en-US`, not throw or render a blank string

### Requirement: Initial Locale Detection
The system MUST detect the initial locale once, at first load, from `navigator.language`.

#### Scenario: Browser reports Spanish
- GIVEN no persisted locale preference exists yet
- WHEN `navigator.language` starts with `es`
- THEN the app initializes with locale `es`

#### Scenario: Browser reports a non-Spanish language
- GIVEN no persisted locale preference exists yet
- WHEN `navigator.language` does not start with `es`
- THEN the app initializes with locale `en-US`

### Requirement: Manual Locale Override
The Settings screen MUST allow the user to switch locale manually. Once set, the override MUST persist and MUST take precedence over browser detection on every subsequent load.

#### Scenario: User switches language in Settings
- GIVEN the app is running in one locale
- WHEN the user selects the other locale in Settings
- THEN all functional UI strings re-render in the new locale immediately

#### Scenario: Reload after manual override
- GIVEN the user has manually set a locale
- WHEN the app reloads
- THEN the persisted locale is used, and browser detection MUST NOT override it

