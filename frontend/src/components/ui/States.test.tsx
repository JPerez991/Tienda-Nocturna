import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ErrorState, Spinner } from "./States";

describe("Spinner", () => {
  it("expone el estado de carga con role=status y texto", () => {
    render(<Spinner label="Cargando productos…" />);
    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
    expect(status).toHaveTextContent("Cargando productos…");
  });
});

describe("ErrorState", () => {
  it("muestra el mensaje con role=alert", () => {
    render(<ErrorState message="No pudimos cargar el catálogo" />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("No pudimos cargar el catálogo");
  });

  it("invoca onRetry al pulsar Intentar de nuevo", () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Fallo de red" onRetry={onRetry} />);
    fireEvent.click(screen.getByRole("button", { name: "Intentar de nuevo" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("no muestra botón de reintento sin onRetry", () => {
    render(<ErrorState message="Fallo" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
