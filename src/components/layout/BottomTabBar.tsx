import { NavLink } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { NAV_ITEMS } from './navItems'

/**
 * The mobile navigation. Real routes rather than a tab index in a store: on
 * Android the system back gesture must return to the previous tab instead of
 * closing the app, and only history gives that for free.
 */
export function BottomTabBar({ className }: { className?: string }) {
  return (
    <nav
      aria-label="Primary"
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur',
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
                  isActive ? 'text-emerald-700' : 'text-slate-500',
                )
              }
            >
              <item.Icon className="size-5" />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
