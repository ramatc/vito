import { Card } from '../../components/ui/Card'
import { useProgress } from '../../hooks/useProgress'
import { MomentumMeter } from './MomentumMeter'
import { StreakBadge } from './StreakBadge'
import { XpBar } from './XpBar'

/**
 * The dashboard's numbers: level, momentum and streak.
 *
 * The container for this feature — it reads `useProgress` once and hands plain
 * props down, so `XpBar`, `MomentumMeter` and `StreakBadge` stay presentational
 * and none of them ever meets a store.
 */
export function ProgressSection() {
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
    <section aria-label="Your progress">
      <Card className="flex flex-col gap-4">
        <XpBar
          level={level}
          levelProgress={levelProgress}
          xpIntoLevel={xpIntoLevel}
          xpForLevel={xpForLevel}
          isMaxLevel={isMaxLevel}
        />

        <MomentumMeter momentum={momentum} fraction={momentumFraction} />

        <StreakBadge currentStreak={currentStreak} longestStreak={longestStreak} />

        {boostActive && (
          <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            Welcome-back bonus: the next {boostRemaining}{' '}
            {boostRemaining === 1 ? 'habit' : 'habits'} you complete earn extra XP.
          </p>
        )}
      </Card>
    </section>
  )
}
