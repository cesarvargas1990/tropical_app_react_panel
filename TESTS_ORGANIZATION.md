# Organización de Tests

## Estructura Actual ✅

Los tests están **perfectamente organizados** en carpetas `__tests__` dentro de cada feature, siguiendo el principio de **colocación** (colocation):

```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── __tests__/              ← Tests de auth
│   │       ├── Login.test.jsx
│   │       ├── authService.test.ts
│   │       └── useAuth.test.js
│   │
│   ├── cart/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── __tests__/              ← Tests de cart
│   │       ├── CartModal.test.jsx
│   │       ├── SizeModal.test.jsx
│   │       ├── cartBuilder.test.js
│   │       ├── useCartFlow.test.js
│   │       ├── useKeypad.test.js
│   │       ├── useSizeCalculations.test.js
│   │       └── useSizeUpdates.test.js
│   │
│   ├── products/
│   │   └── __tests__/              ← Tests de products
│   │       ├── ProductCard.test.jsx
│   │       ├── productsService.test.js
│   │       ├── sizesService.test.js
│   │       ├── useProductSizes.test.js
│   │       ├── useProductsData.test.js
│   │       └── useProductsRealtime.test.js
│   │
│   └── sales/
│       └── __tests__/              ← Tests de sales
│           ├── RecentSalesModal.test.jsx
│           ├── salesService.test.js
│           └── useSaleRegister.test.js
│
├── shared/
│   └── __tests__/                  ← Tests compartidos
│       ├── App.test.jsx
│       ├── MainApp.test.jsx
│       ├── api.test.js
│       ├── useBodyLock.test.js
│       ├── useCartActions.test.js
│       ├── useModalState.test.js
│       ├── useProductActions.test.js
│       └── useScannerInput.test.js
│
└── main.test.jsx                   ← Test del entry point
```

## Ventajas de esta Organización 🎯

### 1. **Proximidad al Código**
- Los tests están junto al código que prueban
- Fácil encontrar tests relacionados
- Menos navegación entre carpetas

### 2. **Separación Clara**
- Carpetas `__tests__` son fácilmente identificables
- Se pueden ignorar en `.gitignore` si es necesario
- Claras en el explorador de archivos

### 3. **Independencia por Feature**
- Cada feature tiene sus propios tests
- Tests no se mezclan entre features
- Escalabilidad: agregar features no complica la estructura

### 4. **Mantenibilidad**
- Al modificar código, los tests están cerca
- Al eliminar un feature, eliminas todo incluyendo tests
- Refactoring más seguro

### 5. **Convención Estándar**
- Patrón usado por React, Next.js, Jest, Vitest
- Fácil para nuevos developers
- Herramientas lo reconocen automáticamente

## Comandos de Test

```bash
# Ejecutar todos los tests
npm test

# Ejecutar en modo watch
npm run test

# Ejecutar con cobertura
npm test -- --coverage

# Ejecutar tests de un feature específico
npm test -- src/features/cart

# Ejecutar un test específico
npm test -- CartModal.test.jsx
```

## Configuración (vite.config.js)

```javascript
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",
    // Vitest automáticamente encuentra los tests en **/*.test.*
  },
})
```

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

## Buenas Prácticas Aplicadas

1. ✅ Tests cerca del código fuente
2. ✅ Nomenclatura consistente `*.test.{js,jsx,ts,tsx}`
3. ✅ Separación por carpetas `__tests__`
4. ✅ Imports relativos cortos
5. ✅ Mocks bien organizados
6. ✅ Setup centralizado en `src/test/setup.js`

## Alternativas Consideradas

### Tests Centralizados (NO recomendado)
```
tests/
├── features/
│   ├── auth/
│   ├── cart/
│   └── ...
└── shared/
```

**Desventajas**:
- Más navegación entre carpetas
- Imports más largos y complejos
- Difícil mantener sincronizado con src
- No es el estándar de la industria

### Conclusión

La estructura actual de tests **ya está óptimamente separada y organizada**. Sigue las mejores prácticas de la industria y facilita el mantenimiento a largo plazo del proyecto.
