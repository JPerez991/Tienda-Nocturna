# 🔌 Contrato API — Fuente de verdad (backend ↔frontend)

> **Única fuente de verdad.** El BACKEND la produce; el FRONTEND la consume.
> Si el código y este contrato discrepan, se corrige el código.
> Formato: JSON. Autenticación: cookie `token` (httpOnly). Moneda: COP (enteros).

---

## Notas para BACKEND (las escribe el FRONTEND)

### 1. Endpoint de direcciones (BLOQUEA el checkout) — pedido el 2026-10-26
> ✅ **[ATENDIDA 2026-10-26]** Implementado en `backend/src/modules/addresses/` (sección 7 del contrato).
> Respeta tu forma exacta **más un campo extra**: el objeto incluye también `alias`
> (opcional en el `POST`, por defecto `"Casa"`). `phone` debe ser **10 dígitos sin
> espacios** (`400` si no). La primera dirección del usuario se marca `isDefault: true`.
El `POST /api/orders/checkout` pide un `addressId`, pero el contrato no expone
forma de obtenerlo. Sin esto, el frontend no puede completar la compra.
Necesitamos, con sesión (cookie `token`):

#### `GET /api/addresses`
Respuesta `200`:
```json
[{
  "id": "cuid",
  "receiverName": "Ana Gómez",
  "phone": "3001234567",
  "line1": "Cra 7 # 32-16",
  "line2": "Apto 302",
  "city": "Bogotá",
  "department": "Cundinamarca",
  "postalCode": "110111",
  "isDefault": true
}]
```
Devolver `[]` si el usuario no tiene direcciones.

#### `POST /api/addresses`
Body: `receiverName`, `phone`, `line1`, `line2?`, `city`, `department`, `postalCode?`, `isDefault?`.
Respuesta `201`: el objeto creado (con `id`). Errores `400` datos inválidos.

El frontend ya consume estas rutas en `/checkout` (paso "Envío"): si reciben
`404`, muestra el mensaje "el módulo de direcciones aún no está disponible".
En cuanto existan, el flujo funciona sin cambios de código.

### 2. Imagen del item del carrito puede venir sin `imageUrl`
> ✅ **[ATENDIDA 2026-10-26]** Confirmado: `product.imageUrl` SIEMPRE está presente
> dentro de `GET /api/cart`; si el producto no tiene imagen llega como `null`.
El contrato muestra `product.imageUrl` dentro de `GET /api/cart`. El frontend
lo trata como opcional (`string | null`) y muestra un placeholder 👙 si no llega.
Confirmar que el backend siempre incluye la clave (aunque sea `null`), no que
omita el campo.

### 3. Campos del detalle de producto (`GET /api/products/:slug`)
> ✅ **[ATENDIDA 2026-10-26]** Confirmado exactamente como lo asumes (sección 3):
> `description`, `images[]`, `rating`, `reviewCount`, `compareAtPrice` y cada
> variante con `id`, `sku`, `name`, `price` (efectivo), `stock`. Sin cambios en tus tipos.
El contrato solo confirma `variants[]`. El frontend asume también:
`description` (string), `images[]`, `rating`, `reviewCount`, `compareAtPrice`
y que cada variante incluye `id` (se usa como clave y para `variantId` del
carrito), `sku`, `name`, `price`, `stock`. Si alguno no aplica, avisar para
ajustar los tipos en `frontend/src/lib/types.ts`.

### 4. Estados de pedido y de pago
> ✅ **[ATENDIDA 2026-10-26]** Enum canónico de pedidos (7 valores, ya en la BD):
> `PENDING | PAID | PROCESSING | SHIPPED | DELIVERED | CANCELLED | REFUNDED`
> (`PROCESSING` se agregó al enum de Prisma; requiere `npm run db:migrate`).
> Estados de pago (5 valores, **no existe `ERROR`**):
> `PENDING | APPROVED | DECLINED | VOIDED | REFUNDED`.
El frontend mapea `Order.status`: `PENDING | PAID | PROCESSING | SHIPPED |
DELIVERED | CANCELLED`. Confirmar que coinciden con el enum de Prisma.
`Payment.status` se muestra sin traducir; avisar los valores posibles
(por ej. `PENDING | APPROVED | DECLINED | ERROR`) para rotularlos.

### 5. Retorno desde Wompi
> ✅ **[ATENDIDA 2026-10-26]** Confirmado: uso `CORS_ORIGIN` como base y el
> `redirect_url` es exactamente **`{CORS_ORIGIN}/pedidos`** (historial), tal como
> lo pediste y acordamos en la nota 17 / sección D-10. Vale para el checkout y
> para el reintento de pago (`POST /api/orders/:id/pay`).
Tras pagar, Wompi redirige al usuario a una URL que el backend define. El
frontend expone `/pedidos` (historial) y `/pedidos/:id` (detalle). Sugerencia:
usar `{FRONTEND_URL}/pedidos` como `redirect_url` de Wompi. Confirmar que el
backend conoce el origen del frontend (variable `CORS_ORIGIN`) y usarla.

### 6. Formas exactas del módulo ADMIN — pedido el 2026-10-26
> ✅ **[ATENDIDA 2026-10-26]** Todos los endpoints de tu lista existen con las
> formas exactas que documentaste; las formas FINALES (con los campos extra que
> agregué) están en las secciones 5 y 6. Cambios puntuales que debes conocer:
> - `PATCH /api/admin/products/:id`: `images` se **reemplaza completo** (lista
>   total); `variants` se **sincroniza por SKU** (los que quiten el formulario se
>   borran; si una variante ya tiene pedidos se pone `isActive: false` en vez de borrarse).
> - `DELETE /api/admin/products/:id` → `204`; `409` "No se puede eliminar: ya tiene
>   pedidos asociados". `DELETE /api/admin/categories/:id` → `204`; `409` si tiene productos.
> - `GET /api/admin/questions` y `GET /api/admin/products` / `GET /api/admin/categories`
>   ya no son FALTA: ver secciones 6 y 3.
La sección 6 lista los endpoints pero no define bodies/respuestas. El frontend
del panel admin (`/admin`) consume lo siguiente; si el backend implementa otra
forma, avisar para ajustar `frontend/src/lib/api.ts` y `types.ts`:

#### `GET /api/admin/orders`
Respuesta `200`: arreglo de pedidos. El frontend renderiza defensivo (muestra
lo que venga), pero idealmente incluye:
```json
[{
  "id": "cuid", "orderNumber": "NA-2026-000123", "status": "PAID",
  "total": 185000, "createdAt": "2026-10-26T12:00:00Z",
  "user": { "id": "cuid", "email": "cliente@ejemplo.com", "firstName": "Ana", "lastName": "Gómez" },
  "items": [{ "id": "cuid", "name": "Sujetador Encaje Aurora", "quantity": 1, "unitPrice": 180000 }]
}]
```
`user` e `items` son opcionales en el frontend; sin ellos solo se omite esa fila.

#### `PATCH /api/admin/orders/:id/status`
Body: `{ "status": "SHIPPED" }` (uno de `PENDING | PAID | PROCESSING |
SHIPPED | DELIVERED | CANCELLED`). Respuesta `200`: el pedido actualizado.
Errores: `400` estado inválido · `404` pedido inexistente.

#### `POST /api/admin/products` · `PATCH /api/admin/products/:id`
Body (PATCH: mismos campos, todos opcionales):
```json
{
  "name": "Sujetador Encaje Aurora",
  "slug": "sujetador-encaje-aurora",
  "description": "Encaje francés con aro y copas moldeadas…",
  "price": 180000,
  "compareAtPrice": 220000,
  "categoryId": "cuid",
  "images": [{ "url": "https://...", "alt": "Sujetador Encaje Aurora" }],
  "variants": [{ "sku": "SAU-AUR-M", "name": "Talla M", "price": 180000, "stock": 5 }]
}
```
Respuesta `201`/`200`: el producto creado/actualizado. Errores: `400` datos
inválidos · `409` slug duplicado.
Falta confirmar: ¿quién sube las imágenes? El frontend usa URL directa mientras
no exista endpoint de upload.

#### `POST /api/admin/categories`
Body: `{ "name": "Sujetadores", "slug": "sujetadores", "imageUrl": "https://..." }`.
Respuesta `201`: la categoría creada. Errores: `400` · `409` slug duplicado.

#### `PATCH /api/admin/questions/:id`
Body: `{ "answer": "Sí, tenemos de la S a la XL." }`. Respuesta `200`: la
pregunta actualizada (con `status: "ANSWERED"`).

#### `GET /api/admin/questions` — ✅ ATENDIDA 2026-10-26
El endpoint de responder existe, pero no hay forma de listar las preguntas.
El frontend ya lo consume en `/admin/preguntas`; mientras devuelva `404`
muestra "el listado aún no está disponible". Respuesta `200` sugerida:
```json
[{
  "id": "cuid", "question": "¿De qué material es?", "answer": null,
  "status": "PENDING", "createdAt": "2026-10-26T12:00:00Z",
  "product": { "id": "cuid", "name": "Sujetador Encaje Aurora", "slug": "sujetador-encaje-aurora" },
  "user": { "firstName": "Ana" }
}]
```

#### `DELETE /api/admin/products/:id` y `DELETE /api/admin/categories/:id` — ✅ ATENDIDA 2026-10-26
Confirmado: ambos existen. `204` al borrar; `409` si el producto ya tiene pedidos
asociados o la categoría tiene productos. La sección 6 dice "CRUD" pero solo lista POST/PATCH. El frontend aún no
implementa borrado; si se necesita, confirmar aquí primero.

### 7. Ordenamiento y destacados en `GET /api/products` — pedido el 2026-10-26
> ✅ **[ATENDIDA 2026-10-26]** Implementado (sección 3). Semántica final:
> `newest` = más recientes · `price-asc`/`price-desc` = por precio · `rating` =
> mejor valoración (desempate: más reseñas) · `featured` = mejor valoración
> (desempate: los más recientes). Sin `sort` = `newest` (el orden de siempre).
> `rating`/`featured` se calculan en memoria sobre el catálogo completo (tope 500 productos).
El catálogo necesita un selector de orden y el Home una sección "Destacados".
Query sugerida (todas opcionales; sin `sort` se mantiene el orden actual):
`?sort=featured | newest | price-asc | price-desc | rating`
Forma de respuesta: idéntica a la actual (`{ items, page, totalPages, total }`).

### 8. Carrito, checkout, pedidos y admin: orden de implementación — pedido el 2026-10-26
> ✅ **[ATENDIDA 2026-10-26]** Todo el orden listado aquí quedó implementado
> (carrito, checkout + webhook, pedidos y admin). `POST /api/cart` es **upsert que
> SUMA la cantidad**, tal como preferiste (nunca `409` por duplicado).
Las secciones 4–6 del contrato ya definen las formas; el frontend ya las
consume. Orden de prioridad para implementar **exactamente** ese contrato:
1. Carrito (`GET/POST/PATCH/DELETE /api/cart`) — bloquea todo el flujo de compra.
2. Checkout (`POST /api/orders/checkout`) + Webhook Wompi.
3. Pedidos (`GET /api/orders`, `GET /api/orders/:id`).
4. Admin (sección 6 + puntos 6 y 15 de estas notas).
Aclaración sobre `POST /api/cart`: si la variante ya está en el carrito,
¿suma la cantidad (upsert) o devuelve `409`? El frontend prefiere **upsert**.

### 9. Métodos de pago válidos — confirmar el 2026-10-26
> ✅ **[ATENDIDA 2026-10-26]** Acepto los **6 literales** que confirmaste en la
> nota 17: `NEQUI · DAVIPLATA · PSE · CREDIT_CARD · DEBIT_CARD · BANCOLOMBIA`.
> Además, por compatibilidad acepto el alias `"CARD"` y lo **normalizo a
> `CREDIT_CARD`** (deprecado: usa el literal canónico). `payment.method` SIEMPRE
> devuelve el valor canónico de la BD (`CREDIT_CARD`, no `CARD`).
El contrato solo muestra `paymentMethod: "NEQUI"`. El frontend muestra
Nequi / PSE / Tarjeta (`NEQUI | PSE | CARD`). Confirmar el enum exacto que
acepta `POST /api/orders/checkout` y devuelve `payment.method`; si falta
alguno (ej. `BANCOLOMBIA`), se ajusta el paso "Pago".

### 10. Costo de envío y desglose de totales — confirmar el 2026-10-26
> ✅ **[ATENDIDA 2026-10-26]** Regla aplicada y confirmada en tu nota 17:
> **$5.000 COP fijo, GRATIS si `subtotal ≥ 150.000`.** `shippingCost` está en
> `GET /api/cart`, en la respuesta de `POST /api/orders/checkout` (`subtotal`,
> `shippingCost`, `total`) y en `GET /api/orders/:id`.
El ejemplo de checkout muestra `total: 185000` con carrito de `subtotal: 180000`
(¿+ 5.000 de envío?). El resumen del pedido debe ser honesto antes de pagar.
Necesitamos saber si hay costo de envío (¿fijo? ¿gratis sobre un monto?
¿por ciudad?). Si lo hay, forma sugerida:
- `GET /api/cart` agrega `"shippingCost": 0`.
- `POST /api/orders/checkout` respuesta agrega `"subtotal"`, `"shippingCost"`,
  `"total"` (total = subtotal + shippingCost).
- `GET /api/orders/:id` incluye `shippingCost` y la `address` usada.
Si no hay costo, confirmarlo y el frontend mostrará "Envío gratis".

### 11. Reintentar pago de un pedido PENDING — pedido el 2026-10-26
> ✅ **[ATENDIDA 2026-10-26]** Implementado (sección 5). Respuesta `200`:
> `{ "redirectUrl": "...", "payment": { "id", "method", "status", "redirectUrl" } }`
> (incluyo `redirectUrl` también dentro de `payment` para cubrir tu ejemplo).
> Errores: `400` si no está `PENDING` o el pago ya se procesó · `404` inexistente · `403` no es tuyo.
Si el usuario cierra el navegador tras crear el pedido o Wompi no lo paga,
queda un pedido PENDING sin forma de pagar. Necesitamos:
#### `POST /api/orders/:id/pay`
Requiere sesión y dueño del pedido. Respuesta `200` (mismo bloque de pago
del checkout): `{ "redirectUrl": "https://checkout.wompi.co/...", "payment": { "id", "method", "status" } }`.
Errores: `400` si el pedido no está PENDING · `404` inexistente · `403` no es suyo.
El frontend lo usa en `/pedidos/:id` con el botón "Completar pago".

### 12. Cancelar pedido (opcional, baja prioridad) — pedido el 2026-10-26
> ✅ **[ATENDIDA 2026-10-26]** Implementado (sección 5). Devuelve el pedido
> completo con `status: "CANCELLED"` y repone el stock reservado.
`POST /api/orders/:id/cancel` — solo pedidos `PENDING`; repone stock.
Respuesta `200`: el pedido con `status: "CANCELLED"`. Sin esto, el botón
"Cancelar" simplemente no se muestra.

### 13. Preguntas de clientes (lado público) — pedido el 2026-10-26
> ✅ **[ATENDIDA 2026-10-26]** Ambos endpoints implementados (sección 8).
> `GET` devuelve solo `ANSWERED` con `{ id, question, answer, status, createdAt,
> answeredAt, user: { firstName } }`; `POST` responde `201` con la misma forma y
> `status: "PENDING"`. Errores: `404` producto · `400` pregunta < 3 caracteres.
Existe `PATCH /api/admin/questions/:id` pero no hay forma pública de listar o
enviar preguntas; el módulo Q&A quedaría de un solo lado. Necesitamos:
#### `GET /api/products/:slug/questions` (público)
Solo preguntas `ANSWERED`. Respuesta `200`:
```json
[{ "id": "cuid", "question": "¿De qué material es?", "answer": "Encaje francés con microfibra.",
   "answeredAt": "2026-10-26T12:00:00Z", "user": { "firstName": "Ana" } }]
```
#### `POST /api/products/:slug/questions` (requiere sesión)
Body: `{ "question": "¿Llega a Medellín?" }`. Respuesta `201`: la pregunta
creada (`status: "PENDING"`). Errores: `400` texto vacío · `404` producto.
Esto también es la fuente de datos de `GET /api/admin/questions` (nota 6).

### 14. Reseñas (`rating` / `reviewCount`) — aclarar alcance
> ✅ **[ATENDIDA 2026-10-26]** Opción (a): `rating`/`reviewCount` son datos
> sembrados (tabla `Review`, promediados por el backend). **No** habrá endpoint
> de reseñas en esta fase. Muestra las estrellas tal cual lleguen.
El catálogo muestra estrellas y `reviewCount`, pero no existe endpoint de
reseñas. Confirmar una de dos: (a) `rating`/`reviewCount` son datos sembrados
y no habrá módulo de reseñas (el frontend solo los muestra), o (b) habrá
`GET /api/products/:slug/reviews` (público) y `POST` (sesión, `{ rating, comment }`).
Esto NO bloquea; el frontend muestra las estrellas tal cual lleguen.

### 15. Admin: listados para editar — pedido el 2026-10-26
> ✅ **[ATENDIDA 2026-10-26]** Implementados (secciones 3 y 6):
> `GET /api/admin/products` → misma forma paginada pública (`{ items, page,
> totalPages, total }`), mismos filtros (`?q`, `?category`, `?sort`, `?page`,
> `?limit`) e incluye productos inactivos. `GET /api/admin/categories` → misma
> forma pública. Ambos requieren rol ADMIN (`401` sin sesión · `403` si es CUSTOMER).
Para editar (PATCH) o eliminar un producto/categoría, el panel admin necesita
primero conocerlos. Se piden:
#### `GET /api/admin/products` — misma forma pública de `GET /api/products`
(paginado: `{ items, page, totalPages, total }`); puede incluir campos extra
internos si se desea.
#### `GET /api/admin/categories` — misma forma que `GET /api/categories`.

### 16. `GET /api/auth/me` con nombre completo y teléfono (opcional)
> ✅ **[ATENDIDA 2026-10-26]** `me` ahora devuelve `{ id, email, firstName,
> lastName, phone, role }` (`phone` puede ser `null` si no se registró).
El registro recolecta `lastName` y `phone` pero `me` no los devuelve. Para
prefill de "Mi cuenta" y del paso "Datos" del checkout, sería útil que `me`
incluya `"lastName"` y `"phone"`. Baja prioridad.

### 17. Respuestas del FRONTEND a la sección D del backend — 2026-10-26
> ✅ **[RECIBIDAS / APLICADAS 2026-10-26]** Todo lo que confirmaste aquí quedó
> reflejado en el backend: `redirect_url = {CORS_ORIGIN}/pedidos` (en producción
> solo cambia `CORS_ORIGIN`), regla de envío $5.000 / gratis ≥ $150.000 aplicada,
> los 6 literales de pago aceptados, imágenes por URL directa y `me` con
> `lastName` + `phone`. No falta nada por tu lado en esta nota.
1. **URL del frontend para Wompi**: en desarrollo `http://localhost:5173`
   (idéntica a `CORS_ORIGIN`). La URL de producción **aún no está definida**;
   te la confirmaremos en cuanto se defina el dominio. Usa `CORS_ORIGIN` hasta
   entonces.
2. **Regla de envío confirmada**: $5.000 fijo, GRATIS si `subtotal ≥ 150.000`.
   Nos sirve tal cual. Recuerda exponer `shippingCost` en `GET /api/cart`,
   en la respuesta de `POST /api/orders/checkout` (`subtotal`, `shippingCost`,
   `total`) y en `GET /api/orders/:id`; el frontend lo muestra en el resumen
   del carrito, del checkout y del pedido (y "Envío gratis" cuando aplique).
3. **Enum de métodos de pago confirmado**: el paso "Pago" ofrecerá **6 opciones
   con el literal exacto**, sin agrupar:
   `NEQUI` · `DAVIPLATA` · `PSE` · `CREDIT_CARD` · `DEBIT_CARD` · `BANCOLOMBIA`.
   (No usaremos un solo botón "Tarjeta" para no adivinar el literal.)
4. **Imágenes**: confirmado, **URL directa** en `images[].url` por ahora; el
   frontend no implementa upload.
5. **Campos extra**: agregar `lastName` y `phone` a `GET /api/auth/me`
   (nuestra nota 16). El resto ya está contemplado.

Además, por las respuestas A–B: el frontend ya ajustará sus mapeos a
`PENDING | PAID | PROCESSING | SHIPPED | DELIVERED | CANCELLED | REFUNDED`
(pedidos) y `PENDING | APPROVED | DECLINED | VOIDED | REFUNDED` (pagos).

### 18. Rebrand de la tienda: ya NO es navideña — 2026-10-26
> ✅ **[ATENDIDA 2026-10-26]** 1) **Semilla 100% lencería**: categorías
> (Sujetadores, Panties, Conjuntos, Pijamas, Bodys, Kimonos), 10 productos con
> tallas S/M/L/XL y reseñas, más una **dirección demo** y **preguntas demo** del
> cliente para probar checkout y Q&A de inmediato. 2) **Ejemplos de este
> contrato limpios**: "Pino artificial" → "Encaje francés…", sku `ARB-15-ROJ` →
> `SAU-AUR-M`, categoría "Árboles" → "Sujetadores", variantes "Rojo" → "Talla M".
La tienda pasó de "Casa Navideña" a **Nocturna — lencería premium**
(identidad y paleta del frontend cambiadas; ver skill `ui-design`). Pedidos:
1. **Semillas (data)**: productos, categorías, descripciones y usuarios demo
   deben ser de **lencería** (sujetadores, conjuntos, bodys, encaje, seda…),
   no de decoración/navidad.
2. **Ejemplos de este contrato**: reemplazar los residuos navideños
   (ej. `"description": "Pino artificial…"`, variant sku `ARB-15-ROJ`,
   "Árbol de navidad…") por ejemplos de lencería, para que la fuente de
   verdad no contradiga la marca.

### 19. Discrepancia menor del seed: dirección demo no aparece — 2026-10-26
Verificación end-to-end del frontend (login `cliente@tienda.com`, catálogo,
carrito, checkout, creación de dirección y paso de pago): **todo funciona**.
Detalle: la nota 18 / sección c-5 dice que la semilla incluye una **dirección
demo para `cliente@tienda.com`**, pero `GET /api/addresses` devuelve `[]` para
ese usuario (el frontend la creó manualmente en la prueba). Revisar que el
seed asigne la dirección al usuario correcto. No bloquea nada: el formulario
"Nueva dirección" nuevo funciona y quedó verificado.

### 20. Imágenes de producto: ahora son archivos locales `/images/…` — 2026-10-26
Se reemplazaron los placeholders `picsum.photos` por **fotos reales** provistas por el
usuario (**11 fotos → 11 productos**; la 11ª es `.avif`). Cómo quedó resuelto:
- Las fotos viven en **`frontend/public/images/`** y las sirve Vite (dev y build).
- El seed (`prisma/seed.ts`) ahora usa un mapa **`IMAGES` (slug → archivo)** y guarda en
  `ProductImage.url` una **ruta relativa al origen**: `/images/<archivo>`
  (ej. `/images/01_body_negro.png` o `/images/11_peonia.avif`). **Por favor conserva ese
  mapa y no lo vuelvas a `picsum.photos`.**
- Al ser ruta relativa, el `<img src="/images/…">` la resuelve contra el origen del
  frontend (5173) sin tocar el proxy `/api`. Compatible con la nota 17.4
  ("URL directa, sin upload"): sigue **sin** existir endpoint de upload.
- Verificado end-to-end: las 11 cargan en el navegador (`naturalWidth > 0`), sin 404. Vite
  sirve `.avif` con `Content-Type: image/avif` (navegadores modernos lo renderizan).
- Se agregó al seed el producto **11**: «Panty Tanga Cordón "Peonía"»
  (`panty-tanga-cordon-peonia`, categoría `panties`, imagen `/images/11_peonia.avif`).
  El usuario tenía previstas **2** fotos nuevas, pero la **2ª aún no llegó**: si la aporta,
  se le sumará un producto 12 al seed con su foto.

## Notas para FRONTEND (las escribe el BACKEND)

### ✅ RESPUESTAS DEL BACKEND — 2026-10-26

**A. Respuestas a tus 5 preguntas**
1. **¿Carrito requiere sesión?** → **SÍ.** Sin cookie `token` respondo `401`. Redirige a `/login` al intentar agregar si no hay sesión. Confirmado.
2. **Métodos de pago (enum EXACTO)** → `NEQUI | DAVIPLATA | PSE | CREDIT_CARD | DEBIT_CARD | BANCOLOMBIA`. El checkout acepta cualquiera. Puedes agrupar `CREDIT_CARD`+`DEBIT_CARD` como "Tarjeta" en la UI, pero envía el valor literal.
3. **Costo de envío (regla decidida)** → **$5.000 COP fijo; GRATIS si `subtotal ≥ 150.000`.** Expondré `shippingCost` en `GET /api/cart`, en `POST /api/orders/checkout` (`subtotal`, `shippingCost`, `total`) y en `GET /api/orders/:id`.
4. **Agregar variante ya en el carrito** → **upsert: SUMA la cantidad.** No devuelvo `409`. Coincide con tu preferencia.
5. **Reseñas** → por ahora `rating`/`reviewCount` son **datos sembrados** (tabla `Review`). **No** habrá endpoint de reseñas en esta fase (opción a). Muestra las estrellas tal cual lleguen.

**B. Confirmaciones de forma**
6. **Imagen en el carrito** → SIEMPRE incluyo la clave `imageUrl` dentro de `product` (aunque sea `null`). Nunca omito el campo.
7. **Detalle de producto** → confirmado: incluye `description`, `images[]`, `rating`, `reviewCount`, `compareAtPrice`, y cada variante con `id`, `sku`, `name`, `price`, `stock`. Tu nota 3 es correcta.
8. **Estados de pedido (enum canónico)** → `PENDING | PAID | PROCESSING | SHIPPED | DELIVERED | CANCELLED | REFUNDED`. **Agregaré `PROCESSING`** al enum (pago confirmado, preparando envío). Ajusta tu mapeo a estos 7 valores.
9. **Estados de pago** → `PENDING | APPROVED | DECLINED | VOIDED | REFUNDED`. **No existe `ERROR`**; los fallos se reportan como `DECLINED`.
10. **Retorno desde Wompi** → usaré `CORS_ORIGIN` (= `http://localhost:5173` en dev) como base y redirigiré a `{CORS_ORIGIN}/pedidos`. Correcto tu supuesto.

**C. Lo que voy a implementar (tus notas), en este orden**
- `GET/POST/PATCH/DELETE /api/cart` (upsert, `shippingCost`) — nota 8.
- `GET/POST /api/addresses` — nota 1.
- `POST /api/orders/checkout` + webhook Wompi + `POST /api/orders/:id/pay` — notas 6, 11.
- `GET /api/orders`, `GET /api/orders/:id` (con `shippingCost` y `address`).
- `?sort=` en `GET /api/products` — nota 7.
- Preguntas públicas `GET/POST /api/products/:slug/questions` — nota 13.
- Admin: `GET /api/admin/orders`, `GET /api/admin/products`, `GET /api/admin/categories`, `GET/POST/PATCH/DELETE` productos/categorías, `GET /api/admin/questions` — notas 6 y 15.
- `GET /api/auth/me` devolverá también `lastName` y `phone` — nota 16.
- `POST /api/orders/:id/cancel` (repon stock) — nota 12.

**D. ⚠️ Lo que NECESITO del FRONTEND (confirma aquí o dime)**
1. **URL real del frontend** para el `redirect_url` de Wompi. Asumo `http://localhost:5173` en desarrollo. **¿En producción será otra?** (ej. `https://tienda.com`). Indícala cuando la definas.
2. **Confirma la regla de envío** ($5.000, gratis ≥ $150.000) — ¿te sirve para el resumen de compra? Si prefieres otro monto o "envío gratis siempre", dilo y lo cambio.
3. **Confirma el enum de métodos de pago** que mostrarás en el paso "Pago", para que el checkout coincida exactamente.
4. **Imágenes de producto**: las manejas con **URL directa** (sin endpoint de upload) por ahora — ¿correcto? (asumo sí mientras no exista upload).
5. Cualquier **campo extra** que necesites en las respuestas existentes (auth, catálogo) que no esté contemplado, pídelo y lo agrego.

---

### ✅ ESTADO FINAL — RONDA 2 (2026-10-26): TODO IMPLEMENTADO

**(a) Listo y verificado** (compilación limpia + smoke test OK). Todo lo de la sección C anterior existe hoy en el backend:

- `GET/POST/PATCH/DELETE /api/cart` (upsert que suma · `shippingCost` · errores abajo).
- `GET/POST /api/addresses` → sección 7.
- `POST /api/orders/checkout` + `POST /api/payments/webhook/wompi` (firma HMAC) + `POST /api/orders/:id/pay` + `POST /api/orders/:id/cancel`.
- `GET /api/orders` · `GET /api/orders/:id` (con `subtotal`, `shippingCost`, `discount`, `total` y `address`).
- `?sort=featured|newest|price-asc|price-desc|rating` en `GET /api/products` (nota 7).
- `GET/POST /api/products/:slug/questions` → sección 8 (nota 13).
- Admin completo (sección 6): pedidos, estados, productos CRUD, categorías CRUD, preguntas (notas 6 y 15).
- `GET /api/auth/me` con `lastName` y `phone` (nota 16).
- Semilla a lencería + dirección y preguntas demo (nota 18). Ejemplos del contrato limpios.

**(b) Formas FINALES que difieren de lo que asumiste** (todas documentadas en las secciones 2–8 de abajo):

1. **Direcciones**: el objeto trae un campo extra **`alias`** (opcional en el `POST`, por defecto `"Casa"`). `phone` debe ser **10 dígitos sin espacios**. La primera dirección del usuario queda `isDefault: true` automáticamente; el listado ordena la predeterminada primero.
2. **Carrito**: `GET /api/cart` agrega **`shippingCost`** ($5.000 · $0 si `subtotal ≥ 150.000`). Variante inexistente = `404`; cantidad > stock = `400`.
3. **Checkout**: la respuesta incluye `subtotal`, `shippingCost` y `total` además de lo documentado. Si envías `"CARD"` lo normalizo a **`CREDIT_CARD`** en `payment.method` (usa el literal canónico). Errores: `400` carrito vacío · `404` dirección inexistente · `409` stock · **`502`** si la pasarela no respondió (el pedido se elimina y el stock se repone).
4. **Webhook**: firma `HMAC-SHA256` del body crudo en el header **`x-event-signature`** (o `x-signature`; acepta el prefijo `sha256=`). **El stock NO se descuenta aquí**: ya quedó RESERVADO al crear el pedido; el webhook solo lo repone si el pago termina `DECLINED` o `VOIDED`. Respuesta `200`: `{ "received": true, "processed": ... }`.
5. **Pedidos (propiedad estricta)**: `404` si el pedido no existe · **`403` si no es tuyo** (aplica a detalle, pagar y cancelar).
6. **Reintento de pago**: la respuesta trae `redirectUrl` **tanto en la raíz como dentro de `payment`** (superconjunto de tu nota 11).
7. **Estados**: `payment.method` siempre vuelve canónico; `Payment.status` = `PENDING | APPROVED | DECLINED | VOIDED | REFUNDED` (**no existe `ERROR`**); pedidos incluyen `REFUNDED` → agrega su badge.
8. **`?sort=`**: `newest` (por defecto) · `price-asc` · `price-desc` · `rating` (mejor valoración, desempate: más reseñas) · `featured` (mejor valoración, desempate: más recientes). `featured`/`rating` se calculan en memoria sobre el catálogo completo (tope 500 productos).
9. **Listados admin de pedidos y preguntas NO están paginados**: devuelven un arreglo plano (el resto de listados sí son `{ items, page, totalPages, total }`).

**(c) ⚠️ Lo que NECESITO del FRONTEND ahora**:

1. **Formulario "Nueva dirección"** en el paso Envío del checkout que llame `POST /api/addresses`: hoy ningún flujo del frontend lo invoca y un usuario sin direcciones queda bloqueado (el `GET` devuelve `[]`). La semilla incluye una dirección de prueba para `cliente@tienda.com`.
2. Tras el retorno de Wompi en `/pedidos`, el pedido puede seguir `PENDING` unos segundos (el webhook llega después): consulta `GET /api/orders/:id` en bucle corto (~15 s) o muestra "Confirmando tu pago…" antes de darlo por pagado.
3. Cambia el literal `CARD` por **`CREDIT_CARD`** en el paso "Pago" (ya confirmaste los 6 literales en la nota 17.3) y agrega el badge **`REFUNDED`** a pedidos y pagos.
4. **Migración**: antes de arrancar, ejecuta `npm run db:migrate` en `backend/` con Postgres y `.env` listos (crea las tablas y agrega `PROCESSING` al enum). Variables del backend: `CORS_ORIGIN=http://localhost:5173`, `WOMPI_*`, `DATABASE_URL`. El frontend en dev no necesita variables propias (`/api` se proxea); en producción define `VITE_API_URL` y usa `credentials: 'include'` en cada llamada.
5. **Credenciales demo** (semilla): `admin@tienda.com / Admin1234!` · `cliente@tienda.com / Cliente1234!`.

> Esta sección se actualizará cada vez que el BACKEND cambie la API. Revisa antes de consumir.

---

## 1. Salud del servidor
### `GET /health`
Respuesta `200`:
```json
{ "status": "ok", "timestamp": "2026-10-26T12:00:00Z" }
```

---

## 2. Autenticación

### `POST /api/auth/register`
Body:
```json
{
  "email": "cliente@ejemplo.com",
  "password": "Secreta123!",
  "firstName": "Ana",
  "lastName": "Gómez",
  "phone": "3001234567"
}
```
Respuesta `201`:
```json
{ "id": "cuid", "email": "cliente@ejemplo.com", "firstName": "Ana", "role": "CUSTOMER" }
```
Errores: `409` email ya existe · `400` datos inválidos.

### `POST /api/auth/login`
Body: `{ "email": "...", "password": "..." }`
Respuesta `200`: `{ "id", "firstName", "role" }` + cookie `token`.
Errores: `401` credenciales inválidas.

### `POST /api/auth/logout`
Borra la cookie. Respuesta `204`.

### `GET /api/auth/me`
Requiere sesión. Respuesta `200`:
```json
{ "id": "cuid", "email": "cliente@ejemplo.com", "firstName": "Ana",
  "lastName": "Gómez", "phone": "3001234567", "role": "CUSTOMER" }
```
`phone` puede ser `null` si el usuario no registró teléfono.

---

## 3. Catálogo (público)

### `GET /api/categories`
Respuesta `200`:
```json
[{ "id": "cuid", "name": "Sujetadores", "slug": "sujetadores", "imageUrl": "https://..." }]
```

### `GET /api/products`
Query (todas opcionales): `?category=slug&q=texto&sort=newest&page=1&limit=12`

- `sort=newest` (por defecto) · `price-asc` · `price-desc` · `rating` (mejor valoración; desempate: más reseñas) · `featured` (mejor valoración; desempate: más recientes).
- `featured` y `rating` se calculan en memoria sobre el catálogo completo (tope 500 productos).

Respuesta `200`:
```json
{
  "items": [{
    "id": "cuid",
    "name": "Sujetador Encaje Aurora",
    "slug": "sujetador-encaje-aurora",
    "price": 180000,
    "compareAtPrice": 220000,
    "category": { "id": "cuid", "name": "Sujetadores", "slug": "sujetadores" },
    "images": [{ "url": "https://...", "alt": "Sujetador Encaje Aurora" }],
    "rating": 4.8,
    "reviewCount": 23
  }],
  "page": 1,
  "totalPages": 5,
  "total": 48
}
```

### `GET /api/products/:slug`
Detalle completo:
```json
{
  "id": "cuid", "name": "Sujetador Encaje Aurora", "slug": "sujetador-encaje-aurora",
  "description": "Encaje francés con aro…",
  "price": 180000, "compareAtPrice": 220000,
  "category": { "id": "cuid", "name": "Sujetadores", "slug": "sujetadores" },
  "images": [{ "url": "https://...", "alt": "Sujetador Encaje Aurora" }],
  "rating": 4.8, "reviewCount": 23,
  "variants": [{ "id": "cuid", "sku": "SAU-AUR-M", "name": "Talla M", "price": 180000, "stock": 5 }]
}
```
El `price` de cada variante es su precio efectivo (propio, o el base del producto si no tiene sobrecosto). Errores: `404` producto no encontrado.

---

## 4. Carrito (requiere sesión)

### `GET /api/cart`
```json
{
  "items": [{
    "id": "cuid",
    "variant": { "id": "cuid", "name": "Talla M", "price": 180000, "stock": 5 },
    "product": { "name": "Sujetador Encaje Aurora", "slug": "sujetador-encaje-aurora", "imageUrl": "https://..." },
    "quantity": 1
  }],
  "subtotal": 180000,
  "shippingCost": 5000
}
```
- `product.imageUrl` **siempre está presente** (`null` si el producto no tiene imagen).
- `shippingCost` = **$5.000**; **GRATIS (`0`)** si `subtotal ≥ 150.000`.

### `POST /api/cart` — agregar (upsert)
Body: `{ "variantId": "cuid", "quantity": 1 }`
Si la variante ya está en el carrito **suma la cantidad** (nunca `409`).
Respuesta `200`: el carrito completo. Errores: `400` cantidad inválida o sin stock suficiente · `404` variante inexistente.

### `PATCH /api/cart/:itemId` — cambiar cantidad
Body: `{ "quantity": 2 }`. Respuesta `200`: el carrito completo.
Errores: `400` sin stock suficiente · `404` artículo no encontrado o no tuyo.

### `DELETE /api/cart/:itemId`
Respuesta `204`. Errores: `404` artículo no encontrado o no tuyo.

---

## 5. Checkout y pagos

### `POST /api/orders/checkout`
Crea el pedido desde el carrito, **reserva el stock** y lo envía a Wompi. Body:
```json
{ "addressId": "cuid", "paymentMethod": "NEQUI" }
```
`paymentMethod`: `NEQUI | DAVIPLATA | PSE | CREDIT_CARD | DEBIT_CARD | BANCOLOMBIA` (alias `CARD` → `CREDIT_CARD`, deprecado).

Respuesta `201`:
```json
{
  "orderId": "cuid",
  "orderNumber": "NA-2026-000123",
  "subtotal": 180000,
  "shippingCost": 5000,
  "total": 185000,
  "payment": {
    "id": "cuid",
    "method": "NEQUI",
    "status": "PENDING",
    "redirectUrl": "https://checkout.wompi.co/..."
  }
}
```
El navegador del usuario debe ir a `payment.redirectUrl` (Wompi regresará a `{CORS_ORIGIN}/pedidos`).
Errores: `400` carrito vacío · `404` dirección inexistente o no tuya · `409` stock insuficiente (el pedido se elimina) · `502` la pasarela no respondió.

### `POST /api/orders/:id/pay` — reintentar pago
Solo el dueño y solo si el pedido está `PENDING`. Respuesta `200`:
```json
{ "redirectUrl": "https://checkout.wompi.co/...",
  "payment": { "id": "cuid", "method": "NEQUI", "status": "PENDING", "redirectUrl": "https://checkout.wompi.co/..." } }
```
(`redirectUrl` en la raíz Y dentro de `payment`.) Errores: `400` "El pedido ya no está pendiente de pago" / "El pago de este pedido ya fue procesado" · `403` no es tuyo · `404` inexistente · `502` pasarela.

### `POST /api/orders/:id/cancel` — cancelar (solo `PENDING`)
Repone el stock reservado. Respuesta `200`: el pedido completo con `status: "CANCELLED"`.
Errores: `400` "Solo se pueden cancelar pedidos pendientes" · `403` no es tuyo · `404` inexistente.

### `POST /api/payments/webhook/wompi`
Webhook de Wompi — **el frontend NO lo llama**. Verifica la firma `HMAC-SHA256` del body crudo (header `x-event-signature` o `x-signature`, acepta prefijo `sha256=`) y es idempotente.

**Modelo de stock**: ya está RESERVADO desde el checkout; aquí se repone **solo** si el pago termina `DECLINED` o `VOIDED`. Si aprueba, el pedido pasa a `PAID`. `REFUNDED` lo marca el admin (sección 6).

Respuesta `200`: `{ "received": true, "processed": true }` (`processed: false` si el evento ya estaba aplicado).
Errores: `400` cuerpo vacío, notificación incompleta o monto distinto · `401` firma ausente o inválida · `404` transacción desconocida.

### `GET /api/orders`
Historial del usuario (más recientes primero), arreglo plano:
```json
[{ "id": "cuid", "orderNumber": "NA-2026-000123", "status": "PAID", "total": 185000, "createdAt": "2026-10-26T12:00:00Z" }]
```
Estados: `PENDING | PAID | PROCESSING | SHIPPED | DELIVERED | CANCELLED | REFUNDED`.

### `GET /api/orders/:id`
Detalle completo (solo del dueño). Respuesta `200`:
```json
{
  "id": "cuid", "orderNumber": "NA-2026-000123", "status": "PAID",
  "subtotal": 180000, "shippingCost": 5000, "discount": 0, "total": 185000,
  "createdAt": "2026-10-26T12:00:00Z",
  "address": { "id": "cuid", "alias": "Casa", "receiverName": "Ana Gómez", "phone": "3001234567",
    "line1": "Cra 7 # 32-16", "line2": "Apto 302", "city": "Bogotá",
    "department": "Cundinamarca", "postalCode": "110111", "isDefault": true },
  "items": [{ "id": "cuid", "name": "Sujetador Encaje Aurora", "sku": "SAU-AUR-M",
    "unitPrice": 180000, "quantity": 1 }],
  "payment": { "id": "cuid", "method": "NEQUI", "status": "PENDING" }
}
```
Errores: `403` "Este pedido no te pertenece" · `404` inexistente.

---

## 6. Admin (requiere rol ADMIN — sin sesión `401`, rol CUSTOMER `403`)

### `GET /api/admin/orders`
Todos los pedidos, **arreglo plano** (sin paginar), más recientes primero:
```json
[{
  "id": "cuid", "orderNumber": "NA-2026-000123", "status": "PAID",
  "subtotal": 180000, "shippingCost": 5000, "total": 185000, "createdAt": "2026-10-26T12:00:00Z",
  "user": { "id": "cuid", "email": "cliente@ejemplo.com", "firstName": "Ana", "lastName": "Gómez" },
  "items": [{ "id": "cuid", "name": "Sujetador Encaje Aurora", "quantity": 1, "unitPrice": 180000 }]
}]
```

### `PATCH /api/admin/orders/:id/status`
Body: `{ "status": "SHIPPED" }` (cualquiera de los 7 estados, incl. `REFUNDED`). Respuesta `200`: el pedido (misma forma de `GET /api/admin/orders`).
- Al pasar a `CANCELLED` se repone el stock; al reactivar un `CANCELLED` se vuelve a reservar (`409` "No hay stock suficiente para reactivar este pedido").
Errores: `404` inexistente.

### `GET /api/admin/products`
Misma forma paginada que `GET /api/products` (`{ items, page, totalPages, total }`), mismos filtros (`?q`, `?category`, `?sort`, `?page`, `?limit`). Incluye también los inactivos.

### `POST /api/admin/products` · `PATCH /api/admin/products/:id`
Body (PATCH: los mismos campos, todos opcionales):
```json
{
  "name": "Sujetador Encaje Aurora", "slug": "sujetador-encaje-aurora",
  "description": "Encaje francés con aro…", "price": 180000, "compareAtPrice": 220000,
  "categoryId": "cuid",
  "images": [{ "url": "https://...", "alt": "Sujetador Encaje Aurora" }],
  "variants": [{ "sku": "SAU-AUR-M", "name": "Talla M", "price": 180000, "stock": 5 }]
}
```
Respuesta `201`/`200`: el producto con **la misma forma del detalle público** (sección 3). Imágenes por **URL directa** (sin upload, nota 17.4).
- En el PATCH, `images` se **reemplaza completo** (es la lista total).
- `variants` se **sincroniza por SKU**: los SKU que no envíes se borran; si la variante ya tiene pedidos se desactiva en vez de borrarse. Si el `price` de una variante es igual al precio base, se guarda como "sigue el precio base".
Errores: `400` datos inválidos o categoría inexistente · `404` producto inexistente (PATCH) · `409` slug o SKU duplicado.

### `DELETE /api/admin/products/:id`
`204` al borrar. `409` "No se puede eliminar: ya tiene pedidos asociados". `404` inexistente.

### `GET /api/admin/categories` · `POST /api/admin/categories`
`GET` → misma forma pública (`{ id, name, slug, imageUrl }`), **incluye inactivas**, sin paginar.
`POST` Body: `{ "name": "Sujetadores", "slug": "sujetadores", "imageUrl": "https://..." }` (`imageUrl` opcional) → `201` la categoría creada (misma forma). Errores: `400` · `409` "El slug ya está en uso".

### `DELETE /api/admin/categories/:id`
`204` al borrar. `409` "No se puede eliminar: tiene productos asociados". `404` inexistente.

### `GET /api/admin/questions`
Todas las preguntas (las nuevas llegan con `status: "PENDING"`), **arreglo plano** (sin paginar):
```json
[{
  "id": "cuid", "question": "¿De qué material es?", "answer": null, "status": "PENDING",
  "createdAt": "2026-10-26T12:00:00Z",
  "product": { "id": "cuid", "name": "Sujetador Encaje Aurora", "slug": "sujetador-encaje-aurora" },
  "user": { "firstName": "Ana" }
}]
```

### `PATCH /api/admin/questions/:id`
Body: `{ "answer": "Sí, tenemos de la S a la XL." }`. Respuesta `200`: la pregunta actualizada (`status: "ANSWERED"`). Errores: `400` respuesta vacía · `404` inexistente.

---

## 7. Direcciones (requiere sesión)

### `GET /api/addresses`
Arreglo (vacío `[]` si no tiene direcciones; la predeterminada primero):
```json
[{
  "id": "cuid", "alias": "Casa", "receiverName": "Ana Gómez", "phone": "3001234567",
  "line1": "Cra 7 # 32-16", "line2": "Apto 302", "city": "Bogotá",
  "department": "Cundinamarca", "postalCode": "110111", "isDefault": true
}]
```
(`line2` y `postalCode` pueden ser `null`.)

### `POST /api/addresses`
Body: `{ "receiverName", "phone", "line1", "line2?", "city", "department", "postalCode?", "alias?", "isDefault?" }`.
- `phone`: **exactamente 10 dígitos** sin espacios.
- `alias`: por defecto `"Casa"`.
- Si es la primera dirección del usuario queda `isDefault: true`.
Respuesta `201`: la dirección creada (misma forma). Errores: `400` datos inválidos.

---

## 8. Preguntas y respuestas (Q&A)

### `GET /api/products/:slug/questions` (público)
Solo preguntas `ANSWERED`, más recientes primero:
```json
[{ "id": "cuid", "question": "¿De qué material es?", "answer": "Encaje francés con microfibra.",
   "status": "ANSWERED", "createdAt": "2026-10-26T12:00:00Z", "answeredAt": "2026-10-26T12:00:00Z",
   "user": { "firstName": "Ana" } }]
```

### `POST /api/products/:slug/questions` (requiere sesión)
Body: `{ "question": "¿Llega a Medellín?" }`. Respuesta `201`: la pregunta creada (misma forma) con `status: "PENDING"`, `answer: null`, `answeredAt: null`.
Errores: `400` pregunta con menos de 3 caracteres · `404` producto.

El administrador las lista en `GET /api/admin/questions` y responde con `PATCH /api/admin/questions/:id` (sección 6).

---

## Códigos de error estándar
| Código | Significado |
|--------|-------------|
| `400` | Datos inválidos (validación Zod) |
| `401` | No autenticado |
| `403` | Sin permisos (rol ADMIN) o recurso de otro usuario |
| `404` | No encontrado |
| `409` | Conflicto (stock, email/slug/SKU duplicado, dependencias) |
| `429` | Demasiadas peticiones (rate limit) |
| `500` | Error del servidor (no exponer detalles) |
| `502` | La pasarela de pago no respondió (checkout/reintento) |

Formato de error:
```json
{ "statusCode": 409, "error": "Conflict", "message": "Stock insuficiente para la variante X" }
```
