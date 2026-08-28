import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
  // Persistence is localStorage-backed (services/storage), so every test starts
  // from a clean store instead of inheriting the previous test's writes.
  localStorage.clear()
})
