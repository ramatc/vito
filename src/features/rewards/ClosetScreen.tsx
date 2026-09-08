import { useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Screen } from '../../components/layout/Screen'
import { COSMETIC_CATALOG } from '../../domain/vito/cosmeticCatalog'
import { useTranslate } from '../../hooks/useTranslate'
import { useVito } from '../../hooks/useVito'
import { useUiStore } from '../../stores/uiStore'
import { usePreferencesStore } from '../../stores/preferencesStore'
import { useVitoStore } from '../../stores/vitoStore'
import type { CosmeticSlot, EquippedItems, Locale } from '../../types/models'
import { cosmeticName } from './cosmeticCopy'
import { CosmeticGrid } from './CosmeticGrid'
import { SlotPicker } from './SlotPicker'

/**
 * Vito's wardrobe.
 *
 * The container for this feature: the one file here that meets a store. It
 * reads what is unlocked and worn through `useVito` and writes through
 * `vitoStore.equip`/`unequip`, which validate against the catalog — so the UI
 * never has to decide whether an item is legal, only which ones to offer.
 *
 * Slots are independent on purpose. Equipping a hat writes one key of
 * `EquippedItems` and leaves the others exactly where they were.
 *
 * `preview` is handed down from `ClosetRoute` rather than rendered here: the
 * live avatar is `features/vito`'s `VitoAvatar`, and a nested feature file may
 * not reach into another feature's subdirectory (design §6 / `.oxlintrc.json`).
 * The route is the composition root that is allowed to see both, the same
 * reason `app/routes.tsx` assembles `HomeRoute` from three features directly.
 */

/** What Vito is wearing right now, across every slot, in one line. */
function wornSummary(
  t: ReturnType<typeof useTranslate>,
  locale: Locale,
  equippedItems: EquippedItems,
): string {
  const names = COSMETIC_CATALOG.filter(
    (item) => equippedItems[item.slot] === item.id,
  ).map((item) => cosmeticName(locale, item.id))

  if (names.length === 0) {
    return t('closet.worn.none')
  }

  return t('closet.worn.some', { items: names.join(` ${t('common.and')} `) })
}

export interface ClosetScreenProps {
  /** The live Vito avatar, wearing whatever is currently equipped. */
  preview: ReactNode
}

export function ClosetScreen({ preview }: ClosetScreenProps) {
  const t = useTranslate()
  // The raw locale as well as the translator: `cosmeticName` builds its key
  // from an id, which `useTranslate` deliberately will not accept.
  const locale = usePreferencesStore((state) => state.preferences.locale)
  const { equippedItems, unlockedItemIds } = useVito()
  const [slot, setSlot] = useState<CosmeticSlot>('hat')

  const items = COSMETIC_CATALOG.filter((item) => item.slot === slot)

  const reportSaveError = () => {
    useUiStore.getState().pushToast({ message: t('common.error.save'), tone: 'info' })
  }

  const equip = (itemId: string) => {
    useVitoStore.getState().equip(slot, itemId).catch(reportSaveError)
  }

  const unequip = () => {
    useVitoStore.getState().unequip(slot).catch(reportSaveError)
  }

  return (
    <Screen title={t('closet.title')} description={t('closet.description')}>
      {/*
        `layout` on the stage and everything under it: the worn-summary
        sentence grows from "va como él mismo" to naming three items, and
        without this the height change would shove the picker and grid down
        in one instant jump rather than a smooth reflow.
      */}
      <motion.section
        layout
        transition={{ duration: 0.25, ease: 'easeOut' }}
        aria-label={t('closet.title')}
        className="flex flex-col items-center gap-3 rounded-3xl bg-gradient-to-b from-brand/10 to-surface-raised px-6 pt-7 pb-6 ring-1 ring-brand/20"
      >
        {preview}
        <motion.p layout className="text-center text-sm font-medium text-primary">
          {wornSummary(t, locale, equippedItems)}
        </motion.p>
        <p className="text-center text-xs text-muted">{t('closet.worn.hint')}</p>
      </motion.section>

      <SlotPicker value={slot} onChange={setSlot} />

      <CosmeticGrid
        items={items}
        unlockedItemIds={unlockedItemIds}
        equippedItemId={equippedItems[slot]}
        onEquip={equip}
        onUnequip={unequip}
      />
    </Screen>
  )
}
