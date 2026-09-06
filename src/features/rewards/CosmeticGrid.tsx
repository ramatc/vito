import { Check, Lock } from 'lucide-react'
import { useTranslate } from '../../hooks/useTranslate'
import type { TranslationKey } from '../../i18n/keys'
import { usePreferencesStore } from '../../stores/preferencesStore'
import type { CosmeticItem } from '../../types/models'
import { cn } from '../../utils/cn'
import { cosmeticName } from './cosmeticCopy'
import { COSMETIC_PREVIEW_IMAGES } from './cosmeticPreviewImages'

type Translate = ReturnType<typeof useTranslate>

/**
 * One slot's worth of the catalog: what is earned, what is worn, and what is
 * still ahead.
 *
 * Presentational — it takes items and ids and reports taps. Whether an item is
 * unlocked was decided in `domain/vito/cosmetics`, and whether it can be
 * equipped is `vitoStore`'s call; this file only draws the answer.
 *
 * A locked item is shown rather than hidden, and it states its threshold
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
 * The item on its own, the way the closet lists it — unlike `VitoAvatar`,
 * which draws the same cosmetic positioned against Vito's frame, this tile
 * has no body to hang a hat or backpack off of. Its artwork
 * (`cosmeticPreviewImages.ts`) is a self-contained icon with its own margin
 * baked in, so it is never clipped or rescaled here.
 */
function ItemPreview({ assetRef }: { assetRef: string }) {
  const previewSrc = COSMETIC_PREVIEW_IMAGES[assetRef]

  return (
    <span className="flex size-12 shrink-0 items-center justify-center rounded-[45%] bg-emerald-200/70 dark:bg-emerald-500/25 dark:brightness-90 dark:saturate-75">
      {previewSrc !== undefined && (
        <img src={previewSrc} alt="" className="size-9 object-contain" />
      )}
    </span>
  )
}

export interface CosmeticGridProps {
  items: readonly CosmeticItem[]
  unlockedItemIds: readonly string[]
  /** The item worn in this slot right now, if any. */
  equippedItemId?: string
  onEquip(itemId: string): void
  onUnequip(): void
}

export function CosmeticGrid({
  items,
  unlockedItemIds,
  equippedItemId,
  onEquip,
  onUnequip,
}: CosmeticGridProps) {
  const t = useTranslate()
  const locale = usePreferencesStore((state) => state.preferences.locale)

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((item) => {
        const unlocked = unlockedItemIds.includes(item.id)
        const equipped = item.id === equippedItemId

        if (!unlocked) {
          return (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200 dark:bg-surface-raised dark:ring-slate-700"
            >
              <span className="opacity-40 grayscale dark:opacity-100">
                <ItemPreview assetRef={item.assetRef} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-slate-900 dark:text-primary">
                  {cosmeticName(locale, item.id)}
                </span>
                <span className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 dark:text-muted">
                  <Lock className="size-3 shrink-0" />
                  {unlockLabel(t, item)}
                </span>
                <span className="mt-0.5 block text-xs text-slate-400 dark:text-slate-500">
                  {t(RARITY_LABEL_KEYS[item.rarity])}
                </span>
              </span>
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
                  onUnequip()

                  return
                }

                onEquip(item.id)
              }}
              className={cn(
                'flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:focus-visible:outline-brand',
                equipped
                  ? 'bg-emerald-50 ring-2 ring-emerald-500 dark:bg-emerald-500/15 dark:ring-brand'
                  : 'bg-white ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-surface-raised dark:ring-slate-700 dark:hover:bg-slate-700',
              )}
            >
              <ItemPreview assetRef={item.assetRef} />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-slate-900 dark:text-primary">
                  {cosmeticName(locale, item.id)}
                </span>
                <span className="mt-0.5 block text-xs text-slate-500 dark:text-muted">
                  {t(RARITY_LABEL_KEYS[item.rarity])}
                </span>
                <span
                  className={cn(
                    'mt-0.5 flex items-center gap-1 text-xs font-medium',
                    equipped
                      ? 'text-emerald-700 dark:text-brand'
                      : 'text-slate-400 dark:text-slate-500',
                  )}
                >
                  {equipped && <Check className="size-3 shrink-0" />}
                  {equipped ? t('closet.item.worn') : t('closet.item.wear')}
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
