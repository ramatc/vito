import { useState } from 'react'
import { Screen } from '../../components/layout/Screen'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { SAVE_ERROR_MESSAGE } from '../../hooks/useCompleteHabit'
import { useTranslate } from '../../hooks/useTranslate'
import { useUiStore } from '../../stores/uiStore'
import { LanguageToggle } from './LanguageToggle'
import { ResetProgressDialog } from './ResetProgressDialog'
import { ThemeToggle } from './ThemeToggle'

/**
 * Settings, which in the MVP is one honest paragraph about where the data
 * lives and one destructive button.
 *
 * `onResetProgress` is injected rather than imported. Wiping every aggregate
 * and rehydrating the stores is a composition-root job — `app/bootstrap.ts`
 * owns it, and `features/` is not allowed to reach into `app/` or into
 * `services/storage`. Passing the capability in also means this screen can be
 * exercised without touching real storage.
 */

export interface SettingsScreenProps {
  /** Clears every aggregate and reloads the stores from first-run defaults. */
  onResetProgress(): Promise<void>
}

export function SettingsScreen({ onResetProgress }: SettingsScreenProps) {
  const t = useTranslate()
  const [confirming, setConfirming] = useState(false)
  const [resetting, setResetting] = useState(false)

  const confirmReset = () => {
    setConfirming(false)
    setResetting(true)

    onResetProgress()
      .then(() => {
        useUiStore
          .getState()
          .pushToast({ message: 'Everything is back to day one.', tone: 'info' })
      })
      .catch(() => {
        useUiStore.getState().pushToast({ message: SAVE_ERROR_MESSAGE, tone: 'info' })
      })
      .finally(() => {
        setResetting(false)
      })
  }

  return (
    <Screen title="Settings" description="Your data stays on this device.">
      {/*
        First card on the screen: these two are the only settings that change
        what the app looks like, and the rest of this screen is information and
        one destructive button.
      */}
      <Card className="flex flex-col gap-5">
        <LanguageToggle label={t('settings.language.label')} />
        <ThemeToggle label={t('settings.theme.label')} />
      </Card>

      <Card className="flex flex-col gap-2 text-sm text-slate-600">
        <h2 className="text-sm font-medium text-slate-900">Where your data lives</h2>
        <p>
          Vito keeps everything in this browser. There is no account, nothing is uploaded,
          and nobody else can see it.
        </p>
        <p className="text-xs text-slate-500">
          The flip side: clearing this browser&apos;s site data, or opening Vito in
          another browser, starts from scratch. Export and sync are not in this version.
        </p>
      </Card>

      <Card className="flex flex-col items-start gap-3 text-sm text-slate-600">
        <h2 className="text-sm font-medium text-slate-900">Start over</h2>
        <p>
          Clears your habits, your history and everything Vito has earned, and puts him
          back at day one. This one cannot be undone.
        </p>
        <Button
          variant="danger"
          disabled={resetting}
          onClick={() => {
            setConfirming(true)
          }}
        >
          {resetting ? 'Starting over…' : 'Reset progress'}
        </Button>
      </Card>

      <ResetProgressDialog
        open={confirming}
        onConfirm={confirmReset}
        onCancel={() => {
          setConfirming(false)
        }}
      />
    </Screen>
  )
}
