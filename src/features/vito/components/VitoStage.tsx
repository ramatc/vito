import { useProgress } from '../../../hooks/useProgress'
import { useVito } from '../../../hooks/useVito'
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
  const message = moodMessage({ mood, allDone, boosted: boostActive })

  return (
    <section
      aria-label="Vito"
      className="flex flex-col items-center gap-2 rounded-3xl bg-gradient-to-b from-emerald-50 to-white px-4 pt-2 pb-5 ring-1 ring-emerald-100 dark:from-emerald-500/10 dark:to-surface-raised dark:ring-emerald-500/20"
    >
      <VitoAvatar stage={stage} mood={mood} allDone={allDone} equipped={equippedItems} />
      <MoodBubble headline={message.headline} body={message.body} />
    </section>
  )
}
