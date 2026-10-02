# QA · AVENZA

Verificación realizada el **2 de octubre de 2026**.

## Resultado

- TypeScript estricto: sin errores.
- Compilación de producción: completada con Next.js 16.3.8.
- **8 pruebas del dominio aprobadas**.
- **8 pruebas de navegador aprobadas**, usando Microsoft Edge / Playwright.
- **26 rutas verificadas a 1440, 768 y 390 px**: sin imágenes rotas ni desbordamiento horizontal del documento. Las tablas y el planner desplazan dentro de su contenedor.
- **10 vistas principales auditadas con axe**, WCAG 2 A/AA y 2.1 AA: cero infracciones automáticas en la revisión final.

La auditoría automática no sustituye todas las comprobaciones de accesibilidad; también se probó cierre de diálogos con Escape, navegación móvil, etiquetas y motion reducido.

## Pruebas de continuidad

El navegador recorrió búsqueda → ficha → reserva con extras y abono por transferencia demo → confirmación → documento ficticio en portal → acceso empleado → contrato → saldo y depósito → inspección de salida → entrega → recarga con alquiler activo → solicitud de extensión en portal → revisión y pago → devolución en móvil con abolladura documentada → cierre → comparación → recarga con historial y evidencia conservados.

Otras pruebas comprueban:

- Extensión incompatible y botón bloqueado.
- Archivo inválido rechazado.
- Mantenimiento que cruza una reserva rechazado.
- Vista financiera restringida al rol administrador.
- Cambio de vehículo con segmentos, KM y evidencia independientes.
- Cargo registrado y cobrado antes de cerrar devolución.
- Reembolso de depósito separado del ingreso.
- Alertas desaparecen al resolver la causa.
- Búsqueda Ctrl/Cmd + K y navegación a registros.
- Descarga CSV.
- Menús móviles, configuración persistida y restauración confirmada.
- Enlace del crédito MORAN STUDIO al destino solicitado.
- `prefers-reduced-motion` elimina transiciones.

## Revisión visual

Capturas en `docs/`:

- `home-1440.png`, `home-768.png`, `home-390.png`.
- `operations-1440.png`, `operations-768.png`, `operations-390.png`.
- `planner-desktop.png`, `reservation-desktop.png`, `before-after-desktop.png`.
- `inspection-desktop.png`, `inspection-mobile.png`.
- `contract-print.png` para la vista de impresión demostrativa.

Se corrigieron el contenedor de tablas, el ancho mínimo de grids, las etiquetas de selects y los contrastes en superficies crema. El menú móvil fuera de pantalla queda inerte para impedir foco en controles ocultos.

## Reproducir

Con el servidor local activo:

```sh
npm test
npm run test:e2e
npm run qa:accessibility
node scripts/capture-scenes.cjs
npm run typecheck
npm run build
```

`docs/accessibility-audit.json` conserva el resultado automatizado. No se activaron servicios externos ni se usaron datos reales.

## Fase visual pública

Se añadieron pruebas de reveal al scroll, motion reducido en vivo, tabs editoriales con flechas, FAQ con teclado, menú móvil y progreso de reserva. Once rutas públicas se recorren a seis anchos: 1440, 1280, 1024, 768, 430 y 390 px. Ver `public-qa-phase2.json` y `public-phase2.md`.
