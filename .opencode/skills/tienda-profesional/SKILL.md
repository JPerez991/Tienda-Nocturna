---
name: tienda-profesional
description: Patrones de tienda profesional real (e-commerce de moda/lencería) basados en referencias reales y datos de conversión. Úsalo al crear o modificar fichas de producto, catálogo, carrito, checkout, home merchandising o cualquier pantalla con objetivo de venta.
---

# Skill: Tienda profesional — patrones de e-commerce real

Reglas de **estructura, UX de comercio y conversión** para que Nocturna se
sienta **como una tienda real**, no como un template. Basadas en tiendas y
research reales (ver referencias). La **identidad visual** (paleta, tipografía,
esquinas rectas, marcos) vive en la skill `ui-design`: cuando estética y esta
skill entren en conflicto en lo **visual**, manda `ui-design`; en lo
**estructural y de conversión**, manda esta.

## Referencias estudiadas

- **Ámbar** (lencería real CO, Shopify): toolbar buscador+orden, tarjetas sin
  caja, entrada animada al scroll, precio de oferta con anterior tachado,
  subrayado en hover. (Sin arco en imágenes — decisión de Nocturna.)
- **Baymard Institute** (35 prácticas data-driven; guía #791): el botón
  "Añadir al carrito" debe ser **único y prominente** — botones CTA
  compitiendo restan conversión.
- **Seventh Triangle / Spanx / Allbirds**: PDP en **página larga con
  jerarquía** (no pestañas que esconden info); guía de talla **contextual**;
  imágenes que venden.
- **Datos**: 67% de compradores cita la **calidad de imagen** como factor #1
  (Mobiloud); 4+ imágenes → **+28% conversión** (Shogun); **2-3 badges** de
  confianza máximo junto al CTA (jamás un "cementerio de insignias");
  abandono de carrito en moda **76%** y devoluciones 25–40% (btng.studio) →
  la información de talla y expectativas es anti-abandono.
- **Móvil**: 70–80% del tráfico es móvil; above-the-fold de la PDP debe
  mostrar **imagen + título + precio + valoración + ATC** sin scroll.

## 1. Home (vitrina)

- Orden de la vitrina: anuncio (envío/pago) → hero → colecciones →
  destacados → banda editorial → confianza. Un solo CTA primario por sección.
- Destacados = merchandising: máximo 8 piezas; badge de descuento cuando
  `compareAtPrice` lo justifique (etiqueta tinta sólida).
- Franja de confianza con **2–3 señales reales** (envío discreto, pago Wompi,
  asesoría de talla). Nunca inventar garantías que no existan.

## 2. Catálogo

- Grilla **4 columnas desktop / 2 móvil**; tarjetas borderless con 2ª foto
  en hover (ya implementado).
- Toolbar: buscador + **selector `?sort=`** (ya implementado: Más recientes,
  Destacados, precio ↑/↓, Mejor valorados).
- Estado de agotado visible en la tarjeta cuando `stock === 0` (badge o
  atenuación + texto accesible).

## 3. Ficha de producto (PDP) — la página que vende

- **Above-the-fold móvil** (obligatorio): imagen, título, precio, valoración
  y botón "Añadir al carrito" visibles sin hacer scroll en la mayor parte de
  la pantalla. Si algo falta, compactar la parte superior.
- **CTA único**: un solo "Añadir al carrito" primario (tinta sólida). Nada
  de botones secundarios compitiendo al mismo nivel (Baymard #791).
- **Sticky ATC en móvil**: barra inferior fija con precio + Añadir al
  carrito cuando el CTA principal sale de pantalla; con aire suficiente y
  `env(safe-area-inset-bottom)`.
- **Galería**: ideal **4+ imágenes** (principal, 2ª en hover, miniaturas
  cuadradas seleccionadas por opacidad). Rectangulares 4:5 — **sin arco**.
  Si el producto trae < 4 fotos, el grid de miniaturas muestra las que haya
  sin fingir.
- **Guía de talla contextual**: junto al selector de tallas, no escondida en
  pestañas (patrón Spanx). Con datos reales del producto/contrato; si el
  contrato no expone medidas, enlace/aviso honesto — nunca inventar tablas.
- **Página larga con jerarquía**: sin pestañas (resumen/descripción/envío).
  Orden: galería → categoría → título → rating → precio → descripción →
  tallas → ATC → confianza → reseñas.
- **Señales de confianza junto al ATC**: 2–3 máximo (envío discreto · pago
  seguro Wompi · cambios/asesoría). Mismo set en toda la tienda.
- **Reseñas / prueba social**: estrellas junto al título; bloque de reseñas
  hacia abajo si existe (datos sembrados — no inventar endpoint).

## 4. Carrito

- **Barra de progreso de envío gratis**: faltan $X para envío gratis
  (regla real: gratis ≥ $150.000; `shippingCost` viene del API). Este patrón
  sube el ticket promedio y es estándar en tiendas reales.
- Reducir abandono: cantidad editable, quitar, subtotal y envío **siempre
  visibles** antes de decidir; CTA primario único "Continuar al pago".
- Si el carrito está vacío: estado con CTA directo al catálogo (nunca callejón
  sin salida).

## 5. Checkout

- Resumen del pedido **siempre visible** (precio, envío, total) — ya
  implementado; mantenerlo en cada paso.
- **2–3 señales de confianza junto al botón "Pagar"** (Wompi, pago cifrado,
  envío discreto). Ya existe el aviso de pago seguro: no amontonar más.
- Pasos claros (Datos → Envío → Pago) con el paso actual destacado.
- Errores junto al campo, en lenguaje humano; nunca solo toast volátil.

## 6. Móvil primero (reglas transversales)

- Targets ≥ 44px, texto base ≥ 14px, contraste AA (hereda de `ui-design`).
- Nada crítico detrás de gestos: carrito, precio y CTA siempre a un toque.
- Probar mentalmente cada pantalla a 375px antes de darla por buena.

## 7. Copy y microcopy

- Urgencia **solo si es real**: "¡Quedan N!" solo con `stock <= 5`; jamás
  contadores falsos ni "compradores ahora mismo" inventados.
- Prohibido inventar políticas (cambios, tiempos de entrega): usar solo lo
  que el contrato/seed respalda (envío discreto, $5.000 / gratis ≥ $150.000,
  Wompi).
- Voz: sensual-sobria, corta, en español de Colombia. Sin emojis.

## 8. Qué NO hacer (anti-patrones)

- ❌ Pestañas horizontales que esconden info clave de la PDP.
- ❌ Más de 3 badges de confianza por sección.
- ❌ Múltiples CTA primarios compitiendo en la misma vista.
- ❌ Precio sin precio anterior tachado cuando hay descuento real.
- ❌ Campos sin label, carrito solo en icono sin contador, checkout en una
  sola columna sin resumen.
- ❌ Copiar literalmente a Ámbar (referencia, no plantilla): la identidad es
  Nocturna.

## Checklist antes de publicar una pantalla

1. ¿Above-the-fold móvil completo (imagen/título/precio/CTA)?
2. ¿Un solo CTA primario?
3. ¿2–3 señales de confianza en el punto de decisión?
4. ¿Estados de carga/vacío/error presentes?
5. ¿Targets ≥44px y contraste AA?
6. ¿Sin datos ni políticas inventadas (contrato como fuente)?
7. ¿Estética consistente con `ui-design` (recta, sin marcos en chips)?
