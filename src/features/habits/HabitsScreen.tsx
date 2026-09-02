import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Screen } from '../../components/layout/Screen'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { SAVE_ERROR_MESSAGE, useCompleteHabit } from '../../hooks/useCompleteHabit'
import { useTodayHabits } from '../../hooks/useTodayHabits'
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
    useUiStore.getState().pushToast({ message: SAVE_ERROR_MESSAGE, tone: 'info' })
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
      title="Habits"
      description="Everything you are building. Archived habits keep their history."
      action={
        <Button size="sm" onClick={openNew}>
          <Plus className="size-4" />
          New
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
          <Card className="flex flex-col items-start gap-3 text-sm text-slate-600">
            <span className="font-medium text-slate-900">No habits yet</span>
            <span>Start with one small thing you can do today.</span>
            <Button size="sm" onClick={openNew}>
              <Plus className="size-4" />
              Add your first habit
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
        title="Archive this habit?"
        message={
          archiving === undefined
            ? ''
            : `"${archiving.name}" moves out of your list from today on. Everything it has already earned stays exactly as it is.`
        }
        confirmLabel="Archive"
        cancelLabel="Cancel"
        closeLabel="Close"
        onConfirm={confirmArchive}
        onCancel={() => {
          setArchiving(undefined)
        }}
      />
    </Screen>
  )
}
