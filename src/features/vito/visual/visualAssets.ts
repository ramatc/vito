import type { VitoFace, VitoPose } from './visualState'
import bodyNeutral from '../assets/body-neutral.png'
import bodyCelebrating from '../assets/body-celebrating.png'
import faceNeutral from '../assets/face-neutral.png'
import faceHappy from '../assets/face-happy.png'
import faceThriving from '../assets/face-thriving.png'
import faceTired from '../assets/face-tired.png'
import faceSleeping from '../assets/face-sleeping.png'

/**
 * `VitoPose` / `VitoFace` -> the artwork drawn for it.
 *
 * Kept exhaustive on purpose — a new `VitoPose`/`VitoFace` member fails
 * `tsc -b` here until this map accounts for it.
 */
export const BODY_ASSETS: Record<VitoPose, string> = {
  neutral: bodyNeutral,
  tired: bodyNeutral,
  celebrating: bodyCelebrating,
}

export const FACE_ASSETS: Record<VitoFace, string> = {
  neutral: faceNeutral,
  happy: faceHappy,
  thriving: faceThriving,
  tired: faceTired,
  sleeping: faceSleeping,
}
