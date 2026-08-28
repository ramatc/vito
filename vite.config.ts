import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    // A committed `.only` must fail the run, not silently skip the rest of the
    // suite. Vitest defaults this to `!process.env.CI`, which makes the result
    // depend on an env var nobody sets locally — pinned here so local and CI
    // behave identically.
    allowOnly: false,
    coverage: {
      provider: 'v8',
      // Coverage is a domain-layer gate only (see design §9). UI coverage is not a goal.
      include: ['src/domain/**'],
      thresholds: {
        // The domain ring is pure functions with no I/O, no framework and no
        // unreachable error handling — an uncovered line there is a real gap,
        // not a hard-to-test corner. Scoped by glob rather than set globally so
        // widening `include` later cannot silently dilute this gate.
        'src/domain/**': { lines: 100 },
      },
    },
  },
})
