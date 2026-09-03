import { Modal } from '../../components/ui/Modal'
import { useTranslate } from '../../hooks/useTranslate'
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
  const t = useTranslate()

  return (
    <Modal
      open={open}
      title={t(habit === undefined ? 'habits.form.newTitle' : 'habits.form.editTitle')}
      description={habit === undefined ? undefined : t('habits.form.editDescription')}
      // `Modal` no longer embeds this string, so it arrives from here alongside
      // the rest of this screen's copy.
      closeLabel={t('common.close')}
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
