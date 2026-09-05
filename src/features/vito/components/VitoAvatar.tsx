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
  /** Dictionary key for the stage, not the words — see the `as const` below. */
  descriptionKey: string
}

/*
 * `as const satisfies` rather than a plain annotation, and that is load-bearing.
 *
 * This file sits at `features/<feature>/<dir>/<file>`, a depth the ring rule
 * closes to `i18n/`, so it cannot name `TranslationKey`. `as const` keeps each
 * `descriptionKey` at its literal type, which `t()` then checks against the real
 * key union at the call site — a typo still fails `tsc -b`, with no import
 * crossing the boundary. Same shape as the `Locale`/`Translate` pair below.
 */
const STAGE_LOOK = {
  1: {
    frame: 'size-20',
    body: 'bg-emerald-300',
    sprout: 'bg-emerald-500 h-3',
    descriptionKey: 'vito.stage.1',
  },
  2: {
    frame: 'size-24',
    body: 'bg-emerald-400',
    sprout: 'bg-emerald-600 h-4',
    descriptionKey: 'vito.stage.2',
  },
  3: {
    frame: 'size-28',
    body: 'bg-teal-400',
    sprout: 'bg-teal-600 h-5',
    descriptionKey: 'vito.stage.3',
  },
  4: {
    frame: 'size-32',
    body: 'bg-cyan-400',
    sprout: 'bg-cyan-600 h-6',
    descriptionKey: 'vito.stage.4',
  },
} as const satisfies Record<EvolutionStage, StageLook>

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
  const look = STAGE_LOOK[stage]
  const idleState = idleStateFor({ mood, allDone })
  const variants = prefersReducedMotion ? reducedVitoVariants : vitoVariants
  // Depth comes from the slot's fixed place in `SLOT_RENDER_ORDER`, resolved in
  // the domain. This component never names a slot, which is what lets a fourth
  // one be added as pure data later (design §7).
  const layers = resolveLayers(equipped, COSMETIC_CATALOG)

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
      /*
       * The whole drawing is dimmed and desaturated as one, rather than every
       * shape being repainted shade by shade.
       *
       * This is the mechanical treatment the proposal caps this cycle at: the
       * art is an acknowledged placeholder, and a hand-tuned dark palette for
       * CSS shapes that are going to be replaced would be work thrown away. A
       * filter on the frame also reaches the cosmetics for free, which is the
       * part a per-shape pass would have missed — their sprites live in
       * `features/rewards/`, not here. Re-raise if it reads poorly at 375px.
       */
      className={cn(
        'flex h-40 w-full items-center justify-center',
        'dark:brightness-90 dark:saturate-75',
        className,
      )}
      // One name for the whole drawing. Without it a screen reader gets a pile
      // of empty decorative spans and learns nothing.
      role="img"
      aria-label={`Vito, ${t(look.descriptionKey)}, ${MOOD_ALT_TEXT[mood]}${wornDescription(
        t,
        locale,
        layers.map((layer) => layer.itemId),
      )}`}
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
            // The hairline is a shadow in light and a rim light in dark: black
            // on a dark page draws nothing at all.
            'relative rounded-[45%] shadow-sm ring-1 ring-black/5 dark:ring-white/10',
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
