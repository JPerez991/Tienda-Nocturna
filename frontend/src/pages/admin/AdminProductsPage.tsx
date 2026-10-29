import { useEffect, useState, type FormEvent } from "react";
import { api, ApiError } from "../../lib/api";
import { formatCOP } from "../../lib/format";
import type { Category, Product, ProductDetail, ProductInput } from "../../lib/types";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Field";
import { Badge } from "../../components/ui/Badge";
import { ErrorState, Spinner } from "../../components/ui/States";

/* ============================================================
   Admin › Productos — lista + formulario crear/editar.
   El contrato expone POST y PATCH /api/admin/products.
   ============================================================ */

interface VariantForm {
  sku: string;
  name: string;
  price: string; // string en el form; se convierte al enviar
  stock: string;
}

interface FormState {
  name: string;
  slug: string;
  description: string;
  price: string;
  compareAtPrice: string;
  categoryId: string;
  imageUrl: string;
  imageAlt: string;
  variants: VariantForm[];
}

const formVacio: FormState = {
  name: "",
  slug: "",
  description: "",
  price: "",
  compareAtPrice: "",
  categoryId: "",
  imageUrl: "",
  imageAlt: "",
  variants: [{ sku: "", name: "Única", price: "", stock: "0" }],
};

function aFormulario(p: ProductDetail): FormState {
  return {
    name: p.name,
    slug: p.slug,
    description: p.description ?? "",
    price: String(p.price),
    compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : "",
    categoryId: p.category.id,
    imageUrl: p.images[0]?.url ?? "",
    imageAlt: p.images[0]?.alt ?? "",
    // Precargamos las variantes reales del producto (si trae al menos una);
    // si no, dejamos una fila vacía para que el admin agregue la primera.
    variants:
      p.variants.length > 0
        ? p.variants.map((v) => ({
            sku: v.sku,
            name: v.name,
            price: String(v.price),
            stock: String(v.stock),
          }))
        : [{ sku: "", name: "Única", price: String(p.price), stock: "0" }],
  };
}

function validar(f: FormState): Record<string, string> {
  const errs: Record<string, string> = {};
  if (!f.name.trim()) errs.name = "El nombre es obligatorio.";
  if (!f.slug.trim()) errs.slug = "El slug es obligatorio.";
  else if (!/^[a-z0-9-]+$/.test(f.slug.trim()))
    errs.slug = "Solo minúsculas, números y guiones.";
  if (!f.price.trim() || Number(f.price) <= 0)
    errs.price = "Ingresa un precio válido.";
  if (!f.categoryId) errs.categoryId = "Elige una categoría.";
  const sinSku = f.variants.some((v) => !v.sku.trim());
  if (sinSku) errs.variants = "Cada variante necesita un SKU.";
  const sinPrecio = f.variants.some((v) => !v.price.trim() || Number(v.price) <= 0);
  if (sinPrecio) errs.variants = errs.variants ?? "Cada variante necesita un precio.";
  return errs;
}

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [abierto, setAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(formVacio);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    api.products({ limit: 50 })
      .then((r) => {
        if (!cancelled) setProducts(r.items);
      })
      .catch((e) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Error desconocido");
      });
    void api
      .categories()
      .then((c) => {
        if (!cancelled) setCategories(c);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const set = (key: keyof FormState) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  function abrirNuevo() {
    setEditandoId(null);
    setForm({ ...formVacio, categoryId: categories[0]?.id ?? "" });
    setErrs({});
    setMsg(null);
    setAbierto(true);
  }

  async function abrirEditar(p: Product) {
    setEditandoId(p.id);
    // Abrimos ya con los datos básicos de la lista para no esperar…
    setForm({
      name: p.name,
      slug: p.slug,
      description: "",
      price: String(p.price),
      compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : "",
      categoryId: p.category.id,
      imageUrl: p.images[0]?.url ?? "",
      imageAlt: p.images[0]?.alt ?? "",
      variants: [{ sku: "", name: "Única", price: String(p.price), stock: "0" }],
    });
    setErrs({});
    setMsg(null);
    setAbierto(true);
    // …y luego precargamos el detalle real (descripción + variantes + stock).
    try {
      const detalle = await api.product(p.slug);
      setForm(aFormulario(detalle));
    } catch {
      // Si el detalle no carga, mantenemos lo básico de la lista y avisamos.
      setMsg(
        "No pudimos cargar las variantes del producto; revisa antes de guardar.",
      );
    }
  }

  function setVariante(i: number, key: keyof VariantForm, value: string) {
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v, idx) =>
        idx === i ? { ...v, [key]: value } : v,
      ),
    }));
  }

  async function guardar(e: FormEvent) {
    e.preventDefault();
    const errors = validar(form);
    setErrs(errors);
    if (Object.keys(errors).length > 0) return;

    setGuardando(true);
    setMsg(null);
    const payload: ProductInput = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || undefined,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
      categoryId: form.categoryId,
      images:
        form.imageUrl.trim() !== ""
          ? [{ url: form.imageUrl.trim(), alt: form.imageAlt.trim() || form.name.trim() }]
          : [],
      variants: form.variants.map((v) => ({
        sku: v.sku.trim(),
        name: v.name.trim() || "Única",
        price: Number(v.price),
        stock: Number(v.stock) || 0,
      })),
    };

    try {
      if (editandoId) await api.admin.updateProduct(editandoId, payload);
      else await api.admin.createProduct(payload);
      setMsg(editandoId ? "✓ Producto actualizado." : "✓ Producto creado.");
      setAbierto(false);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setMsg(
        err instanceof ApiError
          ? err.message
          : "No pudimos guardar el producto.",
      );
    } finally {
      setGuardando(false);
    }
  }

  if (error) return <ErrorState message={error} onRetry={() => setReloadKey((k) => k + 1)} />;
  if (products === null) return <Spinner label="Cargando productos…" />;

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-tibio" role="status">
          {products.length} {products.length === 1 ? "producto" : "productos"}
        </p>
        <Button onClick={abrirNuevo}>+ Nuevo producto</Button>
      </div>

      {msg && (
        <p
          role="status"
          className={`mb-4  px-4 py-3 text-sm ${
            msg.startsWith("✓") ? "bg-tinta/10 text-tinta" : "bg-vino/10 text-vino"
          }`}
        >
          {msg}
        </p>
      )}

      {/* ---------- Formulario (colapsable) ---------- */}
      {abierto && (
        <form
          onSubmit={guardar}
          className="mb-8 space-y-4  border border-acento/40 bg-white p-5 sm:p-6"
          noValidate
        >
          <h2 className="font-display text-xl font-semibold text-carbon">
            {editandoId ? "Editar producto" : "Nuevo producto"}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="p-name"
              label="Nombre"
              value={form.name}
              onChange={set("name")}
              error={errs.name}
              required
            />
            <Input
              id="p-slug"
              label="Slug (URL)"
              value={form.slug}
              onChange={set("slug")}
              error={errs.slug}
              hint="conjunto-encaje-15m"
              required
            />
            <Input
              id="p-price"
              label="Precio (COP)"
              type="number"
              inputMode="numeric"
              min={0}
              value={form.price}
              onChange={set("price")}
              error={errs.price}
              required
            />
            <Input
              id="p-compare"
              label="Precio antes del descuento"
              type="number"
              inputMode="numeric"
              min={0}
              value={form.compareAtPrice}
              onChange={set("compareAtPrice")}
              hint="Opcional. Deja vacío si no hay descuento."
            />
            <div>
              <label
                htmlFor="p-category"
                className="mb-1.5 block text-sm font-semibold text-carbon"
              >
                Categoría
              </label>
              <select
                id="p-category"
                value={form.categoryId}
                onChange={set("categoryId")}
                aria-invalid={!!errs.categoryId}
                className={`w-full min-h-12  border bg-white px-4 text-carbon ${
                  errs.categoryId ? "border-vino" : "border-tibio/30"
                }`}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errs.categoryId && (
                <p className="mt-1 text-xs font-medium text-vino">{errs.categoryId}</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="p-desc"
              className="mb-1.5 block text-sm font-semibold text-carbon"
            >
              Descripción
            </label>
            <textarea
              id="p-desc"
              value={form.description}
              onChange={set("description")}
              rows={3}
              className="w-full  border border-tibio/30 bg-white px-4 py-3 text-carbon"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="p-img"
              label="URL de la imagen"
              type="url"
              value={form.imageUrl}
              onChange={set("imageUrl")}
              hint="Opcional mientras no haya subida de archivos."
            />
            <Input
              id="p-alt"
              label="Texto alternativo de la imagen"
              value={form.imageAlt}
              onChange={set("imageAlt")}
              hint="Describe la imagen para lectores de pantalla."
            />
          </div>

          {/* Variantes */}
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-carbon">
              Variantes
            </legend>
            <div className="space-y-3">
              {form.variants.map((v, i) => (
                <div key={i} className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]">
                  <Input
                    id={`v-sku-${i}`}
                    label="SKU"
                    value={v.sku}
                    onChange={(e) => setVariante(i, "sku", e.target.value)}
                    required
                  />
                  <Input
                    id={`v-name-${i}`}
                    label="Nombre"
                    value={v.name}
                    onChange={(e) => setVariante(i, "name", e.target.value)}
                  />
                  <Input
                    id={`v-price-${i}`}
                    label="Precio"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={v.price}
                    onChange={(e) => setVariante(i, "price", e.target.value)}
                    required
                  />
                  <Input
                    id={`v-stock-${i}`}
                    label="Stock"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={v.stock}
                    onChange={(e) => setVariante(i, "stock", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        variants: f.variants.filter((_, idx) => idx !== i),
                      }))
                    }
                    disabled={form.variants.length <= 1}
                    aria-label={`Quitar variante ${i + 1}`}
                    className="mt-6 inline-flex size-11 items-center justify-center  text-vino transition-colors hover:bg-vino/10 disabled:opacity-40"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            {errs.variants && (
              <p className="mt-2 text-xs font-medium text-vino">{errs.variants}</p>
            )}
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  variants: [
                    ...f.variants,
                    { sku: "", name: "", price: f.price, stock: "0" },
                  ],
                }))
              }
              className="mt-3 min-h-11 bg-tinta/5 px-4 text-sm font-semibold text-tinta transition-colors hover:bg-tinta/10"
            >
              + Agregar variante
            </button>
          </fieldset>

          <div className="flex gap-3">
            <Button type="submit" loading={guardando}>
              {editandoId ? "Guardar cambios" : "Crear producto"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setAbierto(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {/* ---------- Lista ---------- */}
      {products.length === 0 ? (
        <p className=" border border-dashed border-tibio/30 bg-white/60 px-6 py-14 text-center text-tibio">
          Aún no hay productos. Crea el primero con el botón superior.
        </p>
      ) : (
        <ul className="space-y-3">
          {products.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center gap-4  border border-carbon/5 bg-white p-4"
            >
              <span className="size-14 shrink-0 overflow-hidden  bg-crema">
                {p.images[0] ? (
                  <img
                    src={p.images[0].url}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <span aria-hidden="true" className="flex size-full items-center justify-center bg-nude">
                    <svg className="size-7 stroke-[1.5] text-tibio/70" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5a2 2 0 1 0-2-2M12 7.5v2L4.5 15.8c-.6.5-.3 1.4.4 1.4h14.2c.7 0 1-.9.4-1.4L12 9.5" />
                    </svg>
                  </span>
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display font-semibold text-carbon">
                  {p.name}
                </p>
                <p className="text-sm text-tibio">
                  {p.category.name} · /{p.slug}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-display font-semibold text-tinta">
                  {formatCOP(p.price)}
                </span>
                {p.compareAtPrice && p.compareAtPrice > p.price && (
                  <Badge tone="warning">Oferta</Badge>
                )}
                <Button size="sm" variant="ghost" onClick={() => abrirEditar(p)}>
                  Editar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
