# Publicar Nocturna en internet (Vercel + Railway)

Guía para llevar la tienda de `localhost` a un dominio real. Son **dos despliegues**
y un truco de enrutamiento que hace que todo lo demás funcione sin cambiar el código.

```
Navegador
   │  https://nocturna.com          ← el usuario entra aquí
   ▼
Vercel (frontend estático)  ──────►  Railway (API Fastify + PostgreSQL)
   │  /api/*  se reescribe al backend         │
   └──────────────────────────────────────────┘
        la cookie httpOnly viaja como MISMO ORIGEN
```

**Por qué el proxy y no llamar a la API directamente:** la sesión vive en una
cookie httpOnly con `SameSite=Lax`. Si el navegador la ve venir de otro dominio
(vercel.app → railway.app) la descarta, y el login se rompe — sobre todo en
Safari/iOS, que bloquea cookies de terceros por defecto. Con la reescritura
`/api/*` el navegador cree que todo es el mismo sitio: la cookie funciona, no hay
CORS de por medio y no hace falta tocar el backend.

---

## 0. Antes de publicar (leer aunque tengas prisa)

| Tema | Estado actual | Qué hacer |
|---|---|---|
| **Fotos y catálogo** | Son de **demostración** (modelo y piezas de muestra). | Reemplazar por fotografía y producto reales antes de vender. Publicar fotos de demostración con precio y botón de compra es un riesgo legal y de marca. |
| **Pagos** | Wompi en `sandbox` (llaves `pub_test_…`). | Cambiar a llaves de producción y `WOMPI_ENV=production` (paso 4). |
| **Usuarios demo** | `cliente@tienda.com` / `admin@tienda.com` con contraseñas conocidas. | Cambiar la contraseña del admin y **no** correr el seed en producción si no quieres datos de prueba. |
| **Datos personales** | El checkout guarda nombre, teléfono y dirección. | Publicar la política de tratamiento de datos (Ley 1581 de Colombia) en `/politicas`. |
| **WhatsApp** | 311 391 9437 (`573113919437`). | Verifica que ese número reciba mensajes. |

---

## 1. Backend en Railway

### 1.1 Crear el servicio

1. Entra a [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo** → elige este repositorio.
2. En el servicio → **Settings**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm ci --include=dev && npm run build`
     (`--include=dev` evita que `NODE_ENV=production` omita `typescript`; `build`
     ejecuta `prisma generate && tsc` y deja el cliente en `node_modules`)
   - **Start Command**: `npm run start:prod`
     (`prisma db push --accept-data-loss && node dist/server.js`)
     > El repo **no tiene carpeta `prisma/migrations`** (la base se creó con `db push`).
     > Por eso el arranque usa `db push --accept-data-loss`: crea/actualiza el
     > esquema antes de levantar el servidor. La CLI `prisma` está en
     > `dependencies` para que exista en runtime (Railway puede omitir devDependencies).
     > Cuando el esquema se estabilice, conviene generar migraciones
     > (`npx prisma migrate dev`) y cambiar el comando a `prisma migrate deploy`.
   - **Healthcheck Path**: `/health` (ver 1.4).
3. **New → Database → PostgreSQL** en el mismo proyecto. Railway inyecta
   `DATABASE_URL` automáticamente; si no, cópiala de la pestaña *Connect*.

### 1.2 Variables de entorno del backend

Settings → **Variables**. Todas son secretas: nunca van al frontend ni a git.

| Variable | Valor en producción |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | Railway lo inyecta; el código escucha en `0.0.0.0`. |
| `DATABASE_URL` | La del plugin PostgreSQL (`${{Postgres.DATABASE_URL}}`). |
| `JWT_SECRET` | 32+ caracteres aleatorios (`openssl rand -base64 32`). **Nuevo**, no el de desarrollo. |
| `COOKIE_SECURE` | `true` (el sitio va por HTTPS). Solo acepta `"true"` o `"false"`: cualquier otro valor aborta el arranque. |
| `CORS_ORIGIN` | `https://nocturna.com` — el dominio final del frontend. También se usa como base del `redirect-url` de Wompi. |
| `WOMPI_PUBLIC_KEY` | `pub_prod_…` |
| `WOMPI_PRIVATE_KEY` | `priv_prod_…` |
| `WOMPI_WEBHOOK_SECRET` | `prod_events_…` |
| `WOMPI_INTEGRITY_KEY` | `prod_integrity_…` |
| `WOMPI_ENV` | `production` |

> ⚠️ `CORS_ORIGIN` **no puede contener `localhost`**: el WAF de Wompi devuelve 403
> en el redirect. Si aún no tienes dominio, usa la URL de Vercel
> (`https://nocturna.vercel.app`) y cámbiala al comprar el dominio.

### 1.3 Semilla (solo si quieres el catálogo de demostración)

Una vez, desde la consola del servicio en Railway:

```bash
npx prisma db seed
```

Sin esto la tienda arranca vacía (sin productos, sin categorías, sin admin).

### 1.4 Comprobar

- `https://TU-API.up.railway.app/health` → debe responder `200` con
  `{"status":"ok","timestamp":"…"}`.
- Healthcheck de Railway: configura **`/health`** como *Healthcheck Path*. Es un
  chequeo de vida (sin autenticación ni consultas): si responde, el proceso está
  escuchando. La base ya está preparada porque `db push` corre **antes** de
  `node dist/server.js`; si la BD no conecta, el contenedor no arranca.
- Revisa los logs: en producción salen en JSON (pino) con nivel `info`. El
  `trustProxy` está activo, así que `request.ip` es la IP real del cliente
  (`X-Forwarded-For`) y el rate-limit de 100/min no se vuelve global.
- Copia esa URL: la necesitas en el paso 2.

---

## 2. Frontend en Vercel

### 2.1 Antes de importar: apunta el proxy al backend

Edita **`frontend/vercel.json`** y reemplaza las **dos** apariciones de
`https://REEMPLAZA-CON-TU-API.up.railway.app` por tu URL de Railway (sin `/` final).

```json
{ "source": "/api/:path*", "destination": "https://TU-API.up.railway.app/api/:path*" },
{ "source": "/health",    "destination": "https://TU-API.up.railway.app/health" }
```

Ese archivo hace dos cosas:

- **`/api/*` → Railway**: el proxy que mantiene la cookie como mismo origen.
- **`/((?!api/).*)` → `/index.html`**: sin esto, refrescar en `/producto/body-encaje-ebano` da 404 (React Router maneja las rutas en el navegador). Los archivos reales se sirven primero, así que `/assets/*` e `/images/*` no se ven afectados.

### 2.2 Importar el proyecto

1. [vercel.com](https://vercel.com) → **Add New → Project** → importa el repositorio.
2. **Root Directory**: `frontend`. Framework: *Vite* (lo detecta).
   Build: `npm run build` · Output: `dist` (ya están en `vercel.json`).
3. **Environment Variables**: ninguna obligatoria.
   - `VITE_API_URL` → **déjala vacía**. Si la llenas con la URL de Railway, el
     navegador pasaría a ver la API como otro dominio y el login se rompería.
   - Opcional: `VITE_WHATSAPP_NUMERO=573113919437` para cambiarlo sin tocar código.
4. **Deploy**.

### 2.3 Comprobar

| Prueba | Esperado |
|---|---|
| Abrir `/` | Home oscuro con hero y "La selección". |
| Refrescar en `/catalogo` y `/producto/body-encaje-ebano` | Carga la página, no 404. |
| DevTools → Network → `/api/products` | `200`, mismo dominio del sitio. |
| Iniciar sesión (`cliente@tienda.com`) | La cookie `token` aparece en Application → Cookies, y al refrescar sigues dentro. |
| Agregar al carrito → `/carrito` | El carrito persiste al recargar. |

---

## 3. Dominio propio

1. Vercel → proyecto → **Settings → Domains → Add** → escribe `nocturna.com`.
2. En tu proveedor de DNS, crea los registros que Vercel indique
   (`A 76.76.21.21` para el ápice y `CNAME cname.vercel-dns.com` para `www`).
3. Cuando el certificado esté emitido, **actualiza `CORS_ORIGIN` en Railway** al
   dominio final y redespliega. Es lo que usa Wompi para devolver al cliente a
   `/pedidos` después de pagar.

---

## 4. Wompi en producción

1. En el panel de Wompi, pasa la cuenta a producción y copia las cuatro llaves
   (`pub_prod_`, `priv_prod_`, `prod_events_`, `prod_integrity_`).
2. Actualízalas en Railway y pon `WOMPI_ENV=production`.
3. Registra la URL de eventos (webhook) en el panel de Wompi:

   ```
   https://nocturna.com/api/payments/webhook/wompi
   ```

   (o `https://TU-API.up.railway.app/api/payments/webhook/wompi`). Es el único
   endpoint público sin sesión y valida la firma con `WOMPI_WEBHOOK_SECRET`.
4. Haz una compra real de bajo valor y confírmala; luego anúlala desde el panel.

---

## 5. Checklist de aceptación (antes de compartir el link)

- [ ] Home, catálogo y ficha cargan con fotos reales.
- [ ] Buscador y filtros del catálogo funcionan.
- [ ] Registro y login; la sesión sobrevive a un refresh.
- [ ] Agregar al carrito, cambiar cantidades, quitar artículos.
- [ ] Checkout: dirección + envío + pago; el pedido aparece en `/pedidos`.
- [ ] El pago vuelve a `/pedidos` con el estado correcto.
- [ ] Panel `/admin`: productos, pedidos, preguntas.
- [ ] Botón de WhatsApp abre el chat con el 311 391 9437.
- [ ] Páginas `/envios`, `/garantia`, `/pagos`, `/politicas` con datos reales.
- [ ] Probado en un teléfono real (Safari iOS y Chrome Android).

---

## 6. Problemas típicos

| Síntoma | Causa | Solución |
|---|---|---|
| 404 al refrescar una ruta | Falta el fallback SPA | Revisa el último `rewrite` de `vercel.json`. |
| `/api/...` devuelve 404 | URL de Railway mal escrita | Corrige el `destination` y redespliega. |
| Login "funciona" pero al refrescar sales | Cookie de terceros | Comprueba que `VITE_API_URL` esté **vacía** y que el proxy `/api` exista. |
| Error de CORS en consola | Llamadas directas al backend | Mismo punto: todo debe pasar por `/api` del dominio del sitio. |
| Las fotos salen rotas | `imageUrl` relativa (`/images/…`) | Las fotos viven en `frontend/public/images`; deben subir con el build. |
| Wompi devuelve 403 al pagar | `CORS_ORIGIN` con `localhost` | Pon el dominio público en Railway. |
| El backend no arranca | Falta una variable | Zod falla al inicio y muestra el nombre exacto en los logs. |

---

## 7. Reglas que no se rompen

- **Ningún secreto en el frontend**: todo lo que empieza con `VITE_` queda escrito
  en el JavaScript público. Llaves privadas de Wompi, `JWT_SECRET` y
  `DATABASE_URL` viven **solo** en Railway.
- **No subir `.env`** al repositorio (ya está en `.gitignore`).
- **No correr el seed** en producción después del lanzamiento: sobrescribe datos.
- **Un solo cambio de URLs por despliegue**: si algo falla, sabes qué fue.
