import { Button } from './Button'
import { Modal } from './Modal'

/**
 * A yes/no gate over a destructive action. Built on `Modal` so there is one
 * dialog implementation, not two that drift.
 *
 * The three labels are required and have no defaults, for the same reason
 * `Modal.closeLabel` is: a default here would be an English literal that no
 * locale can reach. `closeLabel` is separate from `cancelLabel` even though
 * both dismiss the dialog — reusing one string would put two controls with the
 * same accessible name on screen at once.
 */

export interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  /** Accessible name for the header's close control. */
  closeLabel: string
  /** `danger` for irreversible actions; `neutral` for reversible ones. */
  tone?: 'danger' | 'neutral'
  onConfirm(): void
  onCancel(): void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  closeLabel,
  tone = 'neutral',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      title={title}
      closeLabel={closeLabel}
      onClose={onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-slate-600 dark:text-muted">{message}</p>
    </Modal>
  )
}
