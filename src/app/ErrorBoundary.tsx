import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  /** The fallback's headline, e.g. "Something went wrong." */
  title: string
  /** The one thing the reader can do about it, e.g. "Try reloading the page." */
  hint: string
}

interface ErrorBoundaryState {
  hasError: boolean
}

/**
 * The last line of defence against a render throw reaching the DOM.
 *
 * This is a safety net, not a fix: nothing here validates habit data. A shape
 * a domain function did not expect (e.g. a `frequency` missing `days`) still
 * throws — the only change is that the throw blanks a small fallback screen
 * instead of the whole app.
 *
 * Its two strings arrive as props because a class component cannot call
 * `useTranslate()`, and `App.tsx` — its only render site — already can. The
 * `console.error` above stays English on purpose: that one is for whoever reads
 * the console, not for whoever is looking at the screen.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  override componentDidCatch(error: unknown, info: ErrorInfo): void {
    console.error(
      'Vito hit an unexpected error while rendering.',
      error,
      info.componentStack,
    )
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-2 bg-slate-50 p-6 text-center">
          <p className="text-sm font-medium text-slate-900">{this.props.title}</p>
          <p className="text-sm text-slate-600">{this.props.hint}</p>
        </div>
      )
    }

    return this.props.children
  }
}
