# Cómo se comunican los dos agentes (BACKEND ↔ FRONTEND)

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

## Cómo abrir cada chat
- **Chat de BACKEND**: escribe "usa el agente backend" o ábrelo como agente primario.
- **Chat de FRONTEND**: escribe "usa el agente frontend".
- Cada agente también puede **lanzar al otro como subagente** para pedirle algo puntual.
