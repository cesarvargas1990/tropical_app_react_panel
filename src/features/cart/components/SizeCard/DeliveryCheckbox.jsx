import React from 'react'

export const DeliveryCheckbox = ({ checked, onChange }) => (
  <div className="size-row checkbox-row">
    <label>
      <input type="checkbox" checked={checked} onChange={onChange} />{' '}
      ¿Domicilio?
    </label>
  </div>
)
