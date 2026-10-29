# 🖤 Nocturna — E-commerce de lencería (Colombia)

Tienda online de **lencería premium** (marca **Nocturna**) con pagos en Colombia (Wompi).
Proyecto organizado en **dos agentes (chats)** que se comunican por un contrato de API.

## Estructura
```
.opencode/agents/    → backend.md y frontend.md (los 2 chats)
.opencode/skills/    → ui-design, paleta-negros, tienda-profesional
docs/                → AGENTES, api-contract, base-de-datos, arquitectura
backend/             → API Node + Fastify + Prisma (PostgreSQL)
frontend/            → UI React + Vite + Tailwind (identidad Nocturna)
```

## Cómo usar los dos chats
- **Backend**: escribe "usa el agente backend".
- **Frontend**: escribe "usa el agente frontend".
- Se comunican por `docs/api-contract.md` (fuente de verdad). Ver `docs/AGENTES.md`.

## Stack
- **Backend**: Node.js + TypeScript + Fastify + Prisma + PostgreSQL
- **Pagos**: Wompi vía patrón **Adapter** (intercambiable)
- **Frontend**: React + Vite + Tailwind (paleta Nocturna: tinta / nude / rosa polvo)

## Arrancar (fase básica)
1. `cd backend && npm install`
2. Copia `.env.example` a `.env` y pon tu `DATABASE_URL` (Supabase/PostgreSQL) + `JWT_SECRET`.
3. `npx prisma db push` (crea las tablas) y `npm run db:seed` (datos de lencería de ejemplo).
   > ⚠️ Usa `db push`, **no** `db:migrate`: el modo migrate se cuelga contra Supabase
   > (necesita una shadow DB que no está configurada).
4. `npm run dev` (API en `:8080`) y `npm run db:studio` (ver/editar datos en el navegador).
5. En otra terminal: `cd frontend && npm install && npm run dev` (UI en `:5173`).

## Acceso (usuarios de prueba)
| Rol | Email | Contraseña |
|---|---|---|
| Admin | `admin@tienda.com` | `Admin1234!` |
| Cliente | `cliente@tienda.com` | `Cliente1234!` |

## Entorno
El `.env` del backend **no se sube** a git (está en `.gitignore`). Copia `backend/.env.example`
y rellena `DATABASE_URL`, `JWT_SECRET` y las claves de Wompi.
