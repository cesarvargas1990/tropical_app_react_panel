import React from 'react'
import PropTypes from 'prop-types'

export const ModalTitle = ({ productName, productFeature }) => (
  <h2 className="modal-title">
    {productName} {productFeature}
  </h2>
)

ModalTitle.propTypes = {
  productName: PropTypes.string.isRequired,
  productFeature: PropTypes.string.isRequired,
}
