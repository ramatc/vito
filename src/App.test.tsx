import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

// Runner smoke test: proves jsdom, React Testing Library, jest-dom matchers and
// the Vitest setup file are wired correctly. Real behaviour tests start at the
// domain layer in the next work unit.
describe('App', () => {
  it('renders the app shell placeholder', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Vito' })).toBeInTheDocument()
  })
})
