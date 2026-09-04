import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ErrorBoundary } from '../ErrorBoundary'

/**
 * The fallback screen, tested at the only layer that can reach it.
 *
 * A class component cannot call `useTranslate()`, so its two strings arrive as
 * props from `App.tsx`. That makes the interesting question a rendering one —
 * does the boundary show the words it was handed, or words of its own? — and
 * the only way to ask it is to make a child throw.
 *
 * React logs a caught render error to `console.error` on top of the boundary's
 * own log, so the spy is noise control rather than an assertion target.
 */

function Boom(): never {
  throw new Error('render blew up')
}

const ES = { title: 'Algo salió mal.', hint: 'Probá recargar la página.' }
const EN = { title: 'Something went wrong.', hint: 'Try reloading the page.' }

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ErrorBoundary', () => {
  it('renders its children while nothing throws', () => {
    render(
      <ErrorBoundary title={EN.title} hint={EN.hint}>
        <p>The app, running normally.</p>
      </ErrorBoundary>,
    )

    expect(screen.getByText('The app, running normally.')).toBeInTheDocument()
    expect(screen.queryByText(EN.title)).not.toBeInTheDocument()
  })

  it('shows the Spanish copy it was handed when a child throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    render(
      <ErrorBoundary title={ES.title} hint={ES.hint}>
        <Boom />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Algo salió mal.')).toBeInTheDocument()
    expect(screen.getByText('Probá recargar la página.')).toBeInTheDocument()
  })

  it('shows the English copy from the same one source', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    render(
      <ErrorBoundary title={EN.title} hint={EN.hint}>
        <Boom />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Something went wrong.')).toBeInTheDocument()
    expect(screen.getByText('Try reloading the page.')).toBeInTheDocument()
  })
})
