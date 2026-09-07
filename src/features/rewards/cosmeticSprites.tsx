import { cn } from '../../utils/cn'
import auraGlow from './assets/aura-glow-layer.png'
import backpackExplorer from './assets/backpack-explorer-layer.png'
import hatSprout from './assets/hat-sprout-layer.png'

/**
 * The drawings themselves.
 *
 * Real art (`./assets/*-layer.png`), sharing the exact canvas and coordinate
 * system as `body-neutral.png` and the face art in `features/vito/assets`, so
 * every layer fills its box with plain `inset-0`/`object-contain` — no
 * per-cosmetic offset, scale, or transform. The `-layer` suffix keeps these
 * distinct from this same folder's `*.png` closet-tile previews
 * (`cosmeticPreviewImages.ts`), a different drawing with different
 * constraints. Each sprite fills the box it is handed, so the same component
 * works layered over the avatar and previewed on a tile in the closet without
 * either caller knowing what a hat is.
 *
 * Separated from `cosmeticAssets.ts` so that file exports only the map: a
 * module that mixes components with a plain constant export breaks fast
 * refresh, which is what `react/only-export-components` is warning about.
 */

export interface CosmeticAssetProps {
  className?: string
}

/** Every sprite fills its container, stays out of the way of pointer events, and never distorts. */
const LAYER = 'pointer-events-none absolute inset-0 h-full w-full object-contain'

export function SproutCap({ className }: CosmeticAssetProps) {
  return <img src={hatSprout} alt="" aria-hidden="true" className={cn(LAYER, className)} />
}

export function ExplorerPack({ className }: CosmeticAssetProps) {
  return <img src={backpackExplorer} alt="" aria-hidden="true" className={cn(LAYER, className)} />
}

export function WarmGlow({ className }: CosmeticAssetProps) {
  return <img src={auraGlow} alt="" aria-hidden="true" className={cn(LAYER, className)} />
}
