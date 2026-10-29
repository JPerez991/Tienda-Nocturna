import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-16 bg-tinta text-crema/80">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="font-display text-lg font-medium uppercase tracking-[0.3em] text-crema">
              Nocturna
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              Lencería premium con envíos discretos a toda Colombia.
              Pagos seguros con Nequi, Daviplata, PSE, tarjeta y Bancolombia vía Wompi.
            </p>
          </div>

          <nav aria-label="Enlaces del pie">
            <h2 className="font-display text-base font-semibold text-crema">
              Tienda
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link to="/catalogo" className="hover:text-acento transition-colors">
                  Catálogo completo
                </Link>
              </li>
              <li>
                <Link to="/pedidos" className="hover:text-acento transition-colors">
                  Mis pedidos
                </Link>
              </li>
              <li>
                <Link to="/carrito" className="hover:text-acento transition-colors">
                  Mi carrito
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="font-display text-base font-semibold text-crema">
              Pagos seguros
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2 text-sm">
              {["Nequi", "Daviplata", "PSE", "Tarjeta", "Bancolombia"].map((m) => (
                <li
                  key={m}
                  className=" border border-crema/20 px-3 py-1.5"
                >
                  {m}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs">
              Procesado por Wompi. Tus datos de pago nunca tocan nuestros
              servidores.
            </p>
          </div>
        </div>

        <p className="mt-10 border-t border-crema/10 pt-6 text-center text-xs text-crema/60">
          © {new Date().getFullYear()} Nocturna · Bogotá, Colombia
        </p>
      </div>
    </footer>
  );
}
