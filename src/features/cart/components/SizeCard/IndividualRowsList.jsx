import React from 'react'
import { IndividualRow } from './IndividualRow'

export const IndividualRowsList = ({
  items,
  sizeId,
  size,
  renderToppingsDisplay,
  onRowPatch,
  formatMoney,
  getRowSubtotal,
}) => {
  if (!items || items.length === 0) return null

  return (
    <>
      {items.map((row, index) => {
        const rowSubtotal = getRowSubtotal(size, row)
        
        return (
          <IndividualRow
            key={index}
            row={row}
            index={index}
            sizeId={sizeId}
            renderToppingsDisplay={renderToppingsDisplay}
            onRowPatch={onRowPatch}
            formatMoney={formatMoney}
            rowSubtotal={rowSubtotal}
          />
        )
      })}
    </>
  )
}
