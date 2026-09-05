import { Card } from '../../components/ui/Card'
import { useProgress } from '../../hooks/useProgress'
import { useTranslate } from '../../hooks/useTranslate'
import { tCount } from '../../i18n/translate'
import { usePreferencesStore } from '../../stores/preferencesStore'
import type { Locale } from '../../types/models'
import { MomentumMeter } from './MomentumMeter'
import { StreakBadge } from './StreakBadge'
import { XpBar } from './XpBar'

/**
 * The dashboard's numbers: level, momentum and streak.
 *
 * The container for this feature — it reads `useProgress` once and hands plain
 * props down, so `XpBar`, `MomentumMeter` and `StreakBadge` stay presentational
 * and none of them ever meets a store.
 *
 * It is also this ring's translator, for the same reason. Every string below is
 * a number folded into a sentence, and three of them change shape at one; a
 * presentational component cannot resolve either without a store, so the words
 * are chosen here and arrive downstream already resolved.
 */

type Translate = ReturnType<typeof useTranslate>

/** The streak itself, or the invitation that stands in for a streak of zero. */
function streakHeadline(t: Translate, locale: Locale, currentStreak: number): string {
  if (currentStreak === 0) {
    return t('progress.streak.none')
  }

  return tCount(
    locale,
    { one: 'progress.streak.current.one', other: 'progress.streak.current.other' },
    currentStreak,
  )
}

/** The personal best, or the placeholder for someone who has not set one yet. */
function bestStreak(t: Translate, locale: Locale, longestStreak: number): string {
  if (longestStreak === 0) {
    return t('progress.streak.bestNone')
  }

  return tCount(
    locale,
    { one: 'progress.streak.best.one', other: 'progress.streak.best.other' },
    longestStreak,
  )
}

export function ProgressSection() {
  const t = useTranslate()
  // The raw locale as well as the translator: `tCount` takes a pair of forms,
  // which `useTranslate` deliberately will not accept.
  const locale = usePreferencesStore((state) => state.preferences.locale)

  const {
    level,
    levelProgress,
    xpIntoLevel,
    xpForLevel,
    isMaxLevel,
    momentum,
    momentumFraction,
    currentStreak,
    longestStreak,
    boostActive,
    boostRemaining,
  } = useProgress()

  return (
    <section aria-label={t('progress.section')}>
      <Card className="flex flex-col gap-4">
        <XpBar
          levelProgress={levelProgress}
          label={t('progress.level', { level })}
          hint={
            isMaxLevel
              ? t('progress.topLevel')
              : t('progress.xpToLevel', {
                  current: xpIntoLevel,
                  total: xpForLevel,
                  level: level + 1,
                })
          }
        />

        <MomentumMeter
          momentum={momentum}
          fraction={momentumFraction}
          label={t('progress.momentum.label')}
          caption={t('progress.momentum.caption')}
        />

        <StreakBadge
          hasStreak={currentStreak > 0}
          headline={streakHeadline(t, locale, currentStreak)}
          best={bestStreak(t, locale, longestStreak)}
        />

        {boostActive && (
          <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            {tCount(
              locale,
              { one: 'progress.boost.one', other: 'progress.boost.other' },
              boostRemaining,
            )}
          </p>
        )}
      </Card>
    </section>
  )
}
