import React, { useMemo } from 'react'
import { useSizeCalculations } from '../../hooks/useSizeCalculations'
import { useKeypad } from '../../hooks/useKeypad'
import { useSizeUpdates } from '../../hooks/useSizeUpdates'
import { Keypad } from '../Keypad/index'
import { ModalTitle } from './ModalTitle'
import { SizeGrid } from './SizeGrid'
import { TotalSection } from './TotalSection'
import { ModalActions } from './ModalActions'
import { ToppingsInput } from './ToppingsInput'

export function SizeModal({
  product,
  sizes,
  sizeState,
  onUpdateSize,
  onConfirm,
  onCancel,
  activeSizeId = null,
}) {
  // Hooks personalizados
  const { formatMoney, getSizeSubtotal, getRowSubtotal, getTotalGeneral } =
    useSizeCalculations()

  const { handleQuantityChange, handleGlobalDeliveryChange, handleRowPatch } =
    useSizeUpdates({ sizeState, onUpdateSize })

  const {
    activeField,
    showKeypad,
    getFieldValue,
    handleKeypadPress,
    openKeypad,
    closeKeypad,
  } = useKeypad({ sizeState, onUpdateSize })

  // Datos calculados con memoización
  const visibleSizes = useMemo(
    () => (activeSizeId ? sizes.filter((s) => s.id === activeSizeId) : sizes),
    [activeSizeId, sizes]
  )

  const totalGeneral = useMemo(
    () => getTotalGeneral(visibleSizes, sizeState),
    [visibleSizes, sizeState, getTotalGeneral]
  )

  // Renderiza el display de toppings usando componente reutilizable
  const renderToppingsDisplay = (field, value) => (
    <ToppingsInput
      field={field}
      value={value}
      activeField={activeField}
      onOpenKeypad={openKeypad}
    />
  )

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <ModalTitle
          productName={product.name}
          productFeature={product.caracteristica}
        />

        <SizeGrid
          sizes={visibleSizes}
          sizeState={sizeState}
          onQuantityChange={handleQuantityChange}
          onGlobalDeliveryChange={handleGlobalDeliveryChange}
          onRowPatch={handleRowPatch}
          renderToppingsDisplay={renderToppingsDisplay}
          formatMoney={formatMoney}
          getSizeSubtotal={getSizeSubtotal}
          getRowSubtotal={getRowSubtotal}
        />

        {showKeypad && (
          <Keypad
            activeField={activeField}
            getFieldValue={getFieldValue}
            onKeyPress={handleKeypadPress}
            onClose={closeKeypad}
          />
        )}

        <TotalSection total={totalGeneral} formatMoney={formatMoney} />

        <ModalActions
          onCancel={onCancel}
          onConfirm={onConfirm}
          isConfirmDisabled={totalGeneral === 0}
        />
      </div>
    </div>
  )
}
