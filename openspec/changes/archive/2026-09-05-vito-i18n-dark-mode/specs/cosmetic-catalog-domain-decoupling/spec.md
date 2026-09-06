# Spec: vito-i18n-dark-mode

New capabilities — no prior specs exist for i18n, dark mode, or preferences persistence. Full specs below, grouped by domain. Derived strictly from approved proposal (engram #418); no design-phase assumptions.

## Domain: Cosmetic Catalog Domain Decoupling

### Requirement: Cosmetic Catalog Stays Import-Pure
`domain/vito/cosmeticCatalog.ts` MUST NOT embed display-name strings. Domain data MUST expose only stable `id`s; human-readable names MUST live in an id-keyed lookup outside `domain/` (e.g. `features/rewards/` or `i18n/`).

#### Scenario: Rendering a cosmetic item's name
- GIVEN a cosmetic item with a given `id`
- WHEN the UI needs to display its name
- THEN the name is resolved via the external id-keyed lookup, never read from `domain/`

#### Scenario: Locale switch updates cosmetic names
- GIVEN the user switches locale
- WHEN cosmetic items are re-rendered
- THEN their displayed names update to the new locale without any change to `cosmeticCatalog.ts` data

## Out of scope (explicitly not covered by these requirements, per proposal)
- Third locale support, live OS-theme-following after override, `moodMessages.ts` coverage, and any 3rd-party i18n library are explicitly excluded — not partial requirements, fully out of scope.

