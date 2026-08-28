import type { ReactNode } from 'react'
import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

/**
 * A centred dialog on desktop, a bottom sheet on a phone.
 *
 * Not a full focus trap — that is a real piece of work and the MVP has two
 * dialogs. What it does do is the part users actually notice: Escape closes it,
 * the backdrop closes it, focus moves into the panel on open, and the page
 * behind stops scrolling.
 */

export interface ModalProps {
  open: boolean
  title: string
  description?: string
  onClose(): void
  children: ReactNode
  footer?: ReactNode
}

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (!open) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    panelRef.current?.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 h-full w-full cursor-default bg-slate-900/40"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description === undefined ? undefined : descriptionId}
        tabIndex={-1}
        className={cn(
          'relative z-10 flex max-h-[90svh] w-full flex-col rounded-t-3xl bg-white shadow-xl outline-none',
          'sm:max-w-lg sm:rounded-3xl',
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 p-4">
          <div>
            <h2 id={titleId} className="text-base font-semibold text-slate-900">
              {title}
            </h2>
            {description !== undefined && (
              <p id={descriptionId} className="mt-1 text-sm text-slate-500">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-m-1 inline-flex size-11 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>

        {footer !== undefined && (
          <footer className="flex justify-end gap-2 border-t border-slate-100 p-4">
            {footer}
          </footer>
        )}
      </div>
    </div>
  )
}
