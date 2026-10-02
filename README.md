# AVENZA Rent a Car × MORAN STUDIO

AVENZA es una empresa **ficticia** de alquiler de vehículos en Santiago, República Dominicana. Este Concept Project muestra una operación personalizada: web pública, portal del cliente y espacio operativo comparten reservas, vehículos, contratos, inspecciones, pagos e historial.

No es un SaaS ni una empresa real. No procesa dinero, envía mensajes externos, verifica identidad o genera documentos con validez comercial.

## Ejecutar

Requiere Node.js 22 y npm. No necesita claves, Supabase ni variables de entorno.

```sh
npm install
npm run dev
```

En PowerShell, si la política bloquea los scripts de npm, usar `npm.cmd install` y `npm.cmd run dev`. Abrir **http://localhost:3000**.

```sh
npm run typecheck
npm test
npm run test:e2e
npm run build
npm start
```

Las pruebas del navegador usan Microsoft Edge instalado. En otro entorno, cambiar `channel` en `playwright.config.ts` o instalar Chromium con `npx playwright install chromium`. Ejecutar primero el servidor local. `PLAYWRIGHT_BASE_URL` permite probar un servidor de producción en otro puerto.

## Acceso demo

`/operaciones` ofrece **Entrar como administrador** y **Entrar como empleado**, sin cuenta. Son roles de simulación en el cliente, no un mecanismo de seguridad de producción.

La fecha operativa está fijada en **2 de octubre de 2026, 10:00, America/Santo_Domingo**, para mantener reproducibles los escenarios. Las fechas de los formularios se interpretan en RD, independientemente de la zona del dispositivo.

El portal es de acceso abierto mediante código demo. `/portal` permite explorar una reserva de ejemplo o la última reserva creada.

## Rutas

| Experiencia                | Ruta                                                           |
| -------------------------- | -------------------------------------------------------------- |
| Inicio, disponibilidad     | `/`                                                            |
| Flota y filtros            | `/flota`                                                       |
| Ficha comercial            | `/flota/AV-002`                                                |
| Reserva en seis pasos      | `/reservar`                                                    |
| Confirmación               | `/confirmacion/:codigo`                                        |
| Portal cliente             | `/portal`, `/portal/:codigo`                                   |
| Información                | `/nosotros`, `/preguntas`, `/contacto`, `/politicas`           |
| Operación de hoy           | `/operaciones`                                                 |
| Calendario de flota        | `/operaciones/planner`                                         |
| Reservas y ficha conectada | `/operaciones/reservas`, `/operaciones/reservas/:codigo`       |
| Board y perfil de vehículo | `/operaciones/flota`, `/operaciones/flota/:id`                 |
| Clientes y perfiles        | `/operaciones/clientes`, `/operaciones/clientes/:id`           |
| Inspecciones               | `/operaciones/inspecciones`                                    |
| Wizard de campo            | `/operaciones/inspeccion/:codigo?tipo=salida`, `?tipo=entrada` |
| Antes / después            | `/operaciones/comparacion/:codigo`                             |
| Finanzas demo              | `/operaciones/pagos`                                           |
| Servicios                  | `/operaciones/mantenimiento`                                   |
| Reportes y CSV             | `/operaciones/reportes`                                        |
| Equipo e historial         | `/operaciones/equipo`                                          |
| Reglas y restauración      | `/operaciones/configuracion`                                   |

## Recorrido completo

1. Buscar en Santiago Centro y elegir Grand i10 `AV-002` para 2–5 de octubre.
2. Agregar extras, completar datos **ficticios** y confirmar abono simulado.
3. Abrir portal y adjuntar una licencia ficticia JPG/PNG/PDF, máximo 2 MB.
4. Entrar como empleado y abrir el mismo código en reservas.
5. Asignar o confirmar vehículo, preparar contrato y registrar saldo y depósito.
6. Completar los diez pasos de salida: KM, combustible, zonas, interior, evidencia y firma demo.
7. Entregar: reserva activa y vehículo alquilado.
8. Solicitar extensión desde el portal; revisarla desde la ficha y completar el nuevo saldo.
9. Iniciar devolución. Comparar evidencia y registrar observaciones manuales.
10. Para cargos conceptuales, usar administrador: registrar cargo, cobrar saldo y luego cerrar. El empleado puede documentar observaciones sin cargos.
11. Seleccionar el estado del vehículo al cerrar. La entrada y salida quedan separadas.
12. Reembolsar depósito demo como movimiento independiente y consultar historial.

No se cierra una entrega sin licencia ficticia revisada, contrato firmado demo, saldo cubierto y depósito. No se cierra devolución con saldo pendiente. Los errores no guardan cambios parciales.

## Escenarios preparados

El botón **Explorar escenarios** abre registros concretos:

| Escenario                                 | Registro                           |
| ----------------------------------------- | ---------------------------------- |
| Entrega lista para documentar             | `AVZ-261002-027`                   |
| Devolución con evidencia ficticia de daño | `AVZ-260928-023`                   |
| Extensión incompatible                    | `AVZ-260929-024`                   |
| Retorno tardío y siguiente entrega        | `AVZ-260930-025`, `AVZ-261002-030` |
| Reemplazo por incidencia                  | `AVZ-260930-026`                   |
| Servicio que bloquea fechas               | `AV-008`                           |
| Saldo y vehículo sin asignar              | `AVZ-261002-028`                   |
| Cliente recurrente                        | `CLI-001`                          |

La comparación de entrada de un alquiler aún activo aparece explícitamente como **vista previa demo**. Al devolver, utiliza la evidencia realmente guardada en la simulación. No hay detección de daños mediante IA.

## Arquitectura

- Next.js App Router, React, TypeScript, Tailwind CSS y CSS de producto con tokens propios.
- Radix Dialog para foco, teclado y overlays; Sonner para feedback; Lucide para iconografía funcional.
- `src/domain.ts`: tipos y transacciones puras, disponibilidad con margen de preparación, cálculo de precios, depósitos y notificaciones derivadas.
- `src/seed.ts`: dataset determinista con 28 vehículos individuales, 22 clientes y 36 reservas, cuatro alquileres activos, contratos, documentos, inspecciones, daños, movimientos y servicios relacionados.
- `src/store.tsx`: estado compartido y persistencia local, manejo de errores de almacenamiento y restauración.
- `src/public.tsx`: experiencia comercial, reserva, confirmación, portal e información.
- `src/operations.tsx`: shell, roles, hoy, planner, listas, perfiles, reportes y configuración.
- `src/reservation.tsx`: ficha conectada, contrato imprimible, documentos y acciones de alquiler.
- `src/inspection.tsx`: wizard de campo, mapa de zonas y comparación visual.
- `src/ui.tsx`: primitivas compartidas, campos con etiquetas explícitas, búsqueda global y timeline.
- `src/integrations.ts`: contratos de adaptación futura; ninguna integración está conectada.

La tarifa se calcula por períodos de 24 horas redondeados. Los extras diarios siguen la duración; entrega coordinada es un cargo único. La tasa USD es ilustrativa y configurable, **no una tasa de mercado**. El depósito se deriva de su ledger de depósitos/reembolsos y no se suma al ingreso de alquiler.

El planner muestra diez días y navegación por períodos. Se abre cada bloque para reasignar con validación; no hay drag & drop que pueda crear solapamientos. Un cambio durante el alquiler conserva segmentos, kilómetros e inspección demo del reemplazo y aparta el anterior.

## Persistencia y límites

Los cambios viven en `localStorage` (`avenza-concept-v1`) y el rol en `sessionStorage`. Se conservan al recargar, pero no sincronizan entre equipos. Las fotos usan archivos locales o data URLs; los errores de cuota evitan guardar una transacción incompleta.

Las inspecciones se guardan al completar el wizard; sus borradores no sobreviven una recarga. El contacto conserva mensajes demo en el navegador y no los envía. No hay credenciales, números de tarjeta, VIN reales ni documentos de terceros.

Para una implementación real: persistencia de servidor con transacciones y restricciones de solapamiento, autenticación/autorización de servidor, storage con control de acceso, validación de archivos, contratos/políticas revisados y adaptadores reales. Los roles de esta demo no deben tratarse como seguridad para información real.

## Diseño y medios

Crema, chocolate y terracota; Instrument Serif para editorial y Manrope para producto. Fuentes locales, imágenes WebP locales y fotografía representativa generada para el concepto. Ver [dirección visual](docs/design-system.md) y [proveniencia y prompts](docs/assets.md).

Las categorías comparten fotografías representativas; no son fotografías del vehículo individual indicado en la ficha. La UI y el inventario ficticio se identifican como demostración.

## Deployment

`npm run build` genera la aplicación lista para un hosting de Next.js. En Vercel: importar el directorio raíz, preset Next.js, comando build `npm run build`; no se necesitan variables. En un servidor Node: `npm ci`, `npm run build`, `npm start`. Para el portfolio, desplegar como demo pública **sin datos reales**.

No se ha publicado en una cuenta externa desde este workspace.

Documentación de referencia: [instalación de Next.js](https://nextjs.org/docs/app/getting-started/installation), [Playwright](https://playwright.dev/docs/intro).

## Dirección visual pública · Fase 2

Hero editorial, flota asimétrica, fotografía conceptual del Cibao, capítulos interactivos, detalle de producto y reserva responsiva. El panel operativo mantiene arquitectura y densidad. Motion respeta las preferencias de accesibilidad. [Cambios y revisión](docs/public-phase2.md).
