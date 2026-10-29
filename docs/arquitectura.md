# 🏗️ Arquitectura — Patrones de diseño y seguridad

## Estructura del proyecto (monorepo)

```
Proyecto/
├── .opencode/
│   ├── agents/           ← Los 2 chats (backend.md, frontend.md)
│   └── skills/ui-design/ ← Skill de diseño
├── docs/
│   ├── AGENTES.md        ← Cómo se comunican los 2 agentes
│   ├── api-contract.md   ← Fuente de verdad API (backend ↔ frontend)
│   ├── base-de-datos.md  ← Diseño de BD
│   └── arquitectura.md   ← Este archivo
├── backend/              ← API (este chat)
│   ├── prisma/schema.prisma
│   └── src/
└── frontend/             ← UI (el otro chat)
```

## Estructura interna del backend (arquitectura en capas)

```
backend/src/
├── config/        # Carga y valida variables de entorno (Zod)
├── modules/       # Dominio agrupado por módulo
│   └── products/
│       ├── product.routes.ts     # Capa HTTP (expone endpoints)
│       ├── product.controller.ts # Recibe req, llama al service, devuelve res
│       ├── product.service.ts    # Lógica de negocio (patrón Service)
│       ├── product.repository.ts # Acceso a BD (patrón Repository)
│       └── product.schemas.ts    # DTOs de validación con Zod
├── shared/
│   ├── errors/    # Errores tipados y manejo global
│   ├── plugins/   # Seguridad, rate limit, cookies
│   └── payments/  # Patrón Adapter de pagos (Wompi)
└── app.ts         # Construye la instancia Fastify
└── server.ts      # Arranca el servidor
```

### Capas y su responsabilidad (una sola responsabilidad)
| Capa | Qué hace | NO hace |
|------|----------|---------|
| **Routes** | Mapea URL+método a controller, aplica schemas | No tiene lógica |
| **Controller** | Valida req, llama al service, formatea res | No toca la BD |
| **Service** | Reglas de negocio, transacciones | No conoce HTTP ni SQL directo |
| **Repository** | Consultas Prisma a la BD | No tiene reglas de negocio |

## Patrones de diseño aplicados

1. **Repository** — aísla el acceso a datos. Si cambias Prisma por otro ORM, solo
   tocas los repositorios.
2. **Service** — concentra la lógica de negocio (ej: "al pagar, descontar stock y
   crear Order"). Fácil de testear sin HTTP.
3. **Adapter (pagos)** — define una interfaz `PaymentGateway`. Wompi es una
   implementación. Para cambiar a MercadoPago o PayU, agregas otro adaptador **sin
   tocar el resto del código** (OCP).
4. **DTO / Schema validation (Zod)** — toda entrada se valida antes de tocar el
   negocio. Nada entra "crudo".
5. **Strategy** — distintas estrategias de cálculo de envío por transportadora.
6. **Factory** — crea la instancia del gateway correcto según configuración.

## Seguridad (capa por capa)

### Autenticación y autorización
- Contraseñas con **Argon2** (o bcrypt) — jamás texto plano.
- **JWT en cookie httpOnly + SameSite**, no en localStorage (evita XSS).
- **RBAC**: roles `ADMIN` y `CUSTOMER` verificados por middleware `requireRole`.

### Validación y saneamiento
- **Zod** en todos los endpoints (body, params, query).
- Rate limiting por IP (especialmente en login y checkout).
- Límite de tamaño de payload.

### Cabeceras y transporte
- **Helmet** (cabeceras seguras).
- **CORS** con whitelist explícita (solo tu dominio frontend).
- HTTPS obligatorio en producción.

### Pagos (lo más delicado)
- El frontend **nunca** ve claves secretas de Wompi, solo la llave pública.
- El backend verifica la **firma del webhook** de Wompi antes de marcar un pago.
- **Idempotency key** para que un reintento no cobre dos veces.
- Los datos de tarjeta **no tocan tu servidor** (Wompi tokeniza; PCI-DSS).

### Datos
- `.env` fuera de git (`.gitignore`), y solo se leen vía `config/` validado.
- Nada de datos sensibles en logs.

## checklist de errores comunes que evitamos
- [x] Dinero en enteros, no float.
- [x] Precio congelado en el pedido.
- [x] Stock descontado en transacción atómica.
- [x] Webhook de pago verificado por firma.
- [x] JWT en cookie httpOnly, no en localStorage.
- [x] Toda entrada validada con Zod.
