import { useState, type ReactNode } from 'react'
import { Screen } from '../../components/layout/Screen'
import { COSMETIC_CATALOG } from '../../domain/vito/cosmeticCatalog'
import { useTranslate } from '../../hooks/useTranslate'
import { useVito } from '../../hooks/useVito'
import { useUiStore } from '../../stores/uiStore'
import { usePreferencesStore } from '../../stores/preferencesStore'
import { useVitoStore } from '../../stores/vitoStore'
import type { CosmeticItem, CosmeticSlot, EquippedItems, Locale } from '../../types/models'
import { cosmeticName } from './cosmeticCopy'
import { CosmeticGrid } from './CosmeticGrid'
import { SlotPicker, type ClosetFilter } from './SlotPicker'

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
  const [filter, setFilter] = useState<ClosetFilter>('all')

  const items =
    filter === 'all'
      ? COSMETIC_CATALOG
      : COSMETIC_CATALOG.filter((item) => item.slot === filter)

  const reportSaveError = () => {
    useUiStore.getState().pushToast({ message: t('common.error.save'), tone: 'info' })
  }

  const equip = (item: CosmeticItem) => {
    useVitoStore.getState().equip(item.slot, item.id).catch(reportSaveError)
  }

  const unequip = (slot: CosmeticSlot) => {
    useVitoStore.getState().unequip(slot).catch(reportSaveError)
  }

  return (
    <Screen title={t('closet.title')} description={t('closet.description')}>
      {/*
        The worn-summary sentence grows from "va como él mismo" to naming
        three items. Rather than animate that reflow, the paragraph reserves
        two lines' worth of height up front so the picker and grid below never
        move at all, animated or not.
      */}
      <section
        aria-label={t('closet.title')}
        className="flex flex-col items-center gap-3 rounded-3xl bg-gradient-to-b from-brand/10 to-surface-raised px-6 pt-7 pb-6 ring-1 ring-brand/20"
      >
        {preview}
        <p className="flex min-h-10 items-center text-center text-sm font-medium text-primary">
          {wornSummary(t, locale, equippedItems)}
        </p>
        <p className="text-center text-xs text-muted">{t('closet.worn.hint')}</p>
      </section>

      <SlotPicker value={filter} onChange={setFilter} />

      <CosmeticGrid
        items={items}
        unlockedItemIds={unlockedItemIds}
        equippedItems={equippedItems}
        onEquip={equip}
        onUnequip={unequip}
      />
    </Screen>
  )
}
