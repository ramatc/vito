import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { Screen } from '../components/layout/Screen'
import { Card } from '../components/ui/Card'
import { HabitsScreen } from '../features/habits/HabitsScreen'
import { TodayHabits } from '../features/habits/TodayHabits'
import { ProgressSection } from '../features/progress/ProgressSection'
import { VitoStage } from '../features/vito/components/VitoStage'

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
  return (
    <Screen title="Today" description="One at a time. Vito grows with every one.">
      <VitoStage />
      <ProgressSection />
      <TodayHabits />
    </Screen>
  )
}

/** Placeholder until Phase 8 lands `features/rewards/ClosetScreen`. */
function ClosetRoute() {
  return (
    <Screen title="Closet" description="Vito's wardrobe.">
      <Card className="text-sm text-slate-600">
        Cosmetics arrive here soon. Keep going — items unlock as Vito grows.
      </Card>
    </Screen>
  )
}

/** Placeholder until Phase 8 lands `features/settings/SettingsScreen`. */
function SettingsRoute() {
  return (
    <Screen title="Settings" description="Your data stays on this device.">
      <Card className="text-sm text-slate-600">Settings arrive here soon.</Card>
    </Screen>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomeRoute />} />
        <Route path="habits" element={<HabitsScreen />} />
        <Route path="closet" element={<ClosetRoute />} />
        <Route path="settings" element={<SettingsRoute />} />
        {/* An unknown URL lands on Today rather than on a dead end. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
