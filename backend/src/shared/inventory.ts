import type { Prisma } from "@prisma/client";

// Reserva/reposición de stock. Todas las escrituras de inventario pasan por
// aquí para mantener UNA sola regla en el sistema:
// - El stock se RESERVA al crear el pedido (evita vender de más).
// - Se REPONE si el pedido se cancela o el pago se rechaza.

export interface StockLine {
  variantId: string;
  quantity: number;
}

// Descuenta stock de forma atómica: solo si hay stock suficiente.
// Devuelve la línea que no pudo reservarse (null = todo reservado).
export async function reserveStock(
  tx: Prisma.TransactionClient,
  lines: StockLine[],
): Promise<StockLine | null> {
  for (const line of lines) {
    const updated = await tx.productVariant.updateMany({
      where: { id: line.variantId, stock: { gte: line.quantity } },
      data: { stock: { decrement: line.quantity } },
    });
    if (updated.count === 0) return line;
  }
  return null;
}

// Devuelve las unidades al inventario (cancelaciones y pagos rechazados).
export async function restock(
  tx: Prisma.TransactionClient,
  lines: StockLine[],
): Promise<void> {
  for (const line of lines) {
    await tx.productVariant.update({
      where: { id: line.variantId },
      data: { stock: { increment: line.quantity } },
    });
  }
}
