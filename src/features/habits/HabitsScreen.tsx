import { useState } from 'react'
import { ClipboardList, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Screen } from '../../components/layout/Screen'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { useCompleteHabit } from '../../hooks/useCompleteHabit'
import { useTodayHabits } from '../../hooks/useTodayHabits'
import { useTranslate } from '../../hooks/useTranslate'
import { useHabitStore } from '../../stores/habitStore'
import { useUiStore } from '../../stores/uiStore'
import type { Habit } from '../../types/models'
import type { HabitDraftValues } from './HabitForm'
import { HabitFormModal } from './HabitFormModal'
import { HabitList } from './HabitList'
import { HabitStatsModal } from './HabitStatsModal'

/**
 * The habit manager: every active habit, with create, edit, archive and today's
 * completion state.
 *
 * The container for the habits feature — it is the one file here that talks to
 * a store, so every component below it stays presentational and testable.
 */
export function HabitsScreen() {
  const t = useTranslate()
  const habits = useHabitStore((state) => state.habits)
  const { completedHabitIds, today } = useTodayHabits()
  const { toggle, pendingHabitIds, lastGain } = useCompleteHabit(today)

  const [editing, setEditing] = useState<Habit | undefined>(undefined)
  const [formOpen, setFormOpen] = useState(false)
  const [archiving, setArchiving] = useState<Habit | undefined>(undefined)
  const [viewingStats, setViewingStats] = useState<Habit | undefined>(undefined)

  const activeHabits = habits.filter((habit) => habit.archivedAt === undefined)

  const openNew = () => {
    setEditing(undefined)
    setFormOpen(true)
  }

  const openEdit = (habit: Habit) => {
    setEditing(habit)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditing(undefined)
  }

  const reportSaveError = () => {
    useUiStore.getState().pushToast({ message: t('common.error.save'), tone: 'info' })
  }

  const submitForm = (values: HabitDraftValues) => {
    const store = useHabitStore.getState()

    const result =
      editing === undefined
        ? store.createHabit(values)
        : // Forward-only: past completions keep the XP they were awarded.
          store.updateHabit(editing.id, values)

    result.catch(reportSaveError)

    closeForm()
  }

  const confirmArchive = () => {
    if (archiving !== undefined) {
      useHabitStore.getState().archiveHabit(archiving.id).catch(reportSaveError)
    }

    setArchiving(undefined)
  }

  const onToggle = (habitId: string) => {
    toggle(habitId, completedHabitIds.includes(habitId))
  }

  return (
    <Screen
      title={t('habits.title')}
      description={t('habits.description')}
      action={
        <div className="flex items-center gap-2">
          <Link
            to="/habits/reports"
            aria-label={t('habits.reports.entry')}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface-sunken hover:text-primary"
          >
            <ClipboardList className="size-5" />
          </Link>

          <button
            type="button"
            aria-label={t('habits.new')}
            onClick={openNew}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-brand text-on-brand transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <Plus className="size-5" strokeWidth={2.5} />
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-2">
        {activeHabits.length > 0 && (
          <h2 className="px-1 text-xs font-bold tracking-wide text-muted uppercase">
            {t('habits.section.all', { count: activeHabits.length })}
          </h2>
        )}

        <HabitList
          habits={activeHabits}
          completedHabitIds={completedHabitIds}
          onToggle={onToggle}
          busyHabitIds={pendingHabitIds}
          lastGain={lastGain}
          onViewStats={setViewingStats}
          onEdit={openEdit}
          onArchive={setArchiving}
          empty={
            <Card className="flex flex-col items-start gap-3 text-sm text-muted">
              <span className="font-medium text-primary">
                {t('habits.empty.title')}
              </span>
              <span>{t('habits.empty.description')}</span>
              <Button size="sm" onClick={openNew}>
                <Plus className="size-4" />
                {t('habits.empty.action')}
              </Button>
            </Card>
          }
        />
      </div>

      <HabitFormModal
        open={formOpen}
        habit={editing}
        onSubmit={submitForm}
        onClose={closeForm}
      />

      <HabitStatsModal
        open={viewingStats !== undefined}
        habit={viewingStats}
        onClose={() => {
          setViewingStats(undefined)
        }}
      />

      <ConfirmDialog
        open={archiving !== undefined}
        title={t('habits.archive.title')}
        message={
          archiving === undefined
            ? ''
            : t('habits.archive.message', { name: archiving.name })
        }
        confirmLabel={t('habits.archive.confirm')}
        cancelLabel={t('common.cancel')}
        closeLabel={t('common.close')}
        onConfirm={confirmArchive}
        onCancel={() => {
          setArchiving(undefined)
        }}
      />
    </Screen>
  )
}
