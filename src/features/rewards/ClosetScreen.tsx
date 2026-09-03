import { useState } from 'react'
import { Screen } from '../../components/layout/Screen'
import { Card } from '../../components/ui/Card'
import { COSMETIC_CATALOG } from '../../domain/vito/cosmeticCatalog'
import { useTranslate } from '../../hooks/useTranslate'
import { useVito } from '../../hooks/useVito'
import { useUiStore } from '../../stores/uiStore'
import { useVitoStore } from '../../stores/vitoStore'
import type { CosmeticSlot, EquippedItems } from '../../types/models'
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
 */

/** What Vito is wearing right now, across every slot, in one line. */
function wornSummary(equippedItems: EquippedItems): string {
  const names = COSMETIC_CATALOG.filter(
    (item) => equippedItems[item.slot] === item.id,
  ).map((item) => item.name)

  if (names.length === 0) {
    return 'Vito is going as himself today.'
  }

  return `Vito is wearing ${names.join(' and ')}.`
}

export function ClosetScreen() {
  // The rest of this screen's copy is still English literals — PR5 sweeps them.
  // This one moved early because the constant it used to read lived in a hook
  // the habits slice owns, and that hook now speaks the active language.
  const t = useTranslate()
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
    <Screen
      title="Closet"
      description="Everything Vito has earned. Wear what you like — nothing is ever used up."
    >
      <Card className="text-sm text-slate-600">
        <p>{wornSummary(equippedItems)}</p>
        <p className="mt-1 text-xs text-slate-500">
          He wears it on the Today screen. Each slot is separate, so a new hat keeps
          everything else on.
        </p>
      </Card>

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
