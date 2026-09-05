import { NavLink } from 'react-router-dom'
import { cn } from '../../utils/cn'
import type { NavLabelKey } from './navItems'
import { NAV_ITEMS } from './navItems'

/**
 * The mobile navigation. Real routes rather than a tab index in a store: on
 * Android the system back gesture must return to the previous tab instead of
 * closing the app, and only history gives that for free.
 *
 * Both label props come from `AppShell` rather than from a lookup here: this
 * bar and the sidebar render the same four words, and resolving them twice is
 * how the two navigations start disagreeing.
 */

export interface BottomTabBarProps {
  navLabels: Record<NavLabelKey, string>
  /** Accessible name for the landmark itself. */
  navLabel: string
  className?: string
}

export function BottomTabBar({ navLabels, navLabel, className }: BottomTabBarProps) {
  return (
    <nav
      aria-label={navLabel}
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur',
        'dark:border-slate-700 dark:bg-surface-raised/95',
        'pb-[env(safe-area-inset-bottom)]',
        className,
      )}
    >
      <ul className="mx-auto flex max-w-md">
        {NAV_ITEMS.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium',
                  isActive
                    ? 'text-emerald-700 dark:text-brand'
                    : 'text-slate-500 dark:text-muted',
                )
              }
            >
              <item.Icon className="size-5" />
              {navLabels[item.labelKey]}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
