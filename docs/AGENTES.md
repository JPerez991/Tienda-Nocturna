# Cómo se comunican los dos agentes (BACKEND ↔ FRONTEND)

> **¿Retomas el proyecto?** Lee antes `docs/ESTADO.md`: dice en qué fase vamos,
> qué quedó a medias y cuál es la siguiente acción concreta.

Este proyecto tiene **dos "chats" (agentes)** que trabajan en equipo:

```
┌─────────────────────┐                      ┌──────────────────────┐
│  Agente BACKEND      │                      │  Agente FRONTEND      │
│  (Node + Fastify +   │                      │  (React + Vite +      │
│   PostgreSQL/Prisma) │                      │   Tailwind)           │
└──────────┬──────────┘                      └──────────┬───────────┘
           │            productor / consumidor           │
           └───────────────►  docs/api-contract.md ◄─────┘
                             (fuente de verdad)
```

## Flujo de comunicación
1. El **BACKEND** es el *productor* de la API. Cuando crea o cambia un endpoint,
   lo documenta en `docs/api-contract.md` (ruta, método, payload, respuestas, errores).
2. El **FRONTEND** es el *consumidor*. Lee el contrato y construye la UI contra esa
   forma exacta. **Nunca inventa endpoints.**
3. Si el FRONTEND necesita un dato nuevo, lo escribe en `docs/api-contract.md`
   dentro de la sección **"Notas para BACKEND"**. El BACKEND lo implementa y lo
   mueve al contrato.
4. Si el BACKEND necesita un cambio de UI, lo escribe en **"Notas para FRONTEND"**.

## Regla de oro
`docs/api-contract.md` es la **única fuente de verdad**. Si el código y el contrato
discrepan, se corrige el código para que cumpla el contrato (o se actualiza el
contrato explícitamente).

## Los tres repositorios
| Repo | Contenido | Quién lo edita |
| --- | --- | --- |
| `Tienda-Nocturna` | `backend/`, `frontend/` y este `docs/` | BACKEND (API) y FRONTEND (tienda) |
| `tiendaNocturna-admin` | Panel de administración (subdominio `admin.…`) | FRONTEND (también diseña el panel) |

El panel consume **la misma API** y respeta el mismo contrato: este archivo
(`docs/api-contract.md`) sigue siendo la única fuente de verdad, y el repo del
admin solo guarda un puntero a él en su `docs/API.md`. Las peticiones de datos
nuevos para el panel se escriben en **"Notas para BACKEND"** de este contrato;
no se inventan endpoints ni se duplica el contrato en el otro repo.

## Cómo abrir cada chat
- **Chat de BACKEND**: escribe "usa el agente backend" o ábrelo como agente primario.
- **Chat de FRONTEND**: escribe "usa el agente frontend".
- Cada agente también puede **lanzar al otro como subagente** para pedirle algo puntual.
