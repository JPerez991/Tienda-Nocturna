import { buildApp } from "./app.js";
import { env } from "./config/env.js";

// Arranca el servidor. Maneja errores de arranque de forma limpia.
async function main() {
  const app = await buildApp();

  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  // Cierre gracioso ante Ctrl+C (cierra conexiones y BD).
  const shutdown = async () => {
    await app.close();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main();
