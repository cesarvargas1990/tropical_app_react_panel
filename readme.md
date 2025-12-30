# Panel de Ventas Tropical APP

Guía rápida para instalar, desarrollar y generar el build con la ruta `/tropical/`.

## Instalación
- Clona el repositorio y ejecuta `npm install`.

## Desarrollo
- Ejecuta `npm run dev` para levantar Vite en modo desarrollo.

## Pruebas
- `npm test` para correr Vitest una vez.
- `npm run test:watch` para modo interactivo.
- `npm run coverage` para reporte de cobertura.

## Build y despliegue
- `npm run build` ya incluye `--base=/tropical/` y, al terminar, copia `dist/` a `../public/tropical` mediante el script `deploy`.
- Si solo quieres generar el build sin copiarlo, usa `vite build --base=/tropical/`.
- El paquete final queda en `dist/`; para publicar manualmente puedes copiarlo a tu destino preferido (`cp -R dist ../public/tropical` es el flujo actual).
