import type { ComponentType } from 'react'
import type { CosmeticAssetProps } from './cosmeticSprites'
import { ExplorerPack, SproutCap, WarmGlow } from './cosmeticSprites'

/**
 * `assetRef` -> the thing that draws it (design §7).
 *
 * The domain catalog stores a string key, never an import, so the pure ring
 * never reaches for a bundler asset. This map is the one place the two sides
 * meet: adding a cosmetic is a catalog entry, a sprite, and one line here.
 *
 * Deliberately data only. An unknown key is simply absent, and both callers —
 * the avatar's layer stack and the closet's tile — handle that by drawing
 * nothing rather than by crashing.
 */
export const COSMETIC_ASSETS: Record<string, ComponentType<CosmeticAssetProps>> = {
  'hat-sprout': SproutCap,
  'backpack-explorer': ExplorerPack,
  'aura-glow': WarmGlow,
}
