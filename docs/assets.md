# Assets y procedencia

Fotografía creada para este Concept Project mediante la herramienta integrada **imagegen**. No se utilizaron fotos privadas, documentos reales ni fotografías de clientes. Las imágenes son representativas de categorías; los modelos y colores individuales del dataset no deben interpretarse como fotos verificadas de esas unidades.

Las imágenes generadas fueron convertidas con Sharp a WebP y guardadas dentro del proyecto. Los archivos servidos no dependen de un servicio de imágenes externo.

## Archivos finales

- `public/images/hero.webp` — fotografía editorial de un SUV blanco en un entorno cálido de Santiago.
- `public/images/compact.webp` — automóvil compacto representativo.
- `public/images/sedan.webp` — sedán representativo.
- `public/images/suv.webp` — SUV representativa.
- `public/images/pickup.webp` — pickup representativa.
- `public/images/premium.webp` — referencia de categoría SUV; reutiliza la imagen SUV, no pretende mostrar un Tahoe real.
- `public/images/damage-before.webp` — evidencia ficticia con marca preexistente.
- `public/images/damage-after.webp` — misma evidencia ficticia con una abolladura adicional.

## Prompts finales

### Hero

> Use case: photorealistic-natural. Asset type: wide editorial automotive photograph for fictional Dominican rental company AVENZA. Create a premium understated natural photograph, panoramic 3:2. A contemporary pearl white Toyota RAV4 style compact SUV parked at a three quarter front view facing left on pale concrete in Santiago Dominican Republic, warm minimal modern tropical architecture with terracotta plaster wall, subtle palm shadow, distant low lush mountains. Vehicle occupies right center to allow left crop, whole vehicle visible, realistic vehicle proportions and details, no people, no lettering, no readable license plate, no watermark. Soft late afternoon Caribbean sunlight, warm cream and tobacco palette, clean high-end automotive editorial photography, realistic not render, restrained premium local rental brand.

### Flota

> Use case product-mockup. Automotive catalog photography contact sheet, 1536x1024 landscape, exactly four equally sized quadrants with no borders, each quadrant separate photo against identical plain warm pale beige studio background and floor. Top left: white Kia Picanto style compact five-door hatchback; top right: dark graphite Kia K5 style modern sedan; bottom left: white Toyota RAV4 style compact SUV; bottom right: silver Toyota Hilux style pickup truck. Each car complete fully inside its quadrant with comfortable margins, all at front three-quarter angle facing left, realistic correct proportion, consistent soft light and subtle floor shadows, no writing, no text labels, no plates readable, no watermarks. Premium understated editorial fleet photos, realistic photographs, not illustrations. These are representative fictional demo vehicle images.

Se recortaron los cuatro cuadrantes como fotografías independientes. `premium.webp` reutiliza el cuadrante SUV.

### Inspección

> Use case photorealistic-natural. Asset type: fictional car inspection evidence comparison. Exactly two photos side by side in equal halves landscape 1536x1024. Both show the same close up framing of the left side door of a graphite dark grey modern sedan in a pale beige garage, same angle daylight. Left half: small subtle pre-existing thin scratch near bottom door. Right half: same scratch preserved, plus new visible modest shallow dent on the upper middle door. Realistic handheld operational evidence photograph, clear car door panel, wheel edge partly visible at right edge of each half, no text no labels no watermark, no people. These are simulated demonstration evidence photos, not real customer vehicle damage. Identical geometry between halves except added dent.

Se recortaron ambas mitades. El comparador no afirma detección automática ni responsabilidad.

## Tipografía

Manrope e Instrument Serif obtenidas mediante Fontsource y servidas desde `public/fonts`. Las licencias se conservan en `docs/font-licenses`. El wordmark y el esquema de inspección son vectores de interfaz propios.

Fotografía de fase 2 y prompts: [assets-phase2.md](assets-phase2.md).
