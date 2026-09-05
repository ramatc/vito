import { useState } from 'react'
import { Plus } from 'lucide-react'
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
  const { toggle, pendingHabitIds } = useCompleteHabit(today)

  const [editing, setEditing] = useState<Habit | undefined>(undefined)
  const [formOpen, setFormOpen] = useState(false)
  const [archiving, setArchiving] = useState<Habit | undefined>(undefined)

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
        <Button size="sm" onClick={openNew}>
          <Plus className="size-4" />
          {t('habits.new')}
        </Button>
      }
    >
      <HabitList
        habits={activeHabits}
        completedHabitIds={completedHabitIds}
        onToggle={onToggle}
        busyHabitIds={pendingHabitIds}
        onEdit={openEdit}
        onArchive={setArchiving}
        empty={
          <Card className="flex flex-col items-start gap-3 text-sm text-slate-600 dark:text-muted">
            <span className="font-medium text-slate-900 dark:text-primary">
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

      <HabitFormModal
        open={formOpen}
        habit={editing}
        onSubmit={submitForm}
        onClose={closeForm}
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
