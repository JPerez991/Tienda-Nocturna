import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ESTADO_PEDIDO, StatusBadge } from "./OrdersPage";

describe("ESTADO_PEDIDO", () => {
  it("cubre los 7 estados del enum canónico (respuesta B.8)", () => {
    expect(Object.keys(ESTADO_PEDIDO).sort()).toEqual(
      ["CANCELLED", "DELIVERED", "PAID", "PENDING", "PROCESSING", "REFUNDED", "SHIPPED"].sort(),
    );
  });
});

describe("StatusBadge", () => {
  it("etiqueta los estados en español", () => {
    render(<StatusBadge status="PENDING" />);
    expect(screen.getByText("Pendiente de pago")).toBeInTheDocument();
  });

  it("etiqueta REEMBOLSADO (estado nuevo)", () => {
    render(<StatusBadge status="REFUNDED" />);
    expect(screen.getByText("Reembolsado")).toBeInTheDocument();
  });

  it("etiqueta PROCESSING (estado nuevo)", () => {
    render(<StatusBadge status="PROCESSING" />);
    expect(screen.getByText("En preparación")).toBeInTheDocument();
  });
});
