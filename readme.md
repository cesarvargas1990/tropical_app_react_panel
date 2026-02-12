# 🍹 Panel de Ventas Tropical APP

Panel de administración de ventas desarrollado con **React + Vite**, optimizado para punto de venta con escáner, gestión de carrito, cálculo de tamaños y modal de toppings.

---

## 📋 Características

- ✅ **Sistema de productos** con múltiples tamaños
- ✅ **Carrito de compras** interactivo con toppings personalizables
- ✅ **Entrada por escáner** para búsqueda rápida de productos
- ✅ **Modal de tamaños** con cálculos dinámicos de precios
- ✅ **Registro de ventas** con historial de recientes
- ✅ **Autenticación** básica integrada
- ✅ **Cobertura de tests** del 100%
- ✅ **Componentes refactorizados** - modularidad y reutilización máxima

---

## 🚀 Quick Start

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

### Pruebas

```bash
# Ejecutar tests una vez
npm test

# Modo watch interactivo
npm run test:watch

# Reporte de cobertura
npm run coverage
```

---

## 🏗️ Estructura del Proyecto

```
src/
├── features/           # Módulos por característica
│   ├── auth/          # Autenticación
│   ├── cart/          # Carrito y modales (CartModal, SizeModal, SizeCard, Keypad)
│   ├── products/      # Catálogo de productos
│   └── sales/         # Historial y registro de ventas
├── shared/            # Componentes y utilities compartidas
│   ├── components/    # App, MainApp, AppHeader, Icons
│   ├── hooks/         # Custom hooks (useScannerInput, useModalState, etc)
│   └── services/      # API calls y lógica de servicios
└── test/              # Setup de tests

tests/                 # Suite centralizada de tests (126+ tests)
├── features/
└── shared/
```

---

## 📦 Build y Despliegue

### Build estándar

```bash
npm run build
```

Genera optimizado con `--base=/tropical/` y copia automáticamente a `../public/tropical` via script `deploy`.

### Build personalizado

```bash
vite build --base=/tropical/
```

El bundle final queda en `dist/`. Para desplegar manualmente:

```bash
cp -R dist ../public/tropical
```

---

## 🧪 Tests

- **Tests Framework**: Vitest + @testing-library/react
- **Cobertura**: 100% en módulos principales
- **Ubicación**: Centralizados en `tests/` con estructura por features
- **Total**: 28 archivos de test, 126+ casos de prueba

Para más detalles, ver [TESTS_STRUCTURE.md](TESTS_STRUCTURE.md)

---

## 🔧 Scripts disponibles

| Script               | Descripción                   |
| -------------------- | ----------------------------- |
| `npm run dev`        | Inicia servidor de desarrollo |
| `npm run build`      | Build para producción         |
| `npm test`           | Ejecuta tests una vez         |
| `npm run test:watch` | Tests en modo watch           |
| `npm run coverage`   | Reporte de cobertura          |

---
