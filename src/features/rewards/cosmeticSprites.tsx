import { cn } from '../../utils/cn'

/**
 * The drawings themselves.
 *
 * CSS placeholders in the same spirit as Vito's own body — the real art is an
 * open question the design could not resolve, and none of the code around them
 * cares which it is. Each sprite fills the box it is handed and positions its
 * own parts, so the same component works layered over the avatar and previewed
 * on a tile in the closet without either caller knowing what a hat is.
 *
 * Separated from `cosmeticAssets.ts` so that file exports only the map: a
 * module that mixes components with a plain constant export breaks fast
 * refresh, which is what `react/only-export-components` is warning about.
 */

export interface CosmeticAssetProps {
  className?: string
}

/** Every sprite fills its container and stays out of the way of pointer events. */
const LAYER = 'pointer-events-none absolute inset-0 block'

export function SproutCap({ className }: CosmeticAssetProps) {
  return (
    <span className={cn(LAYER, className)} aria-hidden="true">
      <span className="absolute -top-1.5 left-1/2 h-2 w-10 -translate-x-1/2 rounded-full bg-emerald-700" />
      <span className="absolute -top-4 left-1/2 h-3.5 w-6 -translate-x-1/2 rounded-t-full bg-emerald-600" />
    </span>
  )
}

export function ExplorerPack({ className }: CosmeticAssetProps) {
  return (
    <span className={cn(LAYER, className)} aria-hidden="true">
      <span className="absolute top-1/4 -right-2.5 h-8 w-5 rounded-lg bg-amber-700 ring-1 ring-amber-900/20" />
      <span className="absolute top-[42%] -right-1.5 h-1.5 w-3 rounded-full bg-amber-200" />
    </span>
  )
}

export function WarmGlow({ className }: CosmeticAssetProps) {
  return (
    <span className={cn(LAYER, className)} aria-hidden="true">
      <span className="absolute -inset-2.5 rounded-[45%] bg-amber-300/25" />
      <span className="absolute -inset-1 rounded-[45%] ring-2 ring-amber-300/70" />
    </span>
  )
}
