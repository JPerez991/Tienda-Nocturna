import Fastify from "fastify";
import { env } from "./config/env.js";
import { registerSecurity } from "./shared/plugins/security.js";
import { registerRawBody } from "./shared/plugins/raw-body.js";
import { registerErrorHandler } from "./shared/errors/error-handler.js";
import { setupAuth } from "./shared/auth/plugin.js";
import { healthRoutes } from "./modules/health/health.routes.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { categoryRoutes } from "./modules/categories/category.routes.js";
import { productRoutes } from "./modules/products/product.routes.js";
import { addressRoutes } from "./modules/addresses/address.routes.js";
import { cartRoutes } from "./modules/cart/cart.routes.js";
import { orderRoutes } from "./modules/orders/order.routes.js";
import { paymentRoutes } from "./modules/payments/payment.routes.js";
import { questionRoutes } from "./modules/questions/question.routes.js";

// Construye la instancia de Fastify con plugins, seguridad y rutas.
// Separado de server.ts para poder testear la app sin escuchar puertos.
export async function buildApp() {
  const app = Fastify({
    logger: env.NODE_ENV === "development",
  });

  // Seguridad primero.
  await registerSecurity(app);
  // Cuerpo crudo en request.rawBody (necesario para firmas de webhooks).
  registerRawBody(app);
  // Manejador global de errores.
  registerErrorHandler(app);
  // Decoradores authenticate / requireRole (globales).
  await setupAuth(app);

  // Rutas.
  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(categoryRoutes);
  await app.register(productRoutes);
  await app.register(addressRoutes);
  await app.register(cartRoutes);
  await app.register(orderRoutes);
  await app.register(paymentRoutes);
  await app.register(questionRoutes);

  return app;
}
