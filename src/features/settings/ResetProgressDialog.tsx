import { ConfirmDialog } from '../../components/ui/ConfirmDialog'

/**
 * The gate in front of the only irreversible action in the app.
 *
 * Its own component rather than a `ConfirmDialog` inlined in the screen,
 * because the wording IS the safety mechanism here: there is no snapshot and no
 * undo behind it (design §11), so the message has to say plainly what goes and
 * that it does not come back. Keeping it in one file means that sentence gets
 * reviewed on its own.
 *
 * The tone is still not a telling-off. It states the consequence, and the
 * cancel button is the calm default.
 */

export interface ResetProgressDialogProps {
  open: boolean
  onConfirm(): void
  onCancel(): void
}

export function ResetProgressDialog({
  open,
  onConfirm,
  onCancel,
}: ResetProgressDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title="Start Vito over?"
      message="This clears your habits, your completion history, and everything Vito has earned and unlocked. There is no copy anywhere else, so it cannot be brought back."
      confirmLabel="Start over"
      cancelLabel="Keep my progress"
      tone="danger"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}
