import type { ComponentType } from 'react'
import { Home, ListChecks, Settings, Shirt } from 'lucide-react'

/**
 * The app's four surfaces, in tab order.
 *
 * Its own module rather than an export from `BottomTabBar`: the sidebar and the
 * bottom bar must never drift apart, and a data file keeps both component files
 * exporting only components (which is what fast refresh needs).
 */

export interface NavItem {
  to: string
  label: string
  Icon: ComponentType<{ className?: string }>
  /** `/` would otherwise match every route as a prefix. */
  end?: boolean
}

export const NAV_ITEMS: readonly NavItem[] = [
  { to: '/', label: 'Today', Icon: Home, end: true },
  { to: '/habits', label: 'Habits', Icon: ListChecks },
  { to: '/closet', label: 'Closet', Icon: Shirt },
  { to: '/settings', label: 'Settings', Icon: Settings },
]
