import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

// Relocated from the PR1 smoke test at src/App.test.tsx, which rendered the
// placeholder shell this phase deleted. Still the same job: prove jsdom, React
// Testing Library, jest-dom and the Vitest setup file are wired up — now with
// the routed shell it has to boot through. Behaviour lives in the domain and
// store suites, not here.
describe('App', () => {
  it('renders the Today screen inside the app shell', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Today' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
    expect(
      screen.getByRole('navigation', { name: 'Primary sidebar' }),
    ).toBeInTheDocument()
  })
})
