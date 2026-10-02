# AVENZA · Fase 2

## Auditoría previa

Se recorrieron inicio, flota, detalle, los pasos de reserva, confirmación, nosotros, preguntas, contacto, portal de ejemplo y estados de registro inexistente en desktop y móvil. La base tenía demasiado crema continuo, tarjetas de igual escala y poco protagonismo fotográfico. FAQ y portal no aprovechaban el ancho. En móvil, la acción de reserva quedaba después de las especificaciones.

## Implementación

- Hero original conservado: titular por líneas, cortina horizontal y desplazamiento de cámara limitado a 35 px en desktop. No parallax en móvil.
- Flota destacada asimétrica, fotografías mayores y CTA visible también en touch. Categorías con subrayado en lugar de botones decorativos.
- Escena oscura con tres capítulos controlados por el usuario: recorrido, preparación y recogida. Tabs con teclado y foco.
- Cierre fotográfico del Cibao, gran titular y acción de explorar flota. El bloque del estudio es más compacto y terracota.
- Detalle de producto con modelo a gran escala y fotografía a todo el ancho. Reserva sticky en desktop; antes de especificaciones en móvil.
- Reserva con progreso continuo, selección marcada, respuesta breve de precio y cambio de paso de 280 ms.
- FAQ con disclosure accesible, transición de altura, icono y contexto fotográfico lateral. Contacto y portal ganan fotografía.
- Navegación sticky que se compacta, estados activos y menú móvil con Escape.
- Planner conserva estructura y densidad; solo mejora feedback de fila, pressed y foco.

## Lenguaje de movimiento

Feedback 150 ms, interfaz 260 ms, editorial 620 ms y hero 920 ms. Curvas separadas para respuesta y revelación. Transiciones de ruta de 320 ms sin espera artificial ni scroll bloqueado. Las fotografías usan dos tratamientos: cortina horizontal del hero y cortina vertical para escenas descubiertas al scroll.

Los textos quedan legibles antes de los reveals. IntersectionObserver observa el contenedor sin recortarlo: aplicar clip-path al elemento observado impediría detectar su entrada. Una prueba de regresión verifica las fotografías tras el scroll. Sin JavaScript de motion, el contenido permanece visible; reduced motion elimina cámara, animaciones y transiciones.

## Revisión y QA

Se revisaron manualmente oportunidades, tiempos, interacción y exceso de movimiento. Las skills específicas citadas en el brief no están instaladas; se aplicaron frontend-design e imagegen disponibles, sin simular la ejecución de skills ausentes.

TypeScript, build de producción, ocho pruebas de dominio y ocho pruebas de navegador aprobadas. Axe revisa diez vistas sin infracciones automáticas en el estado estático. `scripts/qa-public-pass.cjs` recorre once rutas a 1440, 1280, 1024, 768, 430 y 390 px; `docs/public-qa-phase2.json` conserva los resultados. El stepper móvil desplaza internamente y no desborda el documento.

Se verificaron cambios de capítulo, navegación por flechas, apertura y cierre de FAQ, menú móvil, cambio de preferencia de motion en vivo y progreso de reserva. No se cambió la lógica de reservas, pagos, inspecciones, mantenimiento o roles.

Fotografía generada conceptual: assets y prompts en `assets.md`. Datos continúan locales; esta fase no instala una base de datos real ni autenticación.
