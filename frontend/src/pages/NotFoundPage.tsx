import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-24 text-center">
      <p className="etiqueta">Página no encontrada</p>
      <h1 className="font-display text-6xl font-semibold italic text-tinta">
        404
      </h1>
      <p className="text-tibio">
        La página que buscas no existe o cambió de lugar.
      </p>
      <Link to="/">
        <Button>Volver al inicio</Button>
      </Link>
    </div>
  );
}
