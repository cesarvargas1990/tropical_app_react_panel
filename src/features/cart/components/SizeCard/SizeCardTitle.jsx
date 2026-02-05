import React from 'react'
import PropTypes from 'prop-types'

export const SizeCardTitle = ({ sizeName }) => (
  <div className="size-title">Tamaño: {sizeName}</div>
)

SizeCardTitle.propTypes = {
  sizeName: PropTypes.string.isRequired,
}
