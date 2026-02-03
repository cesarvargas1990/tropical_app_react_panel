import React from 'react'

export const ModalActions = ({ onCancel, onConfirm, isConfirmDisabled }) => (
  <div className="modal-actions">
    <button className="btn-secondary" onClick={onCancel}>
      Cancelar
    </button>
    <button
      className="btn-primary"
      onClick={onConfirm}
      disabled={isConfirmDisabled}
    >
      Confirmar
    </button>
  </div>
)
