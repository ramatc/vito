import { createElement, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from 'framer-motion'
import { Archive, Check, Pencil } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { XP_BY_DIFFICULTY } from '../../domain/habit/xpReward'
import type { XpGainEvent } from '../../hooks/useCompleteHabit'
import { useTranslate } from '../../hooks/useTranslate'
import { usePreferencesStore } from '../../stores/preferencesStore'
import type { Habit } from '../../types/models'
import { cn } from '../../utils/cn'
import { describeFrequency } from './frequency'
import { resolveHabitIcon } from './habitIcons'

/**
 * One habit, as a row. It reports taps and knows nothing about XP rules or what
 * completing actually does — the only state it reads is the active locale, which
 * `features/` is the ring that owns.
 *
 * `xpGainEvent` is the one exception to "knows nothing about XP": it is handed
 * a number already computed elsewhere, purely to display it for a moment next
 * to the control that earned it. `MotionConfig` at the app root (`reducedMotion="user"`)
 * is what keeps every `motion.*` element below honest under reduced motion —
 * nothing here checks that setting itself.
 */

/** How long the contextual "+XP" badge stays up before it fades on its own. */
const XP_GAIN_VISIBLE_MS = 900

export interface HabitCardProps {
  habit: Habit
  completed: boolean
  onToggle(habitId: string): void
  onEdit?(habit: Habit): void
  onArchive?(habit: Habit): void
  disabled?: boolean
  /** A fresh reward from this card's own habit, or `undefined` otherwise. */
  xpGainEvent?: XpGainEvent
}

export function HabitCard({
  habit,
  completed,
  onToggle,
  onEdit,
  onArchive,
  disabled = false,
  xpGainEvent,
}: HabitCardProps) {
  const t = useTranslate()
  const locale = usePreferencesStore((state) => state.preferences.locale)

  // Local and self-clearing rather than driven by how long `xpGainEvent` stays
  // truthy upstream: the badge's lifetime must not depend on when the next
  // completion happens to overwrite that prop. The nonce guard is what makes a
  // rapid string of completions safe — each one restarts the timer instead of
  // stacking one.
  const [visibleGain, setVisibleGain] = useState<XpGainEvent | undefined>(undefined)
  // Lazily seeded from whatever this card was handed on its very first render:
  // a card that mounts already holding a nonce (e.g. a re-sort remounts it
  // while a sibling card's badge is still live) must treat that nonce as
  // already shown, not replay it.
  const seenGainNonceRef = useRef<number | undefined>(xpGainEvent?.nonce)

  // The check's completion pop. `useAnimationControls` + an effect that
  // compares against the previous `completed`, exactly like `VitoAvatar`'s
  // reaction — and for the same reason: `controls.start(...)` is imperative
  // and does not go through `MotionConfig`, so reduced motion is handled
  // explicitly below rather than assumed.
  const checkControls = useAnimationControls()
  const prefersReducedMotion = useReducedMotion() ?? false
  const wasCompletedRef = useRef(completed)

  useEffect(() => {
    const wasCompleted = wasCompletedRef.current
    wasCompletedRef.current = completed

    // Only the completing edge pops. Mounting already-completed and
    // unchecking both settle straight to rest — a page load must not replay
    // the bounce, and an undo already reads as "reverted" from the card's
    // colour transition alone (design §11).
    if (completed && !wasCompleted && !prefersReducedMotion) {
      void checkControls.start({
        scale: [1, 0.9, 1.08, 1],
        transition: { duration: 0.32, ease: 'easeOut' },
      })
    } else {
      void checkControls.start({ scale: 1, transition: { duration: 0 } })
    }
  }, [completed, prefersReducedMotion, checkControls])

  useEffect(() => {
    if (xpGainEvent === undefined || xpGainEvent.nonce === seenGainNonceRef.current) {
      return
    }

    seenGainNonceRef.current = xpGainEvent.nonce
    setVisibleGain(xpGainEvent)

    const timer = window.setTimeout(() => {
      setVisibleGain(undefined)
    }, XP_GAIN_VISIBLE_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [xpGainEvent])

  // XP derived from the single source of truth rather than inlined:
  // XP_BY_DIFFICULTY's own comment says no call site may hardcode these numbers.
  const xpHint = t('common.xp', { count: XP_BY_DIFFICULTY[habit.difficulty] })

  // `createElement` rather than `const Icon = ...; <Icon />`: the lookup returns
  // a stable reference from a module-level registry, but a capitalised local
  // reads to both a linter and a reviewer as a component defined during render.
  const icon = createElement(resolveHabitIcon(habit.icon), { className: 'size-5' })

  return (
    <Card
      className={cn(
        'flex items-center gap-3 p-3 transition-colors duration-300',
        completed && 'bg-brand/10',
      )}
    >
      <span
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-xl',
          completed ? 'bg-brand/15 text-brand' : 'bg-surface-sunken text-muted',
        )}
      >
        {icon}
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-sm font-medium',
            completed ? 'text-brand' : 'text-primary',
          )}
        >
          {habit.name}
        </p>
        <p
          className={cn(
            'truncate text-xs text-muted transition-opacity duration-300',
            completed && 'opacity-70',
          )}
        >
          {habit.category} · {describeFrequency(locale, habit.frequency)} · {xpHint}
        </p>
      </div>

      {onEdit !== undefined && (
        <button
          type="button"
          aria-label={t('habits.card.edit', { name: habit.name })}
          onClick={() => {
            onEdit(habit)
          }}
          className="inline-flex size-11 items-center justify-center rounded-xl text-muted hover:bg-surface-sunken hover:text-primary"
        >
          <Pencil className="size-4" />
        </button>
      )}

      {onArchive !== undefined && (
        <button
          type="button"
          aria-label={t('habits.card.archive', { name: habit.name })}
          onClick={() => {
            onArchive(habit)
          }}
          className="inline-flex size-11 items-center justify-center rounded-xl text-muted hover:bg-surface-sunken hover:text-primary"
        >
          <Archive className="size-4" />
        </button>
      )}

      <div className="relative shrink-0">
        <motion.button
          type="button"
          // A checkbox role rather than a plain button: the control is a
          // two-state toggle, and screen readers should announce it as one.
          role="checkbox"
          aria-checked={completed}
          aria-label={t(completed ? 'habits.card.uncheck' : 'habits.card.complete', {
            name: habit.name,
          })}
          disabled={disabled}
          onClick={() => {
            onToggle(habit.id)
          }}
          // Press feedback fires on every tap, independent of the completion
          // pop below — the two only ever coincide on the completing tap.
          whileTap={disabled ? undefined : { scale: 0.92 }}
          className={cn(
            'inline-flex size-11 items-center justify-center rounded-full ring-1 transition-colors',
            'disabled:cursor-not-allowed disabled:opacity-50',
            completed
              ? // The filled state uses on-brand for its tick rather than plain
                // white: `--brand` is a light mint in the dark theme, the same
                // reason `Button`'s primary variant takes `on-brand` lettering.
                'bg-brand text-on-brand ring-brand'
              : 'bg-surface-raised text-muted ring-border hover:text-brand hover:ring-brand',
          )}
        >
          <motion.span animate={checkControls} className="flex items-center justify-center">
            <Check className="size-5" />
          </motion.span>
        </motion.button>

        {/* Contextual XP reward — never a global toast for the plain case. */}
        <AnimatePresence>
          {visibleGain !== undefined && (
            <motion.span
              key={visibleGain.nonce}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: -10 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="pointer-events-none absolute -top-1 right-0 whitespace-nowrap text-xs font-semibold text-brand"
            >
              {t('common.xpGain', { count: visibleGain.xp })}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </Card>
  )
}
