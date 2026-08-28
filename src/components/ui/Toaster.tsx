import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

/**
 * Renders transient messages. Presentational on purpose: it takes the list and a
 * dismiss callback, so the store subscription stays in the app ring and this
 * file never learns that `uiStore` exists.
 */

const AUTO_DISMISS_MS = 3200

export interface ToastView {
  id: string
  message: string
  tone: 'celebrate' | 'info'
}

export interface ToasterProps {
  toasts: readonly ToastView[]
  onDismiss(id: string): void
}

function Toast({ toast, onDismiss }: { toast: ToastView; onDismiss(id: string): void }) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onDismiss(toast.id)
    }, AUTO_DISMISS_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [toast.id, onDismiss])

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-center gap-3 rounded-2xl px-4 py-3 text-sm shadow-lg',
        toast.tone === 'celebrate'
          ? 'bg-emerald-600 text-white'
          : 'bg-slate-900 text-white',
      )}
    >
      <span className="flex-1">{toast.message}</span>
      <button
        type="button"
        aria-label="Dismiss message"
        onClick={() => {
          onDismiss(toast.id)
        }}
        className="-mr-1 inline-flex size-6 items-center justify-center rounded-lg opacity-70 hover:opacity-100"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}

export function Toaster({ toasts, onDismiss }: ToasterProps) {
  return (
    <div
      // Polite rather than assertive: a completion message should not interrupt
      // a screen reader mid-sentence.
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-40 mx-auto flex w-full max-w-sm flex-col gap-2 px-4 md:bottom-6"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
