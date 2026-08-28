import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { Screen } from '../components/layout/Screen'
import { Card } from '../components/ui/Card'
import { HabitsScreen } from '../features/habits/HabitsScreen'
import { TodayHabits } from '../features/habits/TodayHabits'

/**
 * The app's four surfaces, all nested inside `AppShell` so navigation is part of
 * the layout rather than something each screen repeats.
 */

/**
 * Home. Phase 7 replaces this body with the Vito hero and the progress section
 * above the same `TodayHabits` block — the route itself does not change.
 */
function HomeRoute() {
  return (
    <Screen title="Today" description="One at a time. Vito grows with every one.">
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
