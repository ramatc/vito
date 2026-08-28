import type { ReactNode } from 'react'
import { MotionConfig } from 'framer-motion'

/**
 * App-wide context.
 *
 * `reducedMotion="user"` makes every Framer Motion animation in the tree honour
 * the OS setting by default, so accessibility is the baseline rather than
 * something each animated component has to remember.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
