---
name: ui-design
description: Pautas de diseño UI/UX para la tienda de lencería Nocturna. Úsalo al crear o modificar pantallas, componentes, estilos o paleta de colores en el frontend.
---

# Skill: Diseño UI — Nocturna (lencería minimalista)

Pautas de diseño para **Nocturna**, tienda de lencería premium en Colombia.
Identidad **minimalista, sexy y elegante**: editorial de moda, líneas finas,
mucho aire, negro y nude. Deliberadamente sobria: el producto y la tipografía
son los protagonistas. **Prohibido el tema navideño** (sin copos, sin emojis
festivos, sin oro dorado navideño).

## Esencia de marca
- Sensual pero sofisticada: nada explícito ni estridente. Sexy = refinamiento.
- Silencio visual: pocos elementos por pantalla, jerarquía clara.
- Tacto: seda, encaje, textura. La interfaz debe sentirse "suave y limpia".

## Paleta de colores

| Token Uso | Color | Hex |
|-----------|-------|-----|
| Primario (botones sólidos, header, texto de marca) | Tinta (negro cálido) | `#14100e` |
| Primario hover | Tinta suave | `#2a2320` |
| Texto principal | Carbón | `#2b2422` |
| Texto secundario | Taupe cálido | `#716a64` |
| Fondo de página | Crema cálida | `#faf7f4` |
| Fondo de secciones / paneles | Nude | `#f3ece5` |
| Acento (hover de links, estrellas, detalles) | Espresso nude | `#86715f` |
| Acento sobre fondos oscuros | Ivory nude | `#d9cfc3` |
| Acento claro (badges, paneles suaves) | Beige cálido | `#efe8df` |
| Peligro / errores | Vino profundo | `#7a2e39` |

Reglas:
- Los **CTA primarios son negros** (tinta) con texto crema. El contraste es la elegancia.
- El nude espresso es acento puntual (estrellas, hovers, una línea en el hero). Nunca rellena grandes áreas.
- Sombras: **sin sombras difusas en tarjetas ni paneles** — la separación se
  logra con hairlines (`tinta/10`) y fondos; nunca azuladas ni doradas.

## Tipografía
- **Display: `Playfair Display`** (serif editorial de alto contraste, aire Vogue).
  - Títulos en peso 500–600. **Itálicas con intención**: una palabra en itálica
    aporta el tono sensual/elegante (ej. "Lo íntimo es *también elegante*").
  - Precios en Playfair 500.
- **UI/cuerpo: `Inter`** (sans limpia y neutra).
- Escala base 16px, ratio 1.25 (16 → 20 → 25 → 31 → 39 → 49).
- **Etiquetas y categorías**: Inter, uppercase, `tracking-[0.18em]`, 11–12px,
  color taupe. Es una de las señales "editorial de moda".

## Principios de diseño
1. **Mobile primero** (375px base) y targets táctiles ≥ 44px.
2. **Aire generoso**: espacios amplios; si algo sobra, se quita.
3. **Líneas finas**: bordes de 1px (hairlines) en `tinta/10`; evitar cajas gruesas.
4. **Un solo CTA principal por vista.**
5. **Micro-interacciones discretas**: transiciones 150–250ms de color/opacidad;
   sin elevación ni sombras de tarjeta (la profundidad la da el contraste).
6. **ESQUINAS RECTAS en toda la UI**: cero `border-radius` en tarjetas,
   botones, inputs, badges, chips, contadores y paneles (lenguaje editorial de
   moda, ref. lenceriaambar.com.co). Únicas excepciones: controles nativos del
   navegador y el loader de tres cuadros `.carga-puntos`.
7. **Sin adornos decorativos**: nada de emojis como iconografía; usar SVG de
   trazo fino (stroke 1.25–1.5) en color tinta o taupe.

## Componentes clave

### Regla de marcos
- **Con borde (marco)**: solo campos de formulario (inputs, selects,
  textarea), paneles/tarjetas de contenedor y las tarjetas de selección de
  login y checkout (dirección, método de pago) — el marco comunica "área de
  campo o formulario".
- **Sin borde (masa sólida o fondo nude)**: **todos los botones** (primario,
  secondary, ghost, peligro — el secundario es masa blanca y el ghost es
  transparente; ninguno usa contorno) y todo chip/selector — paginación,
  pestañas admin, stepper de cantidad, miniaturas de imagen. La selección
  se marca con **masa tinta sólida** (activo) o cambio de fondo (hover),
  nunca con un contorno.
- **Estilo nav (helper `estiloNavLink` en `ui/navLink.ts`)**: fila de
  Colecciones (home), chips de categoría del catálogo ("Todas, Bodys,
  Conjuntos…") y **selector de tallas** de la ficha son
  **enlaces-estilo-nav** — versalitas `text-[11px]` + `tracking-[0.18em]` +
  `underline-offset-[10px]`; **activo** = `text-tinta underline decoration-tinta`,
  **inactivo** = `text-tinta/70 hover:underline`, **agotado** = `text-tinta/35`
  sin subrayado. Sin relleno, sin caja, sin masa. Petición explícita del
  usuario: «como los de Colecciones».
- **Colecciones (home) — franja superior**: los nombres de colección van en
  una **franja `nav[aria-label="Colecciones"]` bajo el header y sobre el
  hero** (fondo crema = fondo de página, sin caja ni borde; `min-h-11`
  reservado desde el render inicial para evitar saltos al cargar; ancho
  `w-max` centrado con `mx-auto` y scroll horizontal `scroll-sutil` en
  móvil). Enlaces **estilo navbar**: versalitas `text-[11px]`
  `tracking-[0.18em]`, `underline-offset-[10px]`, subrayado en hover
  (`text-tinta/70 → hover:text-tinta`, helper `estiloNavLink`). **Sin
  sección de título en el cuerpo**: la franja reemplaza al bloque
  «Colecciones» con `SectionTitle`. *(Se probó: título+lista en el cuerpo,
  foto grande y mini carrusel — todo descartado por el usuario; no
  reintroducir sin pedirlo.)*
- **Quitar un marco NUNCA cambia la tipografía del elemento salvo petición
  explícita**: los chips con masa (paginación, pestañas admin, stepper)
  conservan su `text-sm font-semibold` original. La excepción son los
  controles ya migrados al **estilo nav** (colecciones, chips de catálogo,
  tallas), cuyo cambio de tipografía el usuario pidió textualmente.

### Patrón Header editorial
- **Tres zonas en grid** (`grid-cols-[1fr_auto_1fr]`, h-16 móvil / h-20
  escritorio): nav en versalitas a la izquierda, **wordmark "NOCTURNA"
  centrado** en Playfair versalitas espaciadas (`tracking-[0.35em]`, ajuste
  óptico `[margin-right:-0.35em]`), cuenta + carrito a la derecha.
- Enlaces nav con **subrayado en hover** (`underline-offset-[10px]`); el
  activo va subrayado — sin cajas ni fondos. "Ingresar" va igual: texto
  limpio con subrayado, **sin caja de hover**.
- Carrito: **icono de carrito a trazo crema** (dos ruedas + carro, sin masa
  ni fondo sólido), hover `bg-crema/10` y contador vino esquinero pegado a
  la esquina superior derecha.
- Drawer móvil: overlay **full-screen tinta** con links en Playfair 2xl
  separados por hairlines, acción de sesión en versalitas y bloqueo de
  scroll del body (`document.body.overflow`).

### Patrón Hero editorial (página de inicio)
- **Banner BREVE, CENTRADO y SIN CTAs (decisiones explícitas del usuario)**:
  `min-h-[45vh]`, contenido centrado (`items-center` + `text-center`),
  **sin foto, sin párrafo y sin botones**: hairline corta `bg-humo/60` +
  eyebrow (acento-claro) + titular `max-w-2xl` en **Bodoni Moda**
  (`font-banner`, token nuevo; didone de moda cargada en Google Fonts) con
  **color blanco puro `text-white`** en ambas partes (regular + itálica).
  El resto del sitio sigue en Playfair Display (`font-display`).
  Todo el peso lo lleva la tipografía y el color.
- **Color compuesto por capas** (tokens de la skill `paleta-negros`):
  halo `radial-gradient(… var(--color-grafito) …)` arriba-derecha →
  lavado `from-noir/90 → transparent` desde la base → mancha
  `bg-acento/10 blur-[110px]`. Máximo 3 capas; nunca `#000` plano ni
  grises fríos. *(Se probaron: foto de la API, foto manual, 85vh, CTAs,
  párrafo — todo descartado; no reintroducir sin pedirlo.)*
- Titular Playfair **peso medio** (`font-medium`); sobre este fondo solo
  texto `crema`/`acento-claro` (contraste AA).

### Banda lookbook (a sangre, opcional)
- Sección full-bleed entre bloques del home: imagen real de la API +
  `bg-tinta/60`, cita corta en Playfair itálica centrada y link "Ver la
  colección" con subrayado fino (no botón sólido). Se renderiza solo si hay
  segunda imagen disponible.

### Título de sección (SectionTitle)
- Serif peso medio + **hairline** (`h-px flex-1 bg-tinta/15`) que llena la
  línea hasta la acción opcional a la derecha (recurso de revista de moda).
  Las acciones laterales van en versalitas con subrayado fino.

### Resto de elementos
- **Tarjeta de producto**: **sin caja ni sombra** (borderless, editorial):
  imagen **4:5 rectangular — SIN forma de arco** (decisión explícita del
  usuario; el arco de Ámbar queda descartado) sobre fondo nude con zoom
  sutil y **segunda foto en hover** cuando existe; etiqueta de categoría en
  versalitas, nombre en Playfair con subrayado en hover, precio en Playfair.
  **Entrada animada al scroll**: fade + slide-up 700ms con
  `IntersectionObserver`, respetando `prefers-reduced-motion` (si lo reduce
  o no hay IO, la tarjeta nace visible). Badge de descuento: etiqueta negra
  sólida (`bg-tinta text-crema`), esquinas rectas, texto corto (ej. `−20%`).
- **Galería de la ficha de producto**: la foto va con su **ratio
  intrínseco** (`h-auto w-full` — sin `object-cover` ni `aspect` fijo →
  **nunca se recorta**) dentro de `mx-auto max-w-[407px]`, igual al ancho
  mínimo de las fuentes actuales (`public/images/`, 407–652 px). Así se
  muestra **1:1, jamás ampliada** — ampliar era lo que la hacía ver
  borrosa y recortada (medido en vivo: retrato 407×616 → 407×616,
  ampliación 1.000; paisaje 652 → 407, reescalado). Fotos futuras de mayor
  resolución en la misma carpeta el cap las reduce → sigue nítida. Las
  miniaturas (64px) sí mantienen `object-cover`.
- **Toolbar del catálogo**: buscador a la izquierda + **selector de orden**
  a la derecha (`?sort=` del contrato: Más recientes, Destacados, Precio ↑,
  Precio ↓, Mejor valorados) sincronizado con la URL. El select es campo de
  formulario → **conserva el borde**.
- **Botón primario**: `bg-tinta text-crema`, **esquinas rectas y plano**,
  texto en versalitas (uppercase, `tracking-[0.15em]`, 11–14px), hover
  `bg-tinta-suave`; sin sombra ni elevación.
- **Botón secundario**: blanco con borde 1px tinta; hover fondo nude.
- **Header**: ver "Patrón Header editorial" (grid tres zonas, wordmark
  centrado, drawer móvil full-screen).
- **Inputs**: fondo blanco, borde 1px taupe/30, **esquinas rectas**, focus
  outline tinta (crema en fondos oscuros).
- **Carga**: tres cuadros que pulsan (`.carga-puntos` en index.css); no usar
  spinners circulares.
- **Checkout**: pasos claros (Datos → Envío → Pago), resumen siempre visible.

## Accesibilidad (obligatorio)
- Contraste mínimo 4.5:1 en texto (taupe sobre crema ✓, vino sobre beige fondo ✓).
- Focus visible en todo; en superficies oscuras el anillo de foco es crema.
- Labels en formularios, `alt` descriptivo, estados no solo por color.

## Tono de voz (copy)
- Corto, elegante, en español neutro colombiano. Ejemplos:
  "Lencería que se siente como tú", "Envío discreto a toda Colombia", "Los más deseados".
- Evitar: mayúsculas gritonas, signos excesivos, clichés, emojis.

## Formato de precios (Colombia)
- COP sin decimales: `$ 120.000` (punto de miles). Nunca el símbolo solo.
