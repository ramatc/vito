import { Modal } from '../../components/ui/Modal'
import type { Habit } from '../../types/models'
import type { HabitDraftValues } from './HabitForm'
import { HabitForm } from './HabitForm'

/**
 * The habit form in a dialog.
 *
 * `key` on the form resets its local state whenever the target habit changes,
 * so opening "edit" straight after "new" cannot show the previous entry.
 */

export interface HabitFormModalProps {
  open: boolean
  habit?: Habit
  onSubmit(values: HabitDraftValues): void
  onClose(): void
}

export function HabitFormModal({ open, habit, onSubmit, onClose }: HabitFormModalProps) {
  return (
    <Modal
      open={open}
      title={habit === undefined ? 'New habit' : 'Edit habit'}
      description={
        habit === undefined
          ? undefined
          : 'Changes apply from today on. Past completions keep the XP they earned.'
      }
      // `Modal` no longer embeds this string, so it arrives from here alongside
      // the rest of this screen's copy. Extracted with the habits slice.
      closeLabel="Close"
      onClose={onClose}
    >
      <HabitForm
        key={habit?.id ?? 'new'}
        habit={habit}
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </Modal>
  )
}
