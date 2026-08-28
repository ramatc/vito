import type { ReactNode } from 'react'

/**
 * One route's page: a titled header plus its content, with the horizontal
 * padding that keeps a 375px viewport from clipping anything.
 */

export interface ScreenProps {
  title: string
  description?: string
  /** Rendered on the header's trailing edge — typically a primary action. */
  action?: ReactNode
  children: ReactNode
}

export function Screen({ title, description, action, children }: ScreenProps) {
  return (
    <div className="flex flex-col gap-5 px-4 pt-6 sm:px-6">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h1>
          {description !== undefined && (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          )}
        </div>
        {action}
      </header>

      {children}
    </div>
  )
}
