import { ProgressBar } from '../../components/ui/ProgressBar'

/**
 * Level and the XP band under it. Presentational: every number arrives as a
 * prop, already derived from the curve by `useProgress`.
 */

export interface XpBarProps {
  level: number
  /** Fraction 0..1 through the current level band. */
  levelProgress: number
  xpIntoLevel: number
  xpForLevel: number
  isMaxLevel: boolean
  className?: string
}

export function XpBar({
  level,
  levelProgress,
  xpIntoLevel,
  xpForLevel,
  isMaxLevel,
  className,
}: XpBarProps) {
  return (
    <ProgressBar
      className={className}
      value={levelProgress}
      label={`Level ${String(level)}`}
      hint={
        isMaxLevel
          ? 'Top level'
          : `${String(xpIntoLevel)} / ${String(xpForLevel)} XP to level ${String(level + 1)}`
      }
    />
  )
}
