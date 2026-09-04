import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { useTranslate } from '../../hooks/useTranslate'

/**
 * The gate in front of the only irreversible action in the app.
 *
 * Its own component rather than a `ConfirmDialog` inlined in the screen,
 * because the wording IS the safety mechanism here: there is no snapshot and no
 * undo behind it (design §11), so the message has to say plainly what goes and
 * that it does not come back. Keeping it in one file means that sentence gets
 * reviewed on its own — now in both languages at once, side by side in the
 * dictionaries.
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
  const t = useTranslate()

  return (
    <ConfirmDialog
      open={open}
      title={t('settings.reset.confirmTitle')}
      message={t('settings.reset.confirmMessage')}
      confirmLabel={t('settings.reset.confirm')}
      cancelLabel={t('settings.reset.keep')}
      // Deliberately not `settings.reset.keep` again: the header's close
      // control and the cancel button do the same thing, but two on-screen
      // controls sharing one accessible name is worse than one extra string.
      closeLabel={t('common.close')}
      tone="danger"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}
