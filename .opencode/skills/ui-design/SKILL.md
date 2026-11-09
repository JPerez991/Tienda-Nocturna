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
- **Estados vacío / error / carga**: **sin marco y sin caja** (se probó el
  rectángulo punteado y se retiró). Se componen centrados con aire (`py-14/16`),
  icono a trazo, `h3` en Playfair y una acción de texto subrayada. El icono y el
  color (vino en error) ya comunican el estado; un borde alrededor es decoración.
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

### Barra de anuncios superior
- Franja fina **encima del header** (queda fuera del sticky: se va al
  hacer scroll, el header permanece): `bg-tinta text-crema`, altura fija
  `h-9`, versalitas `text-[10.5px] tracking-[0.22em]`, mensajes cortos
  centrados de **envíos/confianza** (ej. "Envíos a todo Colombia").
- Rotan cada **5 s** con fundido (`.anuncio` en `index.css`) y
  `prefers-reduced-motion` deja fijo el primero. Máximo 3 mensajes; sin
  `aria-live` (es decorativo, no debe interrumpir al lector de pantalla).

### Patrón Banner de información (página de inicio)
- **Banner BLANCO con ENLACES a la información de la tienda (petición
  explícita del usuario)** — reemplaza al hero de campaña: `bg-white`,
  hairline inferior, `nav aria-label="Información de la tienda"` centrado
  con **Políticas de envío → /envios**, **Garantía y devoluciones →
  /garantia** y **Pagos seguros → /pagos**.
- Enlaces en **Bodoni Moda** (`font-banner`, 18–20px) color `carbon`,
  `min-h-11` (target ≥44px) y subrayado fino en hover; separados por
  hairlines `h-4 w-px bg-tinta/15` (ocultas en móvil, donde se apilan).
- El `h1` queda **solo para lectores de pantalla y SEO** (`sr-only`:
  "Nocturna — lencería premium en Colombia").
- *(Descartados por el usuario, no reintroducir sin pedirlo: foto, 85vh,
  45vh, CTAs, párrafo, fondo tinta con capas de negro y titular de
  campaña.)*

### Contacto flotante (WhatsApp)
- Botón **cuadrado 48×48 tinta** fijo abajo-derecha
  (`right-4 bottom-[calc(1rem_+_env(safe-area-inset-bottom))]`), glifo
  oficial de WhatsApp **a trazo 1.5**, hover `bg-tinta-suave`,
  `aria-label="Chatea con nosotros por WhatsApp"`, `target="_blank"` +
  `rel="noopener noreferrer"`.
- `z-[35]`: por encima de la barra sticky de compra (z-30) y por debajo
  del header/drawer (z-40) para no tapar el menú móvil. La barra sticky de
  la ficha reserva `pr-14 pb-3` para que nunca se superpongan.
- El número vive en **`src/config.ts`** (o `VITE_WHATSAPP_NUMERO` en
  `.env`), nunca hardcodeado en componentes.

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
- **Toolbar del catálogo**: solo **buscador** (`max-w-lg`, campo con borde →
  **conserva el marco**) y a su lado el botón "Buscar" como única masa sólida.
  El **selector de orden se retiró a petición del usuario** (no reintroducirlo
  sin pedirlo): el parámetro `?sort=` del contrato se sigue leyendo de la URL
  porque los enlaces del home lo usan (`price-desc`), pero no hay control
  visible.
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

## Home editorial oscuro (implementado — patrón vigente)

El **home** es la única superficie totalmente oscura. El **catálogo es mixto**
(banda noir + grilla crema) y la ficha de producto, el carrito, el checkout, la
cuenta y el admin van en crema. El usuario pidió explícitamente "no todo en
negro": el negro enmarca y el crema deja respirar las fotos. Cualquier
componente compartido que se use en ambos mundos expone
`tono?: "claro" | "oscuro"` (por defecto `claro`, para no tocar el resto de la
app).

- **Orden de secciones (cerrado, no reordenar sin pedirlo)**:
  índice de colecciones → `Hero` → `InfoBand` (banner blanco) → `La selección`
  → `Manifesto` → `GalleryScroll` → `Marquee` → `LookbookClose` → confianza →
  footer.
- El **banner blanco va después del hero** — decisión móvil: si va antes,
  empuja el `h1` bajo el pliegue.
- **`Hero`**: tipografía a la izquierda (Bodoni `max-w-[13ch]`, clamp
  2.7→4.6rem) y foto 06 a sangre en la mitad derecha con parallax de 8%;
  móvil: foto 52svh arriba y `h1` visible en la primera pantalla. **Prohibido**
  reintroducir: hero de 45vh/85vh, foto centrada como fondo con titular
  encima, CTAs múltiples o párrafo largo.
- **`InfoBand`**: solo los 3 enlaces de servicio (`/envios`, `/garantia`,
  `/pagos`), blancos, en Bodoni, con `data-tema="claro"` para que el foco sea
  tinta. Sin titular de campaña ni foto (petición explícita del usuario).
- **`La selección`** (antes "Los más deseados"): `GET /api/products?limit=8&sort=price-desc`
  — el `featured` del contrato ordena por valoración y con las reseñas de
  demostración empatadas devolvía un orden arbitrario que abría la grilla con
  la foto rosa `11_peonia`. Precio descendente = piezas más elaboradas
  primero y una secuencia tonal coherente con el noir. 8 piezas escritorio,
  4 en móvil (`hidden lg:block` desde la quinta).
- **`GalleryScroll`**: único momento coreografiado (craft floor: uno por
  página). Escritorio `sticky` + sección de `240vh` que traduce el `transform`
  del carril con el progreso del scroll y una hairline de progreso; móvil,
  carril nativo con `snap`; con `prefers-reduced-motion` se sustituye por una
  rejilla estática. Nunca movimiento obligado.
- **`Marquee`**: banda infinita de beneficios (44s, se pausa en hover, texto
  real en `sr-only`, máscara en los bordes). Con movimiento reducido queda una
  línea estática.
- **`LookbookClose`**: foto 05 a sangre con velo de noir y una frase + enlace
  subrayado. El CTA sólido vive solo en el hero.
- **Superficies**: `noir` (capa base) para las secciones y `tinta` para el
  chrome (header, franja de colecciones, marquee); separación siempre por
  hairlines `crema/10`, jamás por sombras.
- **Contraste**: los textos secundarios usan `crema/70` o `crema/60` sobre
  noir (≥4.5:1); nunca grises.
- **`data-tema="oscuro"`** en el contenedor del home fija el anillo de foco en
  crema; `data-tema="claro"` hace lo propio en el banner blanco.
- **Sin animación al hover de la foto**: el zoom sutil de `ProductCard`
  (`scale-[1.04]`) se mantiene; no añadir parallax por tarjeta.

### Catálogo mixto: banda noir + grilla crema (implementado — patrón vigente)

El catálogo **no es una página negra**: se parte en dos superficies. Arriba una
**banda noir** que enlaza con el header y concentra la navegación; debajo la
**grilla sobre crema**, donde las fotos se leen sin competir con el fondo. Es la
respuesta a "no quiero todo en negro, juega con negro y crema".

- **Banda noir** (`data-tema="oscuro"` + `bg-noir`): `h1` en Bodoni, párrafo
  `crema/70`, buscador + filtros de categoría. Sin hairline inferior:
  el corte al crema ya separa (una línea extra aquí sería un marco).
- **Grilla crema** (fuera del `data-tema`): contador en versalitas `tibio`,
  `ProductCard` claro (sin `tono`), paginación `estiloNavLink`.
- Buscador: **campo de formulario**, conserva su borde (`border-crema/25`,
  fondo transparente, texto crema). El botón "Buscar" es la única masa sólida
  de la banda: crema con texto tinta. **Sin selector de orden** (retirado a
  petición del usuario).
- Filtros de categoría: `estiloNavLinkOscuro` (versalitas con subrayado). Sin
  cajas ni chips.
- `color-scheme: dark` en `[data-tema="oscuro"]` para que el botón de limpiar
  del buscador y los scrollbars sean oscuros.
- **Qué NO hacer**: volver a pintar toda la página de noir, ni partir la grilla
  en dos tonos (mezclar tarjetas claras y oscuras en la misma fila rompe la
  lectura de precios). Un solo corte horizontal por página.

### Ficha de producto en crema (implementado — decisión del usuario)

- Superficie `bg-crema`; sin `data-tema` (el foco por defecto ya es tinta).
- Migas de pan en versalitas `tibio`; en móvil se ocultan "Inicio" y la
  categoría para que quepa en una línea.
- `h1` en **Bodoni** (`text-tinta`): las páginas llevan Bodoni; Playfair queda
  para los `h2` de sección.
- Etiquetas de categoría/talla/legends en versalitas `acento` o `tibio`;
  tallas con `estiloNavLink`; la guía de tallas es un panel `bg-nude` dentro de
  un `fieldset` con hairline superior (el `legend` queda en la línea: recurso
  editorial, no tarjeta).
- **Nunca un CTA deshabilitado grande en el punto de venta**: sin sesión, el
  botón sólido (tinta) es un enlace a `/login` ("Inicia sesión para agregar");
  la barra sticky móvil muestra "Entrar". Deshabilitado solo si está agotado.
  Una línea explica por qué se pide la cuenta (datos del pedido y de envío).
- Feedback: éxito `bg-tinta/10 text-tinta`, error `bg-vino/10 text-vino`.
- **Barra sticky móvil** (`bg-crema/95` + hairline tinta): vive siempre que el
  CTA principal no esté a la vista, no solo cuando queda por encima — la foto
  3:4 a ancho completo deja el CTA bajo el pliegue en la primera pantalla.
  `pr-14` reserva el hueco del botón flotante de WhatsApp.
- El wrapper del CTA principal lleva `data-cta="principal"`: es el ancla del
  `IntersectionObserver` del sticky (los tests se apoyan en ese atributo, no en
  clases de estilo).
- **No convertir esta página a noir** sin pedido textual: el usuario pidió
  explícitamente que la ficha sea clara para que la tienda "no sea toda negra".

- **Props de tono en componentes compartidos** (todas por defecto `claro`,
  para no alterar las páginas crema): `ProductCard`, `Price`, `Rating`,
  `Badge`, `Button` (`tono="oscuro"` invierte el primario a crema/tinta),
  `Spinner`, `ErrorState`, `EmptyState`, `TrustFranja`, `TrustInline`.
  `estiloNavLinkOscuro` es el par oscuro de `estiloNavLink` (mismas medidas).


