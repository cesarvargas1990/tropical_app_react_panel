import React from 'react'

export const ToppingsInput = ({ 
  field, 
  value, 
  activeField, 
  onOpenKeypad 
}) => {
  const isActive =
    activeField &&
    activeField.type === field.type &&
    activeField.sizeId === field.sizeId &&
    activeField.index === field.index

  const testId =
    field.type === 'global'
      ? `toppings-global-${field.sizeId}`
      : `toppings-row-${field.sizeId}-${field.index}`

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onOpenKeypad(field)
    }
  }

  return (
    <div
      className={`input ${isActive ? 'input-active' : ''}`}
      data-testid={testId}
      role="button"
      tabIndex={0}
      onClick={() => onOpenKeypad(field)}
      onKeyDown={handleKeyDown}
      aria-pressed={isActive}
    >
      {value}
    </div>
  )
}
