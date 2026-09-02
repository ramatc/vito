/**
 * The English dictionary, and the source of truth for the key union.
 *
 * `as const satisfies Record<string, string>` is doing two jobs at once: the
 * `satisfies` half rejects a non-string value at the point of the typo, and the
 * `as const` half keeps every key literal so `keyof typeof EN` can become the
 * `TranslationKey` union in `keys.ts`. Widening this to `Dictionary` would make
 * the union circular and lose the compile-time key checking everywhere.
 *
 * Keys are dot-namespaced by the surface that renders them, not by feature
 * directory, so a string that moves between components keeps its name.
 * Placeholders are `{named}` — never positional, because a translator
 * reordering a sentence must not have to track argument order.
 */
export const EN = {
  'app.wordmark': 'Vito',

  'nav.today': 'Today',
  'nav.habits': 'Habits',
  'nav.closet': 'Closet',
  'nav.settings': 'Settings',
  'nav.sidebar': 'Primary sidebar',
  'nav.bottom': 'Primary',

  'home.title': 'Today',
  'home.description': 'One at a time. Vito grows with every one.',

  'common.close': 'Close',
  'common.cancel': 'Cancel',
  'common.confirm': 'Confirm',
  'common.dismiss': 'Dismiss',

  'settings.language.label': 'Language',
  'settings.theme.label': 'Theme',
  'settings.theme.light': 'Light',
  'settings.theme.dark': 'Dark',

  'habits.today.progress': '{completed} of {scheduled} done today',

  'progress.streak.best.one': 'Best so far: {count} day',
  'progress.streak.best.other': 'Best so far: {count} days',
} as const satisfies Record<string, string>
