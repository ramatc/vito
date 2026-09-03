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
  'common.xp': '{count} XP',
  'common.xpGain': '+{count} XP',
  'common.error.save': "Couldn't save that, try again.",

  'settings.language.label': 'Language',
  'settings.theme.label': 'Theme',
  'settings.theme.light': 'Light',
  'settings.theme.dark': 'Dark',

  'habits.title': 'Habits',
  'habits.description':
    'Everything you are building. Archived habits keep their history.',
  'habits.new': 'New',
  'habits.empty.title': 'No habits yet',
  'habits.empty.description': 'Start with one small thing you can do today.',
  'habits.empty.action': 'Add your first habit',
  'habits.archive.title': 'Archive this habit?',
  'habits.archive.message':
    '"{name}" moves out of your list from today on. Everything it has already earned stays exactly as it is.',
  'habits.archive.confirm': 'Archive',

  'habits.card.edit': 'Edit {name}',
  'habits.card.archive': 'Archive {name}',
  'habits.card.complete': 'Complete {name}',
  'habits.card.uncheck': 'Uncheck {name}',

  'habits.today.label': "Today's habits",
  'habits.today.progress': '{completed} of {scheduled} done today',
  'habits.today.allDone': 'That is everything for today. Vito is delighted.',
  'habits.today.restTitle': 'Nothing scheduled today',
  'habits.today.restDescription': 'Vito is taking it easy. Ready whenever you are.',
  'habits.today.emptyDescription':
    'Add your first one and Vito will start growing with you.',
  'habits.today.goToHabits': 'Go to habits',

  'habits.form.newTitle': 'New habit',
  'habits.form.editTitle': 'Edit habit',
  'habits.form.editDescription':
    'Changes apply from today on. Past completions keep the XP they earned.',
  'habits.form.name': 'Name',
  'habits.form.namePlaceholder': 'Drink water',
  'habits.form.nameError': 'Give your habit a name to save it.',
  'habits.form.icon': 'Icon',
  'habits.form.category': 'Category',
  'habits.form.repeats': 'Repeats',
  'habits.form.daysError':
    'Pick at least one day — a habit with no days would never come up.',
  'habits.form.difficulty': 'Difficulty',
  'habits.form.create': 'Add habit',
  'habits.form.save': 'Save changes',

  'habits.frequency.daily': 'Every day',
  'habits.frequency.weekdays': 'Certain days',

  'habits.difficulty.easy': 'Easy',
  'habits.difficulty.normal': 'Normal',
  'habits.difficulty.hard': 'Hard',

  'habits.category.health': 'Health',
  'habits.category.movement': 'Movement',
  'habits.category.mind': 'Mind',
  'habits.category.learning': 'Learning',
  'habits.category.home': 'Home',
  'habits.category.work': 'Work',
  'habits.category.connection': 'Connection',

  'habits.icon.sparkles': 'Sparkles',
  'habits.icon.droplet': 'Water',
  'habits.icon.apple': 'Food',
  'habits.icon.coffee': 'Coffee',
  'habits.icon.dumbbell': 'Strength',
  'habits.icon.footprints': 'Walk',
  'habits.icon.bike': 'Cycle',
  'habits.icon.bookOpen': 'Reading',
  'habits.icon.penLine': 'Writing',
  'habits.icon.brain': 'Focus',
  'habits.icon.music': 'Music',
  'habits.icon.leaf': 'Nature',
  'habits.icon.heart': 'Care',
  'habits.icon.moon': 'Sleep',
  'habits.icon.sun': 'Morning',
  'habits.icon.target': 'Goal',

  'habits.toast.levelUp': '{xp} — level {level}! Vito is growing.',
  'habits.toast.unlock': '{xp} — something new is waiting in the closet.',
  'habits.toast.comeback': '{xp} — welcome back bonus.',
  'habits.toast.undo': 'Unchecked for today.',

  'progress.streak.best.one': 'Best so far: {count} day',
  'progress.streak.best.other': 'Best so far: {count} days',
} as const satisfies Record<string, string>
