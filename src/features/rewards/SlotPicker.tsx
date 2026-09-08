import { motion } from 'framer-motion'
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
    <motion.div
      layout
      transition={{ duration: 0.25, ease: 'easeOut' }}
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
              // Byte-identical to `Button`'s primary/secondary pairs, and to
              // `LanguageToggle`/`ThemeToggle`, which copy this control: the
              // three are the same segmented button and must not drift apart.
              selected
                ? 'bg-brand text-on-brand focus-visible:outline-brand'
                : 'bg-surface-raised text-muted ring-1 ring-border hover:bg-surface-sunken focus-visible:outline-border',
            )}
          >
            {t(entry.labelKey)}
          </button>
        )
      })}
    </motion.div>
  )
}
