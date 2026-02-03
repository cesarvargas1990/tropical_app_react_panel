# CartModal - Estructura de Componentes

## Descripción
El CartModal ha sido refactorizado en múltiples archivos pequeños y especializados, siguiendo el principio de responsabilidad única.

## Estructura de Archivos

```
CartModal/
├── index.jsx              # Componente principal (orquestador)
├── CartHeader.jsx         # Encabezado del modal
├── CartFooter.jsx         # Footer con total y acciones
├── CartItemsList.jsx      # Lista de items del carrito
├── CartItem.jsx           # Item individual del carrito
├── CartItemDetails.jsx    # Detalles de un item (cantidad, precio, etc.)
├── LoadingOverlay.jsx     # Overlay de carga durante registro
├── Icons.jsx              # Componentes de iconos (Edit, Trash)
├── constants.js           # Constantes de estilos
└── utils.js               # Utilidades (formatMoney)
```

## Responsabilidades

### index.jsx (~70 líneas)
- Componente principal que orquesta el modal
- Maneja el estado de `isRegistering`
- Gestiona handlers de eventos (register, close, clear)
- Calcula el total con `useMemo`

### CartHeader.jsx (~12 líneas)
- Muestra título "Carrito"
- Botón de cerrar

### CartFooter.jsx (~30 líneas)
- Muestra el total formateado
- Botón "Vaciar" 
- Botón "Registrar venta"

### CartItemsList.jsx (~20 líneas)
- Lista de items o mensaje de carrito vacío
- Mapea items a componentes CartItem

### CartItem.jsx (~70 líneas)
- Representa un item individual del carrito
- Botón de editar
- Información del producto
- Botón de eliminar
- Subtotal

### CartItemDetails.jsx (~11 líneas)
- Cantidad
- Valor unidad
- Toppings (opcional)
- Domicilio (opcional)
- Subtotal

### LoadingOverlay.jsx (~8 líneas)
- Overlay oscuro con mensaje "Registrando venta..."

### Icons.jsx (~35 líneas)
- `EditIcon`: Icono de lápiz
- `TrashIcon`: Icono de papelera

### constants.js (~30 líneas)
- `ICON_BUTTON_STYLE`: Estilos para botones circulares
- `LOADING_OVERLAY_STYLE`: Estilos del overlay
- `LOADING_MESSAGE_STYLE`: Estilos del mensaje de carga

### utils.js (~7 líneas)
- `formatMoney`: Formatea valores a pesos colombianos (COP)

## Ventajas de esta Estructura

1. **Componentes pequeños**: Cada archivo tiene <80 líneas
2. **Fácil de testear**: Cada componente se puede testear individualmente
3. **Reutilizable**: Los componentes pueden usarse en otros contextos
4. **Mantenible**: Es fácil localizar y modificar funcionalidad específica
5. **Legible**: El código es más fácil de entender
6. **Escalable**: Fácil agregar nuevas características sin afectar otros componentes

## Importación

```javascript
// Desde otros features
import { CartModal } from '../../features/cart'

// Directamente
import { CartModal } from './CartModal/index'
```
