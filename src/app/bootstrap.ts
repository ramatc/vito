import { countMissedScheduledDays } from '../domain/habit/schedule'
import { shouldTriggerComeback } from '../domain/progression/comeback'
import { daysBetween, todayKey } from '../domain/shared/date'
import {
  createRepositories,
  setStorageErrorHandler,
} from '../services/storage/repositories'
import { useHabitStore } from '../stores/habitStore'
import { useProgressStore } from '../stores/progressStore'
import { getRepositories, setRepositories } from '../stores/repositories'
import { useUiStore } from '../stores/uiStore'
import { useVitoStore } from '../stores/vitoStore'
import type { DateKey } from '../types/models'

/**
 * The composition root: the one place that knows both which repositories exist
 * and which stores need them. Everything below this file depends only on
 * interfaces.
 */

/**
 * Fills all three persisted stores from whatever the repositories currently
 * hold. One list, used by startup and by a reset, so a fifth store cannot be
 * added to one path and forgotten in the other.
 */
async function hydrateStores(): Promise<void> {
  await Promise.all([
    useHabitStore.getState().load(),
    useProgressStore.getState().load(),
    useVitoStore.getState().load(),
  ])
}

/**
 * Brings the day up to date.
 *
 * Idempotent by design — guarded on `lastRolloverDate`, so calling it twice in
 * a day does nothing the second time. That guard is what removes the need for
 * any timer or background job: the app can simply run this whenever it wakes up.
 */
export async function runDayRollover(today: DateKey = todayKey()): Promise<void> {
  const progress = useProgressStore.getState().progress

  if (progress.lastRolloverDate === today) {
    return
  }

  const { habits, completions } = useHabitStore.getState()

  // Measured from the last rollover so no day is charged twice. On a first run
  // there is no anchor and nothing to have missed.
  const anchor = progress.lastRolloverDate ?? progress.lastActivityDate
  const missedScheduledDays =
    anchor === null
      ? 0
      : countMissedScheduledDays({ habits, completions, from: anchor, to: today })

  await useProgressStore.getState().rollOverDay({
    today,
    missedScheduledDays,
    hadActivityBefore: progress.lastActivityDate !== null,
  })

  if (progress.lastActivityDate === null) {
    return
  }

  const daysSinceLastActivity = daysBetween(progress.lastActivityDate, today)

  // Evaluated once per day here rather than on every render: the cooldown makes
  // it stateful, and a render-time check would be both wasteful and racy.
  if (
    shouldTriggerComeback({
      daysSinceLastActivity,
      lastComebackDate: progress.lastComebackDate,
      today,
    })
  ) {
    await useProgressStore.getState().startComeback(today)

    // Design §10's "welcome back" moment, and the only producer of the `wake`
    // reaction — a comeback is the one event nobody clicks, so no hook is in a
    // position to broadcast it. This file is already where storage and the UI
    // store are joined, which keeps the rule intact that no *store* writes to
    // `uiStore`: the composition root does.
    useUiStore.getState().emitReaction('wake')
  }
}

/**
 * Wires persistence to the stores, hydrates them, and settles the current day.
 *
 * Called once before the app renders.
 */
export async function bootstrap(): Promise<void> {
  setRepositories(createRepositories())

  // Storage reports failures through a handler instead of importing uiStore,
  // which would point the dependency the wrong way. This is where the two ends
  // are joined.
  setStorageErrorHandler((failure) => {
    useUiStore
      .getState()
      .setStorageError(`Could not ${failure.operation} saved data: ${failure.message}`)
  })

  await hydrateStores()

  await runDayRollover()
}

/**
 * Wipes every aggregate and reloads the stores from the empty store — Settings
 * > Reset progress.
 *
 * Destructive and irreversible by design (§11): no snapshot, no undo, no trash.
 * The order matters. Clearing storage first and reloading second is what makes
 * the in-memory state and the saved state agree; calling each store's `reset()`
 * instead would leave the habit list on disk, because `habitStore.reset()` only
 * clears memory.
 *
 * The rollover deliberately does NOT run afterwards. A fresh profile has no
 * anchor to measure from, so there is nothing to settle, and stamping
 * `lastRolloverDate` here would leave the user on something other than the
 * first-run defaults they just asked for.
 */
export async function resetAllData(): Promise<void> {
  await getRepositories().resetAll()
  await hydrateStores()
}

/**
 * Re-runs the rollover when a backgrounded tab comes back, which is how an app
 * left open overnight notices the date changed. Returns an unsubscribe.
 */
export function watchDayRollover(): () => void {
  const onVisible = () => {
    if (document.visibilityState === 'visible') {
      void runDayRollover()
    }
  }

  document.addEventListener('visibilitychange', onVisible)

  return () => {
    document.removeEventListener('visibilitychange', onVisible)
  }
}
