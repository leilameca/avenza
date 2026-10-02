# AVENZA · Dirección visual y de interacción

Una marca de movilidad cálida para Santiago. Marketing editorial; operaciones con jerarquía y densidad de trabajo. MORAN STUDIO aparece únicamente como creador.

## Tokens

| Uso              | Valor                             |
| ---------------- | --------------------------------- |
| Base cálida      | `#f8f5ef`                         |
| Superficie       | `#fffdf9`                         |
| Tinta chocolate  | `#302b26`                         |
| Acento terracota | `#a34530`                         |
| Texto secundario | `#686158`                         |
| Separador        | `#dfdad0`                         |
| Estado favorable | `#526b55`                         |
| Editorial        | Instrument Serif, normal e italic |
| Producto         | Manrope 400 / 600 / 700           |

Primitivas con esquinas de 4–6 px, líneas finas y espacios deliberados. El estado siempre tiene texto además de color. Los formularios usan controles nativos etiquetados. Diálogos y foco gestionados por Radix.

## Motion

La fase pública usa feedback de 150 ms, interfaz de 260 ms, revelación editorial de 620 ms y hero de 920 ms. Tokens y curvas en app/public-pass.css. Transiciones de ruta de 320 ms sin bloquear navegación, fotografías con cortinas consistentes y cámara limitada a desktop. Reduced motion elimina todos los efectos.

Admin conserva feedback breve y su densidad operativa. El comparador responde directamente al usuario. Documentación completa en [public-phase2.md](public-phase2.md).

## Responsive

1440 px: sidebar estable, hoy en dos columnas, planner horizontal y reservas densas.

768 px: listas y formularios reorganizados; tablas desplazan internamente. Las vistas profundas ponen acciones y resumen debajo del registro.

390 px: menú de campo, una columna, inspección sin sidebar, zonas con controles táctiles y evidencia accesible. Tablas y planner conservan su escala dentro de áreas de scroll; el documento no debe desbordarse.

No se incluyeron efectos 3D, integraciones ficticiamente activas ni botones decorativos. Las microinteracciones sirven a selección, estado, continuidad y confirmación.

## Skills revisadas

Se aplicaron `frontend-design` del paquete local, las guías `design-system` y `ui-styling`, y `imagegen` para los assets. Se buscaron las skills indicadas en el brief; `apple-design`, `prototype`, `brag` y las específicas de revisión de animación no estaban instaladas. La revisión equivalente se realiza con capturas, navegación real, contraste, motion reducido y tests.
