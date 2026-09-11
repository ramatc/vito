import { useEffect, useMemo } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { Screen } from '../components/layout/Screen'
import { HabitReportsScreen } from '../features/habits/HabitReportsScreen'
import { HabitsScreen } from '../features/habits/HabitsScreen'
import { TodayHabits } from '../features/habits/TodayHabits'
import { ProgressSection } from '../features/progress/ProgressSection'
import { ClosetScreen } from '../features/rewards/ClosetScreen'
import { SettingsScreen } from '../features/settings/SettingsScreen'
import { VitoAvatar } from '../features/vito/components/VitoAvatar'
import { VitoStage } from '../features/vito/components/VitoStage'
import { useTranslate } from '../hooks/useTranslate'
import { useVito } from '../hooks/useVito'
import { resetAllData } from './bootstrap'

/**
 * The app's four surfaces, all nested inside `AppShell` so navigation is part of
 * the layout rather than something each screen repeats.
 */

/**
 * Home: the companion, the numbers he grows on, and today's list.
 *
 * Composed here rather than in a `features/home/` screen because the
 * composition spans three features and the route is the honest owner of that.
 * Each block subscribes to its own slice, so completing a habit updates the
 * avatar, the bars and the list from one store write.
 */
function HomeRoute() {
  const t = useTranslate()

  return (
    <Screen title={t('home.title')} description={t('home.description')}>
      <VitoStage />
      <ProgressSection />
      <TodayHabits />
    </Screen>
  )
}

/**
 * The shell's words, resolved where the locale is readable.
 *
 * `<Route element={<AppShell />}>` has no prop channel, and `components/` may
 * not reach a store or a hook — so the same trick `SettingsRoute` already uses
 * for a capability is used here for copy: a one-line wrapper that subscribes and
 * hands the result down. Icons stay in `navItems.ts`, because `app/` cannot
 * import an icon library and, unlike a label, an icon is not language.
 *
 * The labels are memoised on `t`, which `useTranslate` keys to the locale: the
 * object is stable between renders and a new one on a language switch, which is
 * exactly when the shell has to repaint.
 */
function AppShellRoute() {
  const t = useTranslate()
  const { pathname } = useLocation()

  // `AppShell` never remounts between tabs — only its `<Outlet />` content
  // changes — and `history.pushState` (what `<NavLink>` does) leaves the
  // window's scroll position exactly where it was, unlike a full page load.
  // Without this, opening a long screen scrolled down and switching tabs lands
  // on the next screen already scrolled.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  const navLabels = useMemo(
    () => ({
      today: t('nav.today'),
      habits: t('nav.habits'),
      closet: t('nav.closet'),
      settings: t('nav.settings'),
    }),
    [t],
  )

  return (
    <AppShell
      navLabels={navLabels}
      wordmark={t('app.wordmark')}
      sidebarNavLabel={t('nav.sidebar')}
      bottomNavLabel={t('nav.bottom')}
    />
  )
}

/**
 * Closet: the wardrobe, and the live avatar it dresses.
 *
 * Composed here for the same reason `HomeRoute` is: the surface spans two
 * features (`rewards` for the catalog, `vito` for the avatar that wears it),
 * and a nested feature file may not reach into another feature's subdirectory
 * (design §6 / `.oxlintrc.json`) — the route is the one ring allowed to see
 * both.
 */
function ClosetRoute() {
  const { mood, stage, allDone, equippedItems } = useVito()

  return (
    <ClosetScreen
      preview={<VitoAvatar stage={stage} mood={mood} allDone={allDone} equipped={equippedItems} />}
    />
  )
}

/**
 * Settings gets its destructive capability handed to it from here.
 *
 * `resetAllData` clears storage and rehydrates every store, which needs both
 * the repositories and all three stores — composition-root reach that
 * `features/` deliberately does not have. Injecting it keeps that fence intact
 * and keeps the wipe visible at the root rather than buried in a screen.
 */
function SettingsRoute() {
  return <SettingsScreen onResetProgress={resetAllData} />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShellRoute />}>
        <Route index element={<HomeRoute />} />
        <Route path="habits" element={<HabitsScreen />} />
        <Route path="habits/reports" element={<HabitReportsScreen />} />
        <Route path="closet" element={<ClosetRoute />} />
        <Route path="settings" element={<SettingsRoute />} />
        {/* An unknown URL lands on Today rather than on a dead end. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
