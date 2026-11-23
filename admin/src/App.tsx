import { useEffect } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { AdminShell } from "./components/admin/AdminShell";
import { AdminOrdersPage } from "./pages/admin/AdminOrdersPage";
import { AdminProductsPage } from "./pages/admin/AdminProductsPage";
import { AdminCategoriesPage } from "./pages/admin/AdminCategoriesPage";
import { AdminQuestionsPage } from "./pages/admin/AdminQuestionsPage";
import { LoginPage } from "./pages/LoginPage";

/** Al cambiar de sección, volvemos arriba. */
function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

function NoEncontrada() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-2xl font-semibold text-carbon">
        Esta sección no existe
      </h1>
      <p className="text-sm text-tibio">
        Puede que la dirección esté mal escrita o que la sección se haya movido.
      </p>
      <Link
        to="/"
        className="inline-flex min-h-11 items-center border-b border-tinta/30 pb-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-tinta transition-colors hover:border-tinta"
      >
        Volver a pedidos
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollTop />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <AdminShell>
              <AdminOrdersPage />
            </AdminShell>
          }
        />
        <Route
          path="/productos"
          element={
            <AdminShell>
              <AdminProductsPage />
            </AdminShell>
          }
        />
        <Route
          path="/categorias"
          element={
            <AdminShell>
              <AdminCategoriesPage />
            </AdminShell>
          }
        />
        <Route
          path="/preguntas"
          element={
            <AdminShell>
              <AdminQuestionsPage />
            </AdminShell>
          }
        />
        <Route path="*" element={<NoEncontrada />} />
      </Routes>
    </>
  );
}
