import { Check, Lock } from 'lucide-react'
import { usePreferencesStore } from '../../stores/preferencesStore'
import type { CosmeticItem } from '../../types/models'
import { cn } from '../../utils/cn'
import { COSMETIC_ASSETS } from './cosmeticAssets'
import { cosmeticName } from './cosmeticCopy'

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

const RARITY_LABEL: Record<CosmeticItem['rarity'], string> = {
  common: 'Common',
  rare: 'Rare',
  legendary: 'Legendary',
}

const UNLOCK_LABEL: Record<
  CosmeticItem['unlockRequirement']['type'],
  (value: number) => string
> = {
  level: (value) => `Unlocks at level ${String(value)}`,
  xp: (value) => `Unlocks at ${String(value)} XP`,
  streak: (value) => `Unlocks with a ${String(value)}-day streak`,
}

function unlockLabel(item: CosmeticItem): string {
  return UNLOCK_LABEL[item.unlockRequirement.type](item.unlockRequirement.value)
}

/**
 * The item drawn the way it will actually look: over a stand-in for Vito's
 * body, so a hat reads as a hat rather than as two floating rectangles.
 */
function ItemPreview({ assetRef }: { assetRef: string }) {
  const Asset = COSMETIC_ASSETS[assetRef]

  return (
    <span className="relative size-12 shrink-0 rounded-[45%] bg-emerald-200/70">
      {Asset !== undefined && <Asset />}
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
              className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200"
            >
              <span className="opacity-40 grayscale">
                <ItemPreview assetRef={item.assetRef} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-slate-900">
                  {cosmeticName(locale, item.id)}
                </span>
                <span className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                  <Lock className="size-3 shrink-0" />
                  {unlockLabel(item)}
                </span>
                <span className="mt-0.5 block text-xs text-slate-400">
                  {RARITY_LABEL[item.rarity]}
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
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600',
                equipped
                  ? 'bg-emerald-50 ring-2 ring-emerald-500'
                  : 'bg-white ring-1 ring-slate-200 hover:bg-slate-50',
              )}
            >
              <ItemPreview assetRef={item.assetRef} />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-slate-900">
                  {cosmeticName(locale, item.id)}
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {RARITY_LABEL[item.rarity]}
                </span>
                <span
                  className={cn(
                    'mt-0.5 flex items-center gap-1 text-xs font-medium',
                    equipped ? 'text-emerald-700' : 'text-slate-400',
                  )}
                >
                  {equipped && <Check className="size-3 shrink-0" />}
                  {equipped ? 'Worn — tap to take off' : 'Tap to wear'}
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
