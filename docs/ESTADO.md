# Estado del proyecto — bitácora de trabajo

> **Léeme primero si retomas el proyecto en otro chat.**
> Última actualización: 23 de noviembre de 2026.
> Este archivo dice **dónde vamos, qué está a medias y qué hacer después**.
> El contrato de la API (única fuente de verdad) sigue en `docs/api-contract.md`.

---

## 1. Qué se está construyendo ahora

**Fase 1 del plan multi-tienda: separar el panel de administración en una app
propia.** El objetivo final del usuario es una plataforma donde él crea varias
tiendas públicas independientes (datos aislados) y las administra todas desde
un solo panel en un subdominio `admin.…`.

El plan tiene 4 fases y **solo se está ejecutando la 1**:

| Fase | Qué es | Estado |
| --- | --- | --- |
| 1 | Panel aparte (`admin/`), con su login y su diseño | **en curso (casi lista)** |
| 2 | Multi-tienda en backend (`Store`, `storeId`, `SUPERADMIN`, tienda por `Host`) | no empezada |
| 3 | Selector/CRUD de tiendas en el panel | no empezada |
| 4 | Publicación por tienda | aplazada por el usuario |

> Publicar en Hostinger quedó **aplazado** por decisión del usuario
> ("dejemos lo de publicarlo en hostinger para luego"). No insistir.

---

## 2. Hecho (verificado)

- La app `admin/` existe y es independiente: Vite propio (puerto **5174**),
  `index.html` con `noindex`, `index.css` con los tokens de marca, `main.tsx`,
  `App.tsx`, `lib/{api,types,format,config}.ts`, `components/ui/*`,
  `context/AuthContext`, `pages/{LoginPage,admin/*}`,
  `components/admin/AdminShell.tsx`, `.env.example`, `vercel.json`.
- `AdminShell`: sidebar tinta en escritorio, cabecera + nav en móvil, guardia de
  rol `ADMIN` ("Acceso restringido" + cambiar de cuenta), enlaces "Ver la
  tienda" y "Cerrar sesión". Sin header, footer ni WhatsApp de la tienda.
- `LoginPage` propia: no hay registro, verifica el rol y cierra la sesión si la
  cuenta no es ADMIN.
- En la tienda (`frontend/`): se **borró** `/admin` (`src/pages/admin`,
  `src/components/admin`, rutas en `App.tsx`). El menú muestra "Panel" solo con
  sesión ADMIN, como enlace externo a `ADMIN_URL` (`VITE_ADMIN_URL`, por
  defecto `http://localhost:5174`).
- `docs/DEPLOY.md`: nueva sección **3. Panel de administración** (segundo
  proyecto en Vercel con *Root Directory* `admin`) y checklist actualizado.
- Verdes antes de los últimos retoques: `admin` build OK / lint 0 errores,
  `frontend` build OK / lint 0 errores / **44 tests OK**.

## 3. Retoques visuales del panel (ya verificados)

Salieron de revisar capturas y **están aplicados y comprobados**: `admin`
compila (`npm run build`) y pasa lint con **0 errores** (6 advertencias
conocidas de `setState` dentro de `useEffect`). Capturas revisadas: pedidos,
productos, categorías, preguntas, y pedidos/productos en móvil (390 px).

Cambios aplicados en `admin/src`:

1. **Nuevo** `components/admin/PageHeader.tsx`: cada pantalla tiene su `h1`
   (antes ninguna lo tenía) + conteo (`role="status"`) + acción principal.
2. **Nuevo** `components/ui/Icons.tsx` con `PlusIcon` (SVG trazo 1.5), para no
   usar el glifo "+" en los botones.
3. Los cuatro `pages/admin/*` usan `PageHeader` y patrón uniforme:
   error → `ErrorState` con cabecera; carga → `Spinner` con cabecera.
4. Estados vacíos **sin marco** (se quitó `border-dashed`), como en la tienda.
5. Mensajes de éxito/error pasaron de `string` con prefijo `"✓"` a
   `{ texto, ok }`; ya no hay glifos.
6. Fila de producto y tarjeta de pedido **reordenadas para móvil**: identidad
   arriba y precio/acción en una fila propia (antes el nombre se cortaba y el
   slug se partía letra por letra).
7. Se quitó la clase muerta `font-display` (no existe en el tema del panel; los
   títulos del back-office son sans a propósito).
8. `Badge` tonos cálidos: `neutral`/`success` en `bg-nude`, `info` en
   `bg-acento-fondo` (antes grises); el vino queda solo para pendiente/cancelado.
9. Acciones secundarias ("Editar", "Responder") con subrayado: sin él parecían
   texto suelto, porque sobre tarjeta blanca el botón ghost no tiene superficie.

**Estado:** listo para commitear. Lo único pendiente es probarlo contra la BD
real (§4).

## 4. Bloqueado por el entorno (no por el código)

**La base de datos Supabase no responde.** Todo endpoint que toca BD devuelve
500 (`Can't reach database server at aws-0-us-east-1.pooler.supabase.com:5432`);
`/health` sí responde 200 porque no consulta la BD.

- Causa probable: proyecto de Supabase pausado o sin red.
- **Requiere acción del usuario**: reactivar el proyecto en el panel de
  Supabase y confirmar la contraseña de `DATABASE_URL` en `backend/.env`.
- Sin eso no se puede probar login real, pedidos, productos ni checkout.

## 5. Cómo revisar el panel mientras la BD esté caída

Hay una **API falsa** para mirar la interfaz (no forma parte del proyecto):

```
C:\Users\DP\AppData\Local\Temp\opencode\mock-admin-api.mjs
```

Sirve `/api/auth/me` (ADMIN Ana Restrepo), login/logout, pedidos, productos,
categorías, preguntas, detalle de producto y las fotos reales de
`frontend/public/images` (para que las miniaturas no salgan rotas). Arranque:

```powershell
# 1) mock en 8081
node "C:\Users\DP\AppData\Local\Temp\opencode\mock-admin-api.mjs"

# 2) panel apuntando al mock
cd admin
$env:VITE_API_PROXY="http://localhost:8081"; npm run dev -- --port 5175
```

Capturas con `puppeteer-core` + Edge (ya instalado):

```
C:\Users\DP\AppData\Local\Temp\opencode\shotter\shot-admin-mock.js
# salida: C:\Users\DP\AppData\Local\Temp\opencode\shots\admin\*.png
```

Revisar: `10-pedidos`, `11-productos`, `12-categorias`, `13-preguntas`,
`14-pedidos-movil`, `15-productos-movil`.

> Si el mock se perdió (es temporal), basta con recrear esos endpoints con los
> tipos de `frontend/src/lib/types.ts`: `AdminOrder`, `Product`, `Category`,
> `AdminQuestion`, `User`.

## 6. Cómo correr todo en local

| App | Puerto | Comando |
| --- | --- | --- |
| Backend (Fastify) | 8080 | `cd backend && npm run dev` |
| Tienda | 5173 | `cd frontend && npm run dev` |
| Panel | 5174 | `cd admin && npm run dev` |

- Los dos frontends proxyean `/api` y `/health` al backend para que la cookie
  httpOnly de sesión sea **mismo origen** (no cambiar a llamadas con URL
  absoluta: rompería el login).
- Cuentas demo: `cliente@tienda.com / Cliente1234!` · `admin@tienda.com / Admin1234!`.
- En producción cada app se publica aparte y también proxya `/api`
  (`vercel.json` de cada una).

## 7. Qué hacer después (en orden)

1. `npm run build` + `npm run lint` en `admin/` y revisar capturas (§3).
2. **Commit de la fase 1**: `admin/` nuevo, borrado de `frontend/src/**/admin`,
   `ADMIN_URL` en la tienda, `docs/DEPLOY.md`. Mensaje sugerido:
   `feat(admin): panel de administración como app independiente`.
3. Cuando el usuario reactive Supabase: repetir login del panel y probar las
   cuatro secciones contra datos reales.
4. **Pedir confirmación al usuario** antes de empezar la fase 2 (modelo
   multi-tienda en backend: toca todas las consultas y la BD; riesgo alto).
   La fase 2 la ejecuta el agente **backend**; el frontend solo consume.

## 8. Reglas que no se rompen

- La API se consume **solo** según `docs/api-contract.md`. ¿Falta un dato? Se
  pide en "Notas para BACKEND" de ese archivo; no se inventan endpoints.
- Esquinas rectas, sin emojis (iconos SVG trazo 1.5), contraste AA, targets
  ≥ 44 px, móvil primero.
- Marcos solo en campos de formulario y paneles; los estados vacíos no llevan
  caja.
- Nunca secretos en el frontend: solo IDs públicos.
- Solo se vende lencería de mujer; catálogo y fotos son de demostración.
- No reintroducir sin que el usuario lo pida: carrusel, foto de campaña con
  titular encima, CTAs múltiples en el hero, selector de orden del catálogo.
- WhatsApp de la tienda: **311 391 9437** (`573113919437`).

## 9. Trampas conocidas

- **Encoding**: PowerShell muestra `�` que no son mojibake real. Verificar con
  `node -e "..."` leyendo el archivo en utf8 antes de "arreglar" nada.
- `admin` y `frontend` tienen `vite-env.d.ts` **separados**; una variable nueva
  se declara en los dos que la usen.
- La sesión es una cookie `token` httpOnly atada al dominio: en multi-tienda
  (fase 2+) cada tienda debe servir `/api` bajo su propio dominio.
- `puppeteer-core` vive en `C:\Users\DP\AppData\Local\Temp\opencode\shotter`;
  si el `npm install` se corta, basta con `Test-Path node_modules\puppeteer-core`.
