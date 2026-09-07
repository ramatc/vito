import type { VitoFace, VitoPose } from './visualState'
import bodyNeutral from '../assets/body-neutral.png'
import faceNeutral from '../assets/face-neutral.png'
import faceHappy from '../assets/face-happy.png'
import faceThriving from '../assets/face-thriving.png'
import faceTired from '../assets/face-tired.png'
import faceSleeping from '../assets/face-sleeping.png'

/**
 * `VitoPose` / `VitoFace` -> the artwork drawn for it.
 *
 * Only the neutral body exists so far, so every `VitoPose` key intentionally
 * points at the same file rather than being left out: adding a pose later is
 * swapping one value here, nothing else (design's "FUTURO"). Kept exhaustive
 * on purpose — a new `VitoPose`/`VitoFace` member fails `tsc -b` here until
 * this map accounts for it.
 */
export const BODY_ASSETS: Record<VitoPose, string> = {
  neutral: bodyNeutral,
  tired: bodyNeutral,
  celebrating: bodyNeutral,
}

export const FACE_ASSETS: Record<VitoFace, string> = {
  neutral: faceNeutral,
  happy: faceHappy,
  thriving: faceThriving,
  tired: faceTired,
  sleeping: faceSleeping,
}
