# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Compradores en Colombia, en **dos situaciones reales por igual** (confirmado
por el dueño del producto):

- **Mujeres que compran lencería para sí mismas**: les importan la talla
  correcta, la comodidad y la discreción.
- **Personas que compran para otra persona** (regalo o sorpresa): les
  importan la talla, la presentación y que el envío no revele el contenido.

Ambas audiencias pueden comprar, pero el catálogo es **exclusivamente de
lencería de mujer** (confirmado por el dueño del producto): no se vende ropa
interior masculina.

## Product Purpose

Nocturna es una tienda de lencería premium que se prepara para su
**lanzamiento real** (no es una demo). Existe para vender lencería de
calidad en Colombia con una experiencia sobria y discreta: catálogo
curado, tallas claras, checkout con medios de pago locales y entrega con
empaque neutro. El éxito, antes y durante el lanzamiento, es una tienda
que pueda abrir al público sin datos inventados: cada política, contacto y
precio visible debe ser verificable.

## Operating Context

- Mercado y moneda: **Colombia, COP**. Los precios del seed están entre
  ~$79.000 y ~$165.000 COP; hay descuentos con precio tachado.
- Pagos en línea vía **Wompi**: Nequi, Daviplata, PSE, tarjeta débito/crédito
  y Botón Bancolombia.
- Envío declarado a **todo Colombia** con empaque discreto (caja neutra sin
  logos); seguimiento con guía de la transportadora.
- La tienda se opera desde un **panel admin** (pedidos, productos,
  categorías, preguntas de clientes) que comparte el mismo frontend.
- Hay cuentas de prueba del seed (`cliente@tienda.com`, `admin@tienda.com`)
  y datos de catálogo cargados por `backend/prisma/seed.ts`.

## Capabilities and Constraints

**Capacidades confirmadas** (implementadas y consumidas contra
`docs/api-contract.md`):

- Catálogo con categorías, filtros de orden y búsqueda.
- Ficha de producto con variantes (talla), stock, rating, guía de tallas,
  preguntas/reseñas y compra rápida sticky en móvil.
- Carrito, checkout y pedidos con pago Wompi; cuentas de cliente.
- Panel admin con guardia de rol ADMIN.
- Páginas informativas: políticas de envío, garantía y devoluciones, pagos
  seguros; barra de anuncios de envío y chat de WhatsApp flotante.

**Restricciones técnicas**:

- Frontend: React + Vite + TypeScript + Tailwind CSS v4 (`frontend/`).
- Backend: Node + Fastify + Prisma + PostgreSQL (`backend/`).
- **`docs/api-contract.md` es la única fuente de verdad de la API**: el
  frontend no inventa endpoints; los faltantes se anotan allí para el
  agente backend.
- Sin secretos ni claves de pago en el frontend (solo IDs públicos del
  contrato).
- Imágenes de producto locales en `frontend/public/images/` con resolución
  limitada (407–652 px de ancho): no se deben ampliar más allá de su tamaño
  natural.

**Datos operativos aún no definidos** (no inventar; reemplazar antes de
publicar):

- Número real de WhatsApp (hoy placeholder `573000000000`, configurable en
  `frontend/src/config.ts` / `VITE_WHATSAPP_NUMERO`).
- Políticas definitivas de envío (transportadoras, tarifas, plazos exactos)
  y de garantía/devoluciones: los textos actuales son una propuesta
  editable.
- Catálogo y fotografía: **contenido de DEMOSTRACIÓN** (confirmado por el
  dueño del producto). Los 10 productos, precios, reseñas y fotos del seed
  se reemplazarán por el catálogo real antes del lanzamiento; no se deben
  presentar como oferta vigente.

## Brand Commitments

- Nombre y wordmark: **Nocturna**.
- Voz: español de Colombia, sobria, editorial, sensual sin ser explícita;
  la discreción es una promesa de marca ("envío discreto", "solo tú sabes
  qué hay adentro").
- Identidad visual existente (vinculante hasta que se pida lo contrario):
  minimalista editorial, esquinas rectas, tipografía serif (Playfair
  Display; Bodoni Moda para el banner de información), paleta tinta/crema/
  nudes con detalles vino, iconos a trazo 1.5, sin emojis.

## Evidence on Hand

- 10 fotos de producto de demostración en `frontend/public/images/` (PNG,
  407–652 px de ancho; paisajes y retratos mezclados).
- 6 fotos editoriales de demostración en
  `frontend/public/images/editorial/editorial-01..06.avif` (800×1066, 3:4)
  para el home oscuro.
- Contrato de API completo y mantenido en `docs/api-contract.md`, con notas
  abiertas para backend.
- Seed con 10 productos, categorías, variantes y stock en
  `backend/prisma/seed.ts`.
- Skills de diseño del proyecto: `.opencode/skills/ui-design`,
  `tienda-profesional` y `paleta-negros`.

**Ausencias que no se deben fabricar**:

- No hay testimonios, reseñas ni métricas reales de clientes (los del seed
  son de demostración, igual que el catálogo y las fotos).
- No hay casos de éxito, prensa ni certificaciones.
- No hay aún número de contacto público real ni redes sociales verificadas.

## Product Principles

1. **Discreción en todo el recorrido**: empaque neutro, comunicación sobria
   y ninguna superficie que revele el contenido del pedido.
2. **Compra sin fricción de talla**: guía clara, cambios simples y tallas
   visibles; es la duda principal de las dos audiencias.
3. **Nada de datos inventados**: si un plazo, tarifa, contacto o testimonio
   no está confirmado, se marca como placeholder en vez de presentarse como
   verdad.
4. **Colombia primero**: COP, medios de pago locales (Wompi) y envíos
   nacionales como base del diseño de checkout y de la información.
5. **Pre-lanzamiento con calidad de producción**: el código y la UI deben
   estar listos para abrir el día que lleguen los datos operativos reales.

## Accessibility & Inclusion

- Objetivo **WCAG 2.1 AA** en toda la tienda: contraste AA, etiquetas en
  todos los campos, foco visible, navegación por teclado y targets de toque
  de al menos 44×44 px.
- Diseño **mobile-first** (la mayoría del tráfico de compra esperada es
  móvil) y respeto a `prefers-reduced-motion` en animaciones.
