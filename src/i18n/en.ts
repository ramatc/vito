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
  // Rendered above the routes, so it survives navigation. It names the likely
  // cause as well as the symptom, because "might not be saving" on its own
  // leaves nothing to do about it.
  'app.storageError':
    "Vito can't save to this browser right now, so today's progress might not be kept. Check that site data is allowed and that storage isn't full.",
  'app.error.title': 'Something went wrong.',
  'app.error.hint': 'Try reloading the page.',

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
  'common.and': 'and',
  'common.error.save': "Couldn't save that, try again.",

  'settings.language.label': 'Language',
  'settings.theme.label': 'Theme',
  'settings.theme.light': 'Light',
  'settings.theme.dark': 'Dark',

  'settings.title': 'Settings',
  'settings.description': 'Your data stays on this device.',
  'settings.storage.title': 'Where your data lives',
  'settings.storage.body':
    'Vito keeps everything in this browser. There is no account, nothing is uploaded, and nobody else can see it.',
  'settings.storage.caveat':
    "The flip side: clearing this browser's site data, or opening Vito in another browser, starts from scratch. Export and sync are not in this version.",

  'settings.reset.title': 'Start over',
  'settings.reset.description':
    'Clears your habits, your history and everything Vito has earned, and puts him back at day one. This one cannot be undone.',
  'settings.reset.action': 'Reset progress',
  'settings.reset.pending': 'Starting over…',
  'settings.reset.done': 'Everything is back to day one.',
  // Deliberately its own key rather than a reuse of `settings.reset.title`,
  // even though both read "Start over" in English: this one is the label on the
  // irreversible button, and a translator rewording the section heading must
  // not be able to move it by accident.
  'settings.reset.confirm': 'Start over',
  'settings.reset.confirmTitle': 'Start Vito over?',
  'settings.reset.confirmMessage':
    'This clears your habits, your completion history, and everything Vito has earned and unlocked. There is no copy anywhere else, so it cannot be brought back.',
  'settings.reset.keep': 'Keep my progress',

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

  'closet.title': 'Closet',
  'closet.description':
    'Everything Vito has earned. Wear what you like — nothing is ever used up.',
  'closet.worn.none': 'Vito is going as himself today.',
  'closet.worn.some': 'Vito is wearing {items}.',
  'closet.worn.hint':
    'He wears it on the Today screen. Each slot is separate, so a new hat keeps everything else on.',
  'closet.slots.label': 'Cosmetic slots',
  'closet.slot.hat': 'Hats',
  'closet.slot.backpack': 'Packs',
  'closet.slot.aura': 'Auras',
  'closet.rarity.common': 'Common',
  'closet.rarity.rare': 'Rare',
  'closet.rarity.legendary': 'Legendary',
  'closet.unlock.level': 'Unlocks at level {value}',
  'closet.unlock.xp': 'Unlocks at {value} XP',
  'closet.unlock.streak': 'Unlocks with a {value}-day streak',
  'closet.item.worn': 'Worn — tap to take off',
  'closet.item.wear': 'Tap to wear',

  // Looked up by cosmetic id through `features/rewards/cosmeticCopy.ts`. The
  // catalog in `domain/` holds the id and nothing a translator would touch.
  'cosmetic.hatSprout.name': 'Sprout Cap',
  'cosmetic.backpackExplorer.name': "Explorer's Pack",
  'cosmetic.auraGlow.name': 'Warm Glow',

  'vito.avatar.wearing': ', wearing {items}',

  'progress.section': 'Your progress',
  'progress.level': 'Level {level}',
  'progress.topLevel': 'Top level',
  'progress.xpToLevel': '{current} / {total} XP to level {level}',
  'progress.momentum.label': 'Momentum',
  'progress.momentum.caption':
    'Momentum dips when things go quiet, and it never empties.',
  // English spells the streak the same way at every count; the pair exists for
  // Spanish, where "1 día" and "3 días" are different words.
  'progress.streak.current.one': '{count}-day streak',
  'progress.streak.current.other': '{count}-day streak',
  'progress.streak.none': 'Today can be day one',
  'progress.streak.best.one': 'Best so far: {count} day',
  'progress.streak.best.other': 'Best so far: {count} days',
  'progress.streak.bestNone': 'Your best run shows up here',
  // Each form is a whole sentence rather than one frame with a count slot: the
  // singular reads "the next habit", and no {count} to drop in is the point.
  'progress.boost.one': 'Welcome-back bonus: the next habit you complete earns extra XP.',
  'progress.boost.other':
    'Welcome-back bonus: the next {count} habits you complete earn extra XP.',
} as const satisfies Record<string, string>
