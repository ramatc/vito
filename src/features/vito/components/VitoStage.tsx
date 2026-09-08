import { useProgress } from '../../../hooks/useProgress'
import { useVito } from '../../../hooks/useVito'
import { usePreferencesStore } from '../../../stores/preferencesStore'
import { moodMessage } from '../copy/moodMessages'
import { MoodBubble } from './MoodBubble'
import { VitoAvatar } from './VitoAvatar'

/**
 * The hero: Vito, and the one thing he has to say right now.
 *
 * The only file in this feature that touches a store — through the derivation
 * hooks, which are the single place where `deriveMood`, `getEvolutionStage` and
 * the XP curve are allowed to be called from the UI side (design §6). Everything
 * below it takes props.
 */
export function VitoStage() {
  const { mood, stage, allDone, equippedItems } = useVito()
  const { boostActive } = useProgress()
  const locale = usePreferencesStore((state) => state.preferences.locale)
  const message = moodMessage(locale, { mood, allDone, boosted: boostActive })

  return (
    <section
      aria-label="Vito"
      className="flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-b from-brand/10 to-surface-raised px-6 pt-7 pb-6 ring-1 ring-brand/20"
    >
      <VitoAvatar stage={stage} mood={mood} allDone={allDone} equipped={equippedItems} />
      <MoodBubble headline={message.headline} body={message.body} />
    </section>
  )
}
