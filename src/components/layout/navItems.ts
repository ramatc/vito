import type { ComponentType } from 'react'
import { Home, ListChecks, Settings, Shirt } from 'lucide-react'

/**
 * The app's four surfaces, in tab order.
 *
 * Its own module rather than an export from `BottomTabBar`: the sidebar and the
 * bottom bar must never drift apart, and a data file keeps both component files
 * exporting only components (which is what fast refresh needs).
 *
 * It carries a `labelKey`, not a label. Route, icon and order are structure and
 * belong here; the words are language, and this ring cannot read the locale.
 * The key is what lets the shell ask its caller for a `Record<NavLabelKey,
 * string>` and get a compile error the day a tab is added without a word for it.
 */

export type NavLabelKey = 'today' | 'habits' | 'closet' | 'settings'

export interface NavItem {
  to: string
  labelKey: NavLabelKey
  Icon: ComponentType<{ className?: string }>
  /** `/` would otherwise match every route as a prefix. */
  end?: boolean
}

export const NAV_ITEMS: readonly NavItem[] = [
  { to: '/', labelKey: 'today', Icon: Home, end: true },
  { to: '/habits', labelKey: 'habits', Icon: ListChecks },
  { to: '/closet', labelKey: 'closet', Icon: Shirt },
  { to: '/settings', labelKey: 'settings', Icon: Settings },
]
