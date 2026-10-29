import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Price } from "./Price";

describe("Price", () => {
  it("muestra el precio COP con etiqueta accesible", () => {
    render(<Price price={180000} />);
    expect(screen.getByLabelText("Precio: $ 180.000")).toBeInTheDocument();
  });

  it("muestra precio tachado y badge con el descuento", () => {
    render(<Price price={80000} compareAtPrice={100000} />);
    expect(screen.getByText("$ 100.000")).toHaveClass("line-through");
    expect(screen.getByText("−20%")).toBeInTheDocument();
  });

  it("no muestra badge sin precio de comparación", () => {
    render(<Price price={180000} />);
    expect(screen.queryByText(/−\d+%/)).not.toBeInTheDocument();
  });
});
