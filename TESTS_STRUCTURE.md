# Organización de Tests - Estructura Centralizada

## ✅ Estructura Actual

Los tests están **centralizados** en una carpeta `tests/` en la raíz del proyecto, espejando la estructura de `src/`:

```
project/
├── src/                          # Código fuente
│   ├── features/
│   │   ├── auth/
│   │   ├── cart/
│   │   ├── products/
│   │   └── sales/
│   └── shared/
│
└── tests/                        # Tests centralizados
    ├── features/
    │   ├── auth/
    │   │   ├── Login.test.jsx
    │   │   ├── authService.test.ts
    │   │   └── useAuth.test.js
    │   ├── cart/
    │   │   ├── CartModal.test.jsx
    │   │   ├── SizeModal.test.jsx
    │   │   ├── cartBuilder.test.js
    │   │   ├── useCartFlow.test.js
    │   │   ├── useKeypad.test.js
    │   │   ├── useSizeCalculations.test.js
    │   │   └── useSizeUpdates.test.js
    │   ├── products/
    │   │   ├── ProductCard.test.jsx
    │   │   ├── productsService.test.js
    │   │   ├── sizesService.test.js
    │   │   ├── useProductSizes.test.js
    │   │   ├── useProductsData.test.js
    │   │   └── useProductsRealtime.test.js
    │   └── sales/
    │       ├── RecentSalesModal.test.jsx
    │       ├── salesService.test.js
    │       └── useSaleRegister.test.js
    ├── shared/
    │   ├── App.test.jsx
    │   ├── MainApp.test.jsx
    │   ├── api.test.js
    │   ├── useBodyLock.test.js
    │   ├── useCartActions.test.js
    │   ├── useModalState.test.js
    │   ├── useProductActions.test.js
    │   └── useScannerInput.test.js
    └── main.test.jsx
```

## Ventajas de la Estructura Centralizada 🎯

### 1. **Separación Clara**
- Tests completamente separados del código fuente
- Carpeta `tests/` dedicada y fácil de identificar
- Mayor control sobre qué se versiona/distribuye

### 2. **Escalabilidad**
- Fácil agregar nuevos tests sin contaminar `src/`
- Estructura predecible y consistente
- Tests no interfieren con la carga del código en producción

### 3. **Mantenimiento**
- Cambios en `src/` no afectan directamente la ubicación de tests
- Refactoring de código más limpio
- Tests organizados por la misma estructura de features

### 4. **Configuración Vitest**
```javascript
// vite.config.js
test: {
  environment: "jsdom",
  globals: true,
  setupFiles: "./src/test/setup.js",
  include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
}
```

## Rutas de Importación en Tests

### Para Features (cart, products, auth, sales):
```javascript
// import desde src
import { CartModal } from '../../../src/features/cart/components/CartModal/index'
import { getProducts } from '../../../src/features/products/services/productsService'

// mocks
vi.mock('../../../src/features/cart/hooks/useCartFlow')
```

**Patrón**: `../../../src/features/{feature}/{section}/{file}`

### Para Shared:
```javascript
// import desde src
import { App } from '../../src/shared/components/App'
import api from '../../src/shared/services/api'

// mocks
vi.mock('../../src/shared/services/api')
```

**Patrón**: `../../src/shared/{section}/{file}`

## Métricas de Tests

- **Total de archivos de test**: 28
- **Total de tests**: 126
- **Todos pasando**: ✅ 100%

### Distribución por Feature:
- **auth**: 3 archivos (11 tests)
- **cart**: 7 archivos (49 tests)
- **products**: 6 archivos (16 tests)
- **sales**: 3 archivos (9 tests)
- **shared**: 8 archivos (40 tests)
- **main**: 1 archivo (1 test)

## Comandos de Test

```bash
# Ejecutar todos los tests
npm test

# Ejecutar en modo watch
npm run test

# Ejecutar tests con cobertura
npm test -- --coverage

# Ejecutar tests de un feature específico
npm test -- tests/features/cart

# Ejecutar un test específico
npm test -- CartModal.test.jsx

# Ejecutar solo tests sin watch
npm test -- --run
```

## Buenas Prácticas Aplicadas

1. ✅ Tests en estructura centralizada fuera de `src/`
2. ✅ Nombrado consistente: `*.test.{js,jsx,ts,tsx}`
3. ✅ Estructura espeja la de `src/`
4. ✅ Rutas relativas correctas para importaciones
5. ✅ Mocks bien organizados y actualizados
6. ✅ Setup centralizado en `src/test/setup.js`

## Migración Realizada

Se han **movido exitosamente** 28 archivos de test desde estructura distribuida (dentro de `src/__tests__/`) a una estructura centralizada (`tests/`):

- ✅ Todos los imports actualizados
- ✅ Todos los mocks corregidos
- ✅ Configuración Vitest actualizada
- ✅ 126/126 tests pasando
- ✅ Archivos antiguos eliminados de `src/`

## Estructura de Carpetas Creada

```
tests/
├── features/
│   ├── auth/          (3 tests)
│   ├── cart/          (7 tests)
│   ├── products/      (6 tests)
│   └── sales/         (3 tests)
├── shared/            (8 tests)
└── main.test.jsx      (1 test)
```

Todos los tests están ahora **centralizados, bien organizados y funcionando correctamente**. 🎉
