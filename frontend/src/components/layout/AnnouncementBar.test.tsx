import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AnnouncementBar } from "./AnnouncementBar";
import { WhatsAppButton } from "./WhatsAppButton";

describe("AnnouncementBar", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("muestra el primer mensaje y rota cada 5 segundos", () => {
    render(<AnnouncementBar />);
    expect(screen.getByText("Envíos a todo Colombia")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText("Empaque discreto, sin logos")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText("Envío asegurado y con seguimiento")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText("Envíos a todo Colombia")).toBeInTheDocument();
  });

  it("queda fija en el primer mensaje con prefers-reduced-motion", () => {
    const original = window.matchMedia;
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
    }) as unknown as typeof window.matchMedia;

    try {
      render(<AnnouncementBar />);
      act(() => {
        vi.advanceTimersByTime(15000);
      });
      expect(screen.getByText("Envíos a todo Colombia")).toBeInTheDocument();
    } finally {
      window.matchMedia = original;
    }
  });
});

describe("WhatsAppButton", () => {
  it("enlaza a wa.me en pestaña nueva y tiene etiqueta accesible", () => {
    render(<WhatsAppButton />);
    const link = screen.getByRole("link", { name: /whatsapp/i });
    expect(link.getAttribute("href")).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
  });
});
