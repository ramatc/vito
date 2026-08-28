import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
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
          <p className="text-sm font-medium text-slate-900">Something went wrong.</p>
          <p className="text-sm text-slate-600">Try reloading the page.</p>
        </div>
      )
    }

    return this.props.children
  }
}
