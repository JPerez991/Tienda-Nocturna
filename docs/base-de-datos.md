# 📦 Diseño de la Base de datos

**Motor:** PostgreSQL · **ORM:** Prisma · **Archivo:** `backend/prisma/schema.prisma`

## Decisiones clave

### 1. El dinero siempre en enteros (COP)
Los montos se guardan como `Int` en pesos colombianos. Ej: `120000` = $120.000.
Nunca se usa `Float` ni `Decimal` con decimales, porque Colombia no usa decimales
en el peso y los decimales causan errores de redondeo en cobros.

### 2. Precio congelado en el pedido
`OrderItem.unitPrice` guarda el precio **al momento de comprar**. Si mañana subes
el precio del producto, el historial de pedidos no cambia.
Además `name` y `sku` se copian al pedido (snapshot), por si editas el producto.

### 3. Inventario atómico por variante
El stock vive en `ProductVariant.stock`. El descuento de stock debe hacerse en una
**transacción SQL** con bloqueo, para que dos compras simultáneas no vendan el
mismo último producto. (Esto se implementa en el backend, sección `stock`.)

### 4. Pagos con Adapter y idempotencia
- `Payment.gatewayRef` guarda la referencia de Wompi.
- `Payment.idempotencyKey` garantiza que un mismo intento de pago **no se cobre dos veces**.
- `Payment.rawWebhook` guarda la respuesta cruda del webhook para auditoría
  (¡nunca datos de tarjeta! Wompi tokeniza).

### 5. Multi-tenancy (preparado para varias tiendas)
Tu ejemplo era multi-tienda. Aquí dejamos la base lista: si en el futuro necesitas
varias tiendas, se agrega un modelo `Store` y una columna `storeId` a `Product`,
`Order`, etc. Por ahora es **una tienda** para mantenerlo simple (fase básica).

## Diagrama de entidades (simplificado)

```
User ──< Address
User ──< CartItem >── ProductVariant >── Product >── Category
User ──< Order >── OrderItem >── ProductVariant
Order ── 1:1 ── Payment
Product ──< ProductImage
Product ──< Review >── User
Product ──< Question
Banner (independiente)
```

## Relaciones y borrado
- Borrar un `User` borra sus direcciones y carrito (`onDelete: Cascade`), pero sus
  `Order` se conservan (no se borra el historial de ventas).
- Borrar un `Product` borra sus imágenes, variantes, reseñas y preguntas.
- `OrderItem` se borra con el pedido, pero el `Order` no se borra con el usuario.

## Tablas e índices pensados para rendimiento
- Índices en: `User.email`, `Product.slug`, `Product.categoryId`, `Order.status`,
  `Order.userId`, `ProductVariant.productId`.
- `@@unique([userId, variantId])` en el carrito evita renglones duplicados.

## Próximos pasos de la BD (fase 2+)
- [ ] Tabla `Store` para multi-tenancy real.
- [ ] Tabla `Coupon` para cupones de descuento (cyber / liquidaciones).
- [ ] Tabla `Shipment` con guía de transportadora (Servientrega, Coordinadora, etc.).
- [ ] Tabla `Refund` para devoluciones y reembolsos.
