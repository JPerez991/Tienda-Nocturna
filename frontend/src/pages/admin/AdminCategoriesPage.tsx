import { useEffect, useState, type FormEvent } from "react";
import { api, ApiError } from "../../lib/api";
import type { Category, CategoryInput } from "../../lib/types";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Field";
import { ErrorState, Spinner } from "../../components/ui/States";

/* ============================================================
   Admin › Categorías — lista + formulario crear.
   El contrato expone POST /api/admin/categories.
   ============================================================ */

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [abierto, setAbierto] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", imageUrl: "" });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    api
      .categories()
      .then((c) => {
        if (!cancelled) setCategories(c);
      })
      .catch((e) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Error desconocido");
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function guardar(e: FormEvent) {
    e.preventDefault();
    const nextErrs: Record<string, string> = {};
    if (!form.name.trim()) nextErrs.name = "El nombre es obligatorio.";
    if (!form.slug.trim()) nextErrs.slug = "El slug es obligatorio.";
    else if (!/^[a-z0-9-]+$/.test(form.slug.trim()))
      nextErrs.slug = "Solo minúsculas, números y guiones.";
    setErrs(nextErrs);
    if (Object.keys(nextErrs).length > 0) return;

    setGuardando(true);
    setMsg(null);
    const payload: CategoryInput = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      imageUrl: form.imageUrl.trim() || undefined,
    };
    try {
      await api.admin.createCategory(payload);
      setMsg("✓ Categoría creada.");
      setForm({ name: "", slug: "", imageUrl: "" });
      setAbierto(false);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setMsg(
        err instanceof ApiError
          ? err.message
          : "No pudimos crear la categoría.",
      );
    } finally {
      setGuardando(false);
    }
  }

  if (error) return <ErrorState message={error} onRetry={() => setReloadKey((k) => k + 1)} />;
  if (categories === null) return <Spinner label="Cargando categorías…" />;

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-tibio" role="status">
          {categories.length}{" "}
          {categories.length === 1 ? "categoría" : "categorías"}
        </p>
        <Button onClick={() => { setMsg(null); setAbierto((v) => !v); }}>
          {abierto ? "Cerrar formulario" : "+ Nueva categoría"}
        </Button>
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

      {abierto && (
        <form
          onSubmit={guardar}
          className="mb-8 space-y-4  border border-acento/40 bg-white p-5 sm:p-6"
          noValidate
        >
          <h2 className="font-display text-xl font-semibold text-carbon">
            Nueva categoría
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="c-name"
              label="Nombre"
              value={form.name}
              onChange={set("name")}
              error={errs.name}
              placeholder="Conjunto de encaje"
              required
            />
            <Input
              id="c-slug"
              label="Slug (URL)"
              value={form.slug}
              onChange={set("slug")}
              error={errs.slug}
              hint="conjunto-encaje"
              required
            />
          </div>
          <Input
            id="c-img"
            label="URL de la imagen (opcional)"
            type="url"
            value={form.imageUrl}
            onChange={set("imageUrl")}
          />
          <div className="flex gap-3">
            <Button type="submit" loading={guardando}>
              Crear categoría
            </Button>
            <Button type="button" variant="ghost" onClick={() => setAbierto(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {categories.length === 0 ? (
        <p className=" border border-dashed border-tibio/30 bg-white/60 px-6 py-14 text-center text-tibio">
          Aún no hay categorías. Crea la primera con el botón superior.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-3  border border-carbon/5 bg-white p-4"
            >
              <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden  bg-crema">
                {c.imageUrl ? (
                  <img src={c.imageUrl} alt="" className="size-full object-cover" />
                ) : (
                  <span aria-hidden="true" className="flex size-full items-center justify-center">
                    <svg className="size-5 stroke-[1.5] text-tibio" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5a2 2 0 1 0-2-2M12 7.5v2L4.5 15.8c-.6.5-.3 1.4.4 1.4h14.2c.7 0 1-.9.4-1.4L12 9.5" />
                    </svg>
                  </span>
                )}
              </span>
              <div className="min-w-0">
                <p className="truncate font-display font-semibold text-carbon">
                  {c.name}
                </p>
                <p className="truncate text-sm text-tibio">/{c.slug}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
