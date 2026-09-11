import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'

/**
 * One route's page: a titled header plus its content, with the horizontal
 * padding that keeps a 375px viewport from clipping anything.
 */

export interface ScreenProps {
  title: string
  description?: string
  /** Rendered on the header's trailing edge — typically a primary action. */
  action?: ReactNode
  /** A secondary destination reached from elsewhere, rather than a tab — when set, a leading back control renders before the title. */
  onBack?: () => void
  /** Accessible name for the back control. Required whenever `onBack` is set. */
  backLabel?: string
  children: ReactNode
}

export function Screen({
  title,
  description,
  action,
  onBack,
  backLabel,
  children,
}: ScreenProps) {
  return (
    <div className="flex flex-col gap-5 px-4 pt-6 sm:px-6">
      <header className="flex items-start justify-between gap-3">
        {onBack === undefined ? (
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight text-primary">
              {title}
            </h1>
            {description !== undefined && (
              <p className="mt-1 text-sm text-muted">{description}</p>
            )}
          </div>
        ) : (
          <div className="flex min-w-0 items-start gap-2">
            <button
              type="button"
              aria-label={backLabel}
              onClick={onBack}
              className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface-sunken hover:text-primary"
            >
              <ChevronLeft className="size-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight text-primary">
                {title}
              </h1>
              {description !== undefined && (
                <p className="mt-1 text-sm text-muted">{description}</p>
              )}
            </div>
          </div>
        )}
        {action}
      </header>

      {children}
    </div>
  )
}
