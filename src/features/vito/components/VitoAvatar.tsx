import { useEffect } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import type { EvolutionStage } from '../../../domain/vito/evolution'
import type { Mood } from '../../../domain/vito/mood'
import { useVitoReaction } from '../../../hooks/useVitoReaction'
import { cn } from '../../../utils/cn'
import { idleStateFor, reducedVitoVariants, vitoVariants } from '../animation/variants'
import { MOOD_ALT_TEXT } from '../copy/moodMessages'

/**
 * Vito himself.
 *
 * The drawing is a deliberate placeholder — CSS shapes, no art yet (design's
 * open question on the sprite set). What is NOT a placeholder is the state
 * machine around it: an idle loop chosen from mood, transient reactions
 * broadcast through `uiStore`, and a reduced-motion set that still shows
 * something happened.
 *
 * The quietest state Vito can reach is asleep. There is no frame in this file
 * where he is grey, cracked or stopped.
 */

interface StageLook {
  /** Fixed size per evolution stage, so growing up is visible at a glance. */
  frame: string
  body: string
  sprout: string
  description: string
}

const STAGE_LOOK: Record<EvolutionStage, StageLook> = {
  1: {
    frame: 'size-20',
    body: 'bg-emerald-300',
    sprout: 'bg-emerald-500 h-3',
    description: 'a small sprout',
  },
  2: {
    frame: 'size-24',
    body: 'bg-emerald-400',
    sprout: 'bg-emerald-600 h-4',
    description: 'a growing sprout',
  },
  3: {
    frame: 'size-28',
    body: 'bg-teal-400',
    sprout: 'bg-teal-600 h-5',
    description: 'a leafy companion',
  },
  4: {
    frame: 'size-32',
    body: 'bg-cyan-400',
    sprout: 'bg-cyan-600 h-6',
    description: 'a fully grown companion',
  },
}

/** Eyes shut when Vito is dozing or resting; open and bright otherwise. */
function eyeClass(mood: Mood): string {
  if (mood === 'resting' || mood === 'sleepy') {
    return 'h-0.5 w-3 rounded-full bg-slate-800/80'
  }

  return mood === 'thriving'
    ? 'h-3 w-2.5 rounded-full bg-slate-800/80'
    : 'h-2.5 w-2 rounded-full bg-slate-800/80'
}

function mouthClass(mood: Mood): string {
  switch (mood) {
    case 'thriving':
      return 'h-3 w-7 rounded-b-full bg-slate-800/70'
    case 'happy':
      return 'h-2 w-6 rounded-b-full bg-slate-800/70'
    case 'content':
      return 'h-1.5 w-4 rounded-b-full bg-slate-800/60'
    default:
      // Dozing and resting: a small, settled line rather than a frown.
      return 'h-0.5 w-3 rounded-full bg-slate-800/50'
  }
}

export interface VitoAvatarProps {
  stage: EvolutionStage
  mood: Mood
  /** Today's whole list is done — Vito keeps celebrating until tomorrow. */
  allDone?: boolean
  className?: string
}

export function VitoAvatar({ stage, mood, allDone = false, className }: VitoAvatarProps) {
  const { reaction, prefersReducedMotion, endReaction } = useVitoReaction()
  const controls = useAnimationControls()
  const look = STAGE_LOOK[stage]
  const idleState = idleStateFor({ mood, allDone })
  const variants = prefersReducedMotion ? reducedVitoVariants : vitoVariants

  useEffect(() => {
    if (reaction === null) {
      void controls.start(variants[idleState])

      return
    }

    let live = true

    const play = async () => {
      try {
        await controls.start(variants[reaction.type])
      } catch (error) {
        // Purely cosmetic: a failed animation must never blank the whole app
        // via the boundary. There is no error reporting elsewhere in this
        // codebase, so this is deliberately the same `console.error` level as
        // everything else.
        console.error('Vito failed to play a reaction animation', error)
      } finally {
        // Guarded by the nonce inside `endReaction`, and by `live` here: a
        // reaction that resolves after its component has moved on must not drag
        // the avatar out of whatever it is doing now.
        if (live) {
          endReaction(reaction.nonce)
        }
      }
    }

    void play()

    return () => {
      live = false
    }
  }, [controls, reaction, idleState, variants, endReaction])

  return (
    <div
      className={cn('flex h-40 w-full items-center justify-center', className)}
      // One name for the whole drawing. Without it a screen reader gets a pile
      // of empty decorative spans and learns nothing.
      role="img"
      aria-label={`Vito, ${look.description}, ${MOOD_ALT_TEXT[mood]}`}
    >
      <motion.div animate={controls} className="relative">
        <span
          className={cn(
            'absolute -top-2 left-1/2 w-1.5 -translate-x-1/2 rounded-full',
            look.sprout,
          )}
        />
        <div
          className={cn(
            'relative rounded-[45%] shadow-sm ring-1 ring-black/5',
            look.frame,
            look.body,
          )}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
            <div className="flex items-center gap-2.5">
              <span className={eyeClass(mood)} />
              <span className={eyeClass(mood)} />
            </div>
            <span className={mouthClass(mood)} />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
