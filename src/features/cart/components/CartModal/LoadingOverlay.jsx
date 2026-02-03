import React from 'react'
import { LOADING_OVERLAY_STYLE, LOADING_MESSAGE_STYLE } from './constants'

export const LoadingOverlay = () => (
  <div style={LOADING_OVERLAY_STYLE}>
    <div style={LOADING_MESSAGE_STYLE}>Registrando venta...</div>
  </div>
)
