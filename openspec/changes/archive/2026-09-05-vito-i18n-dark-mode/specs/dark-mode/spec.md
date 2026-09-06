# Spec: vito-i18n-dark-mode

New capabilities — no prior specs exist for i18n, dark mode, or preferences persistence. Full specs below, grouped by domain. Derived strictly from approved proposal (engram #418); no design-phase assumptions.

## Domain: Dark Mode

### Requirement: Initial Theme Detection
The system MUST detect the initial theme once, at first load, from `prefers-color-scheme`.

#### Scenario: OS reports dark
- GIVEN no persisted theme preference exists yet
- WHEN `prefers-color-scheme: dark` matches
- THEN the app initializes with the dark theme (`dark` class applied)

#### Scenario: OS reports light
- GIVEN no persisted theme preference exists yet
- WHEN `prefers-color-scheme: dark` does not match
- THEN the app initializes with the light theme

### Requirement: Manual Theme Override Is OS-Independent
The Settings screen MUST allow toggling between light and dark. Once the user has toggled it, the system MUST NOT live-follow subsequent OS theme changes; the persisted user choice governs until changed again in Settings.

#### Scenario: User toggles theme
- GIVEN the app is running in one theme
- WHEN the user toggles the theme in Settings
- THEN the `dark` class updates on `<html>` and the choice is persisted

#### Scenario: OS theme changes after a manual override
- GIVEN the user has manually set a theme
- WHEN the OS-level `prefers-color-scheme` subsequently changes
- THEN the app's rendered theme MUST remain the user's persisted choice, unchanged

