# Refactorización de SizeModal

## Resumen

El componente `SizeModal` fue refactorizado para seguir el patrón **Hooks-First** y mejorar la separación de responsabilidades.

## Antes

- **1 archivo monolítico**: `SizeModal.jsx` (446 líneas)
- Toda la lógica mezclada en el componente
- Difícil de testear y mantener

## Después

### Hooks Personalizados

#### `useSizeCalculations.js`
Maneja todos los cálculos monetarios y subtotales:
- `formatMoney()` - Formato COP
- `getSizeSubtotal()` - Subtotal por tamaño
- `getRowSubtotal()` - Subtotal por fila individual
- `getTotalGeneral()` - Total de múltiples tamaños

**Cobertura**: 100% statements, 84.21% branches

#### `useSizeUpdates.js`
Maneja las actualizaciones del estado de tamaños:
- `handleQuantityChange()` - Incrementa/decrementa cantidad
- `handleGlobalDeliveryChange()` - Actualiza delivery global
- `handleRowPatch()` - Actualiza fila individual

**Cobertura**: 86.84% statements, 66.66% branches

#### `useKeypad.js`
Maneja la lógica del teclado numérico:
- `openKeypad()` / `closeKeypad()` - Control de visibilidad
- `getFieldValue()` - Obtiene valor del campo activo
- `handleKeypadPress()` - Procesa teclas (dígitos, backspace, clear)
- `applyValueToField()` - Aplica valor a campo global o fila

**Cobertura**: 94.79% statements, 70.96% branches

### Componentes

#### `Keypad.jsx`
Componente del teclado numérico aislado:
- Layout de 3x3 + fila de controles
- Props: `activeField`, `getFieldValue`, `onKeyPress`, `onClose`

**Cobertura**: 100% statements, 90% branches

#### `SizeCard.jsx`
Componente de tarjeta individual por tamaño:
- Controles de cantidad (+/-)
- Input de toppings global
- Checkbox de delivery
- Filas individuales con toppings/delivery personalizados
- Subtotal por tarjeta

**Cobertura**: 100% statements, 85.71% branches

#### `SizeModal.jsx` (Refactorizado)
Componente orquestador simplificado:
- 130 líneas (reducción del 71%)
- Solo composición y renderizado
- Sin lógica de negocio

**Cobertura**: 95.09% statements, 100% branches

## Estructura de Archivos

```
src/features/cart/
├── components/
│   ├── CartModal.jsx
│   ├── SizeModal.jsx       ← Refactorizado (130 líneas)
│   ├── SizeCard.jsx         ← NUEVO
│   └── Keypad.jsx           ← NUEVO
├── hooks/
│   ├── useCartFlow.js
│   ├── useSizeCalculations.js  ← NUEVO
│   ├── useSizeUpdates.js       ← NUEVO
│   └── useKeypad.js            ← NUEVO
└── __tests__/
    ├── useSizeCalculations.test.js  ← NUEVO (8 tests)
    ├── useSizeUpdates.test.js       ← NUEVO (8 tests)
    └── useKeypad.test.js            ← NUEVO (8 tests)
```

## Tests

- **Total**: 24 archivos de test, 97 tests pasando
- **Nuevos tests**: 24 tests adicionales para los hooks extraídos
- **Cobertura general**: 89.15% statements, 82.76% branches

## Beneficios

✅ **Separación de responsabilidades**: Cada hook tiene una responsabilidad única
✅ **Reusabilidad**: Hooks y componentes pueden usarse en otros contextos
✅ **Testabilidad**: Lógica aislada, fácil de testear
✅ **Mantenibilidad**: Código más legible y modificable
✅ **Cobertura**: Mayor cobertura de tests con tests específicos por hook

## Próximos Pasos (Opcional)

1. Extraer lógica similar de `CartModal.jsx` si es necesario
2. Crear hook compartido para formateo de moneda (`useMoneyFormat`)
3. Crear componente reutilizable `QuantityControl` para botones +/-
