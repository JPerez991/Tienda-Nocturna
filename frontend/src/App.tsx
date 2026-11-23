import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { AnnouncementBar } from "./components/layout/AnnouncementBar";
import { WhatsAppButton } from "./components/layout/WhatsAppButton";
import { HomePage } from "./pages/HomePage";
import { CatalogPage } from "./pages/CatalogPage";
import { ProductPage } from "./pages/ProductPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { OrdersPage } from "./pages/OrdersPage";
import { OrderDetailPage } from "./pages/OrderDetailPage";
import { InfoPage } from "./pages/info/InfoPage";
import { ENVIOS, GARANTIA, PAGOS } from "./pages/info/contenidos";
import { NotFoundPage } from "./pages/NotFoundPage";

/** Al cambiar de ruta, movemos el foco al contenido y scrolleamos arriba. */
function ScrollAndFocus() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus: focus:bg-tinta focus:px-4 focus:py-2 focus:font-semibold focus:text-crema"
      >
        Saltar al contenido
      </a>
      <ScrollAndFocus />
      <AnnouncementBar />
      <Header />
      <main id="contenido" className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/producto/:slug" element={<ProductPage />} />
          <Route path="/carrito" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/pedidos" element={<OrdersPage />} />
          <Route path="/pedidos/:id" element={<OrderDetailPage />} />
          {/* Páginas informativas de la tienda (enlazadas desde el banner) */}
          <Route path="/envios" element={<InfoPage {...ENVIOS} />} />
          <Route path="/garantia" element={<InfoPage {...GARANTIA} />} />
          <Route path="/pagos" element={<InfoPage {...PAGOS} />} />
          {/* El panel de administración vive en otro repo/despliegue
              (tiendaNocturna-admin) y no comparte esta interfaz. */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
