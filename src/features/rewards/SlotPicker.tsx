import type { TranslationKey } from '../../i18n/keys'
import { useTranslate } from '../../hooks/useTranslate'
import type { CosmeticSlot } from '../../types/models'
import { cn } from '../../utils/cn'

/**
 * Which part of Vito the closet is showing.
 *
 * Slots are independent by construction — `EquippedItems` is a map, so putting
 * on a hat cannot take off a backpack. This picker is only a filter over the
 * catalog; it never equips or unequips anything.
 *
 * The order here is a reading order, deliberately not `SLOT_RENDER_ORDER`: that
 * one is back-to-front paint order and belongs to the avatar, not to a menu.
 */

interface ClosetSlot {
  slot: CosmeticSlot
  labelKey: TranslationKey
}

const CLOSET_SLOTS: readonly ClosetSlot[] = [
  { slot: 'hat', labelKey: 'closet.slot.hat' },
  { slot: 'backpack', labelKey: 'closet.slot.backpack' },
  { slot: 'aura', labelKey: 'closet.slot.aura' },
]

export interface SlotPickerProps {
  value: CosmeticSlot
  onChange(slot: CosmeticSlot): void
  className?: string
}

export function SlotPicker({ value, onChange, className }: SlotPickerProps) {
  const t = useTranslate()

  return (
    <div
      role="group"
      aria-label={t('closet.slots.label')}
      className={cn('flex gap-2 overflow-x-auto', className)}
    >
      {CLOSET_SLOTS.map((entry) => {
        const selected = entry.slot === value

        return (
          <button
            key={entry.slot}
            type="button"
            aria-pressed={selected}
            onClick={() => {
              onChange(entry.slot)
            }}
            className={cn(
              'min-h-11 shrink-0 rounded-xl px-4 text-sm font-medium transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-2',
              selected
                ? 'bg-emerald-600 text-white focus-visible:outline-emerald-600'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 focus-visible:outline-slate-400',
            )}
          >
            {t(entry.labelKey)}
          </button>
        )
      })}
    </div>
  )
}
