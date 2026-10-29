import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("renderiza los hijos y maneja clics", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Pagar</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Pagar" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("queda deshabilitado y con aria-busy mientras carga", () => {
    render(<Button loading>Enviando</Button>);
    const btn = screen.getByRole("button", { name: "Enviando" });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
  });

  it("respeta disabled explícito", () => {
    render(<Button disabled>Continuar</Button>);
    expect(screen.getByRole("button", { name: "Continuar" })).toBeDisabled();
  });
});
