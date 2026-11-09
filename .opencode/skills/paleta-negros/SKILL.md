---
name: paleta-negros
description: Paleta de negros de Nocturna (noir · tinta · gráfico · humo) para componer superficies oscuras por CAPAS. Úsala en banners, bandas, footers y paneles oscuros cuando se pida "jugar con los colores", profundidad tonal o fondos negros elegantes.
---

# Skill: Paleta de negros — Nocturna

Los negros de Nocturna **no son #000 plano**: son negros con matiz cálido
que se **apilan** para crear profundidad sin fotografía (referencia:
campañas "noir" de casas de moda — Saint Laurent, Totême, The Row — fondos
compuestos por capas, nunca gris plano).

Extiende `ui-design` (que manda en identidad, tipos y esquinas rectas);
**no reemplaza** los tokens de marca: crema, nude, vino y acento siguen
intactos.

## Tokens (frontend/src/index.css → `@theme`)

| Token | Hex | Rol |
|---|---|---|
| `noir` | `#0a0908` | Profundidad máxima: lavados inferiores, bases hondas |
| `tinta` | `#14100e` | Negro cálido base (marca): header, footer, franja de anuncios |
| `tinta-suave` | `#2a2320` | Hover de superficies oscuras |
| `grafito` | `#24201d` | Capa media tonal: halos radiales sobre tinta |
| `humo` | `#3a3431` | Tono más claro: hairlines sobre oscuro |

## Reglas

1. **Profundidad por capas, no por gris**: sobre `tinta` se apila `noir`
   (lavado inferior) + `grafito` (halo donde "cae la luz") + como mucho
   una mancha cálida `acento/10`. Máximo **3 capas** por superficie.
2. **Gradientes en negros, jamás en gris neutro**: usar
   `radial-gradient(… var(--color-grafito) …)` o `from-noir` — los grises
   fríos rompen el matiz cálido de la marca.
3. **Sutilidad**: blur ≥ 90px en halos, opacidades 10–90%, bandas con
   `gradient-to-t` suave. Si se nota la técnica, sobra una capa.
4. **Contraste AA**: sobre cualquier negro de la paleta solo texto
   `crema`/`acento-claro` (y `humo` para secundario). Nunca `tinta` ni
   `carbon` sobre estos fondos.
5. **Hairlines sobre oscuro**: `bg-humo/60` (no `crema/10` puro cuando se
   quiera un filo más tibio y visible).

## Ejemplos canónicos (superficies oscuras vigentes)

- **Franja de anuncios superior** (`AnnouncementBar`): `bg-tinta` plano,
  `h-9`, versalitas 10.5px `tracking-[0.22em]` con mensajes de envío que
  rotan. No necesita capas: al ser una banda de 36px el plano lee limpio.
- **Banda lookbook** del home: foto a sangre + velo `bg-tinta/60` (ahí el
  negro es capa de legibilidad, no fondo).
- **Footer** y **header**: `bg-tinta` con hairlines `crema/10`.
- Para paneles oscuros más grandes (futuros): halo `grafito` radial →
  lavado `from-noir` → mancha `acento/10` (máx. 3 capas).

## Anti-patrones

- ❌ `#000000` puro en grandes áreas (plano, áspero, sin matiz).
- ❌ Más de 3 capas tonales por superficie.
- ❌ Grises neutros fríos sobre `tinta`.
- ❌ Poner el banner del home en negro: hoy es **blanco con enlaces**
  informativos (decisión del usuario — no reintroducir el hero oscuro).
