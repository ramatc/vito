import { useEffect } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import { COSMETIC_CATALOG } from '../../../domain/vito/cosmeticCatalog'
import { resolveLayers } from '../../../domain/vito/cosmetics'
import type { EvolutionStage } from '../../../domain/vito/evolution'
import type { Mood } from '../../../domain/vito/mood'
import { useTranslate } from '../../../hooks/useTranslate'
import { useVitoReaction } from '../../../hooks/useVitoReaction'
import { usePreferencesStore } from '../../../stores/preferencesStore'
import type { EquippedItems, Locale } from '../../../types/models'
import { cn } from '../../../utils/cn'
import { COSMETIC_ASSETS } from '../../rewards/cosmeticAssets'
import { cosmeticName } from '../../rewards/cosmeticCopy'
import { reducedVitoVariants, vitoVariants } from '../animation/variants'
import { moodAltText } from '../copy/moodMessages'
import { BODY_ASSETS, FACE_ASSETS } from '../visual/visualAssets'
import { visualStateFor } from '../visual/visualState'

/**
 * Vito himself: the neutral body and face art, layered and animated.
 *
 * The state machine around the art is unchanged from the CSS-shape version it
 * replaces: an idle loop chosen from mood via `visualStateFor`, transient
 * reactions broadcast through `uiStore`, and a reduced-motion set that still
 * shows something happened.
 */

/*
 * `as const satisfies` rather than a plain annotation, and that is load-bearing.
 *
 * This file sits at `features/<feature>/<dir>/<file>`, a depth the ring rule
 * closes to `i18n/`, so it cannot name `TranslationKey`. `as const` keeps each
 * value at its literal type, which `t()` then checks against the real key
 * union at the call site — a typo still fails `tsc -b`, with no import
 * crossing the boundary. Same shape as the `Locale`/`Translate` pair below.
 */
const STAGE_DESCRIPTION_KEY = {
  1: 'vito.stage.1',
  2: 'vito.stage.2',
  3: 'vito.stage.3',
  4: 'vito.stage.4',
} as const satisfies Record<EvolutionStage, string>

/** The translator `useTranslate` hands out — this ring cannot import `i18n/`. */
type Translate = ReturnType<typeof useTranslate>

/**
 * "wearing X and Y", or nothing at all when he is going as himself.
 *
 * Still filtered through the catalog rather than through the layer stack, so
 * the reading order stays catalog order instead of back-to-front paint order.
 */
function wornDescription(
  t: Translate,
  locale: Locale,
  itemIds: readonly string[],
): string {
  const names = COSMETIC_CATALOG.filter((item) => itemIds.includes(item.id)).map((item) =>
    cosmeticName(locale, item.id),
  )

  if (names.length === 0) {
    return ''
  }

  return t('vito.avatar.wearing', { items: names.join(` ${t('common.and')} `) })
}

export interface VitoAvatarProps {
  stage: EvolutionStage
  mood: Mood
  /** Today's whole list is done — Vito keeps celebrating until tomorrow. */
  allDone?: boolean
  /** Cosmetics worn right now. Slots are independent; order is not this map's job. */
  equipped?: EquippedItems
  className?: string
}

export function VitoAvatar({
  stage,
  mood,
  allDone = false,
  equipped = {},
  className,
}: VitoAvatarProps) {
  const { reaction, prefersReducedMotion, endReaction } = useVitoReaction()
  const t = useTranslate()
  // The raw locale as well as the translator: `cosmeticName` takes a `Locale`
  // because its key is assembled from an id, which `useTranslate` deliberately
  // will not accept. Same pair `HabitCard` already holds.
  const locale = usePreferencesStore((state) => state.preferences.locale)
  const controls = useAnimationControls()
  const visualState = visualStateFor({ mood, allDone })
  const variants = prefersReducedMotion ? reducedVitoVariants : vitoVariants
  // Depth comes from the slot's fixed place in `SLOT_RENDER_ORDER`, resolved in
  // the domain. This component never names a slot, which is what lets a fourth
  // one be added as pure data later (design §7).
  const layers = resolveLayers(equipped, COSMETIC_CATALOG)

  useEffect(() => {
    if (reaction === null) {
      void controls.start(variants[visualState.animation])

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
  }, [controls, reaction, visualState.animation, variants, endReaction])

  return (
    <div
      className={cn('flex w-full items-center justify-center', className)}
      // One name for the whole drawing. Without it a screen reader gets a pile
      // of empty decorative images and learns nothing.
      role="img"
      aria-label={`Vito, ${t(STAGE_DESCRIPTION_KEY[stage])}, ${moodAltText(locale, mood)}${wornDescription(
        t,
        locale,
        layers.map((layer) => layer.itemId),
      )}`}
    >
      <motion.div animate={controls} className="relative aspect-square w-48 sm:w-56 md:w-64">
        <img
          src={BODY_ASSETS[visualState.pose]}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-contain"
        />
        <img
          src={FACE_ASSETS[visualState.face]}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-contain"
        />

        {layers.map((layer) => {
          const Asset = COSMETIC_ASSETS[layer.assetRef]

          // A catalog entry whose art has not landed yet is skipped rather than
          // crashed on, the same way `resolveLayers` skips an unknown id.
          if (Asset === undefined) {
            return null
          }

          return (
            <span
              key={layer.slot}
              className="absolute inset-0"
              style={{ zIndex: layer.z }}
            >
              <Asset />
            </span>
          )
        })}
      </motion.div>
    </div>
  )
}
