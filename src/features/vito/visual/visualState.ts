import type { Mood } from '../../../domain/vito/mood'
import type { VitoIdleState } from '../animation/variants'

/**
 * Which body-pose and face art the avatar should show.
 *
 * `pose` and `animation` are derived from the same signal and always move
 * together — `pose` names the still image, `animation` names the motion loop
 * from `vitoVariants` that plays over it. They stay separate fields because
 * the two rings that consume them (image layer vs. motion controls) never
 * need to know about the other's vocabulary.
 */
export type VitoPose = 'neutral' | 'tired' | 'celebrating'

/** One face per `Mood`, so every mood is always representable. */
export type VitoFace = 'neutral' | 'happy' | 'thriving' | 'tired' | 'sleeping'

export interface VisualStateInput {
  mood: Mood
  allDone: boolean
}

export interface VisualState {
  pose: VitoPose
  face: VitoFace
  animation: VitoIdleState
}

const FACE_BY_MOOD: Record<Mood, VitoFace> = {
  thriving: 'thriving',
  happy: 'happy',
  content: 'neutral',
  sleepy: 'tired',
  resting: 'sleeping',
}

/**
 * The avatar's full visual state: which face, which pose, which loop.
 *
 * Priority mirrors `idleStateFor`, which this replaces once the image layers
 * land: `allDone` beats mood, and only the quiet moods drop to the tired
 * pose. The face never depends on `allDone` — finishing the day changes what
 * Vito is doing, not how he currently feels.
 */
export function visualStateFor(input: VisualStateInput): VisualState {
  const face = FACE_BY_MOOD[input.mood]

  if (input.allDone) {
    return { pose: 'celebrating', face, animation: 'cheer' }
  }

  if (input.mood === 'resting' || input.mood === 'sleepy') {
    return { pose: 'tired', face, animation: 'resting' }
  }

  return { pose: 'neutral', face, animation: 'idle' }
}
