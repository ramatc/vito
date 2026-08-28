import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { BottomTabBar } from './BottomTabBar'
import { NAV_ITEMS } from './navItems'

/**
 * The frame every route renders inside: a bottom tab bar on a phone, a sidebar
 * from `md` up.
 *
 * Both navigations are always in the DOM and swapped by CSS rather than by a
 * media-query hook. A hook would need a resize listener, would render the wrong
 * one on the first paint, and would break when the viewport changes mid-session.
 */
export function AppShell() {
  return (
    <div className="min-h-svh bg-slate-50 text-slate-900">
      <div className="mx-auto flex w-full max-w-5xl">
        <nav
          aria-label="Primary sidebar"
          className="sticky top-0 hidden h-svh w-56 shrink-0 flex-col gap-1 border-r border-slate-200 bg-white p-4 md:flex"
        >
          <span className="px-3 pt-2 pb-4 text-lg font-semibold tracking-tight">
            Vito
          </span>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium',
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-50',
                )
              }
            >
              <item.Icon className="size-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="min-w-0 flex-1">
          {/* Bottom padding clears the fixed tab bar; the sidebar layout drops it. */}
          <main className="pb-24 md:pb-8">
            <Outlet />
          </main>
        </div>
      </div>

      <BottomTabBar className="md:hidden" />
    </div>
  )
}
