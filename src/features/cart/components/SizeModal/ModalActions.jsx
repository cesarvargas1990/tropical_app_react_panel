import React from 'react'
import PropTypes from 'prop-types'

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

ModalActions.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  isConfirmDisabled: PropTypes.bool.isRequired,
}
