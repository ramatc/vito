import auraGlow from './assets/aura-glow.png'
import backpackExplorer from './assets/backpack-explorer.png'
import hatSprout from './assets/hat-sprout.png'

/**
 * `assetRef` -> the closet tile's own artwork.
 *
 * Separate from `COSMETIC_ASSETS` (`cosmeticAssets.ts`), which draws a
 * cosmetic positioned against Vito's frame for the equipped view. A tile icon
 * and a worn item are different drawings with different constraints: this one
 * is self-contained (its own margin is baked into the image), so `ItemPreview`
 * never needs to clip or rescale it to fit the tile.
 */
export const COSMETIC_PREVIEW_IMAGES: Record<string, string> = {
  'hat-sprout': hatSprout,
  'backpack-explorer': backpackExplorer,
  'aura-glow': auraGlow,
}
