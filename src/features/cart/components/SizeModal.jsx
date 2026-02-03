import React from 'react'
import PropTypes from 'prop-types'
import { useSizeCalculations } from '../hooks/useSizeCalculations'
import { useKeypad } from '../hooks/useKeypad'
import { useSizeUpdates } from '../hooks/useSizeUpdates'
import { Keypad } from './Keypad'
import { SizeCard } from './SizeCard'

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

  // Datos calculados
  const visibleSizes = activeSizeId
    ? sizes.filter((s) => s.id === activeSizeId)
    : sizes

  const totalGeneral = getTotalGeneral(visibleSizes, sizeState)

  // Renderiza el display de toppings (reutilizable)
  const renderToppingsDisplay = (field, value) => (
    <button
      className={`input ${
        activeField &&
        activeField.type === field.type &&
        activeField.sizeId === field.sizeId &&
        activeField.index === field.index
          ? 'input-active'
          : ''
      }`}
      data-testid={
        field.type === 'global'
          ? `toppings-global-${field.sizeId}`
          : `toppings-row-${field.sizeId}-${field.index}`
      }
      onClick={() => openKeypad(field)}
      type="button"
      aria-pressed={
        activeField &&
        activeField.type === field.type &&
        activeField.sizeId === field.sizeId &&
        activeField.index === field.index
      }
    >
      {value}
    </button>
  )

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2 className="modal-title">
          {product.name} {product.caracteristica}
        </h2>

        <div className="size-grid">
          {visibleSizes.map((size) => (
            <SizeCard
              key={size.id}
              size={size}
              sizeState={sizeState}
              onQuantityChange={handleQuantityChange}
              onGlobalDeliveryChange={handleGlobalDeliveryChange}
              onRowPatch={handleRowPatch}
              renderToppingsDisplay={renderToppingsDisplay}
              formatMoney={formatMoney}
              getSizeSubtotal={getSizeSubtotal}
              getRowSubtotal={getRowSubtotal}
            />
          ))}
        </div>

        {showKeypad && (
          <Keypad
            activeField={activeField}
            getFieldValue={getFieldValue}
            onKeyPress={handleKeypadPress}
            onClose={closeKeypad}
          />
        )}

        <div className="total-section">
          <div className="total-label">Total</div>
          <div className="total-input">{formatMoney(totalGeneral)}</div>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button
            className="btn-primary"
            onClick={onConfirm}
            disabled={totalGeneral === 0}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

SizeModal.propTypes = {
  product: PropTypes.object.isRequired,
  sizes: PropTypes.array.isRequired,
  sizeState: PropTypes.object.isRequired,
  onUpdateSize: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  activeSizeId: PropTypes.number,
}
