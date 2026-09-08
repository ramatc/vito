import { motion } from 'framer-motion'
import { Check, Lock } from 'lucide-react'
import { useTranslate } from '../../hooks/useTranslate'
import type { TranslationKey } from '../../i18n/keys'
import { usePreferencesStore } from '../../stores/preferencesStore'
import type { CosmeticItem, CosmeticSlot, EquippedItems } from '../../types/models'
import { cn } from '../../utils/cn'
import { cosmeticName } from './cosmeticCopy'
import { COSMETIC_PREVIEW_IMAGES } from './cosmeticPreviewImages'

type Translate = ReturnType<typeof useTranslate>

/**
 * One slot's worth of the catalog, as a grid of tiles: what is earned, what is
 * worn, and what is still ahead.
 *
 * Presentational — it takes items and ids and reports taps. Whether an item is
 * unlocked was decided in `domain/vito/cosmetics`, and whether it can be
 * equipped is `vitoStore`'s call; this file only draws the answer.
 *
 * A locked tile is shown rather than hidden, and it states its threshold
 * plainly. Nothing here scolds: a threshold is a destination, not a shortfall.
 */

const RARITY_LABEL_KEYS: Record<CosmeticItem['rarity'], TranslationKey> = {
  common: 'closet.rarity.common',
  rare: 'closet.rarity.rare',
  legendary: 'closet.rarity.legendary',
}

/**
 * One key per requirement type rather than one sentence with a slot for the
 * unit: "a 7-day streak" and "2000 XP" are not the same sentence in Spanish,
 * and a translator must be free to rebuild each one whole.
 */
const UNLOCK_LABEL_KEYS: Record<
  CosmeticItem['unlockRequirement']['type'],
  TranslationKey
> = {
  level: 'closet.unlock.level',
  xp: 'closet.unlock.xp',
  streak: 'closet.unlock.streak',
}

function unlockLabel(t: Translate, item: CosmeticItem): string {
  return t(UNLOCK_LABEL_KEYS[item.unlockRequirement.type], {
    value: item.unlockRequirement.value,
  })
}

/**
 * The item on its own, the way the tile shows it — unlike `VitoAvatar`, which
 * draws the same cosmetic positioned against Vito's frame, this preview has no
 * body to hang a hat or backpack off of. Its artwork
 * (`cosmeticPreviewImages.ts`) is a self-contained icon with its own margin
 * baked in, so it is never clipped or rescaled here.
 */
function ItemPreview({ assetRef, dimmed }: { assetRef: string; dimmed: boolean }) {
  const previewSrc = COSMETIC_PREVIEW_IMAGES[assetRef]

  return (
    <span
      className={cn(
        'flex size-14 shrink-0 items-center justify-center rounded-[45%] bg-brand/20',
        dimmed && 'opacity-40 grayscale dark:opacity-100',
      )}
    >
      {previewSrc !== undefined && (
        <img src={previewSrc} alt="" className="size-10 object-contain" />
      )}
    </span>
  )
}

export interface CosmeticGridProps {
  items: readonly CosmeticItem[]
  unlockedItemIds: readonly string[]
  /** What is worn across every slot — a single id is not enough once the grid
   * can mix slots ("all items"), where a hat and a backpack are both worn at once. */
  equippedItems: EquippedItems
  onEquip(item: CosmeticItem): void
  onUnequip(slot: CosmeticSlot): void
}

export function CosmeticGrid({
  items,
  unlockedItemIds,
  equippedItems,
  onEquip,
  onUnequip,
}: CosmeticGridProps) {
  const t = useTranslate()
  const locale = usePreferencesStore((state) => state.preferences.locale)

  return (
    <motion.ul
      layout
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="grid grid-cols-2 gap-3 sm:grid-cols-3"
    >
      {items.map((item) => {
        const unlocked = unlockedItemIds.includes(item.id)
        const equipped = item.id === equippedItems[item.slot]

        const tileClassName = cn(
          'flex min-h-[152px] w-full flex-col items-center justify-between gap-2 rounded-2xl p-3.5 text-center transition-colors',
          !unlocked && 'border border-dashed border-border opacity-60',
          unlocked &&
            (equipped
              ? 'bg-brand/10 ring-2 ring-brand'
              : 'bg-surface-raised ring-1 ring-border hover:bg-surface-sunken'),
        )

        const tileContent = (
          <>
            <div className="flex w-full items-center justify-between text-[10px] font-semibold text-muted">
              <span>{t(RARITY_LABEL_KEYS[item.rarity])}</span>
              {equipped && (
                <span className="flex items-center gap-0.5 rounded-md bg-brand px-1.5 py-0.5 font-bold text-on-brand">
                  <Check className="size-2.5" strokeWidth={3} />
                </span>
              )}
            </div>

            <ItemPreview assetRef={item.assetRef} dimmed={!unlocked} />

            <div className="w-full min-w-0">
              <p className="truncate text-xs font-bold text-primary">
                {cosmeticName(locale, item.id)}
              </p>

              {unlocked ? (
                <p
                  className={cn(
                    'mt-1 text-[11px] font-semibold',
                    equipped ? 'text-brand' : 'text-muted',
                  )}
                >
                  {equipped ? t('closet.item.worn') : t('closet.item.wear')}
                </p>
              ) : (
                <p className="mt-1 flex items-center justify-center gap-1 text-[10px] text-muted">
                  <Lock className="size-2.5 shrink-0" />
                  {unlockLabel(t, item)}
                </p>
              )}
            </div>
          </>
        )

        // A locked tile offers nothing to activate, so it is a `div`, not a
        // disabled button: a control with no action is not a control (a
        // screen reader user gets a label, not a dead button to puzzle over).
        if (!unlocked) {
          return (
            <li key={item.id}>
              <div className={tileClassName}>{tileContent}</div>
            </li>
          )
        }

        return (
          <li key={item.id}>
            <button
              type="button"
              // One control per item: tapping the worn one takes it off, so a
              // slot never needs a separate remove button hidden somewhere else.
              aria-pressed={equipped}
              onClick={() => {
                if (equipped) {
                  onUnequip(item.slot)

                  return
                }

                onEquip(item)
              }}
              className={cn(tileClassName, 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand')}
            >
              {tileContent}
            </button>
          </li>
        )
      })}
    </motion.ul>
  )
}
