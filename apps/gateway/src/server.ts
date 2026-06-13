// Entry point gateway ClaudProx.
// Membangun instance Fastify, memuat .env root, mendaftarkan CORS, Prisma,
// error handler, dan semua route. Endpoint /v1/* dilindungi rantai preHandler
// apiKeyAuth -> quotaGuard -> rateLimit.

import path from "node:path";
import { config as loadEnv } from "dotenv";
import Fastify from "fastify";
import cors from "@fastify/cors";

// .env berada di root monorepo (dua tingkat di atas apps/gateway/src saat
// dijalankan via tsx, atau dist saat produksi). Muat sebelum membaca env.
loadEnv({ path: path.resolve(__dirname, "..", "..", "..", ".env") });

import { registerPrisma } from "./plugins/prisma.js";
import { registerErrorHandler } from "./plugins/errorHandler.js";
import { registerHealthRoute } from "./routes/health.js";
import { registerModelsRoute } from "./routes/v1-models.js";
import { registerChatRoute } from "./routes/v1-chat.js";
import { registerMessagesRoute } from "./routes/v1-messages.js";
import { createApiKeyAuth } from "./middleware/apiKeyAuth.js";
import { createQuotaGuard } from "./middleware/quotaGuard.js";
import { rateLimit } from "./middleware/rateLimit.js";

/** Daftar origin yang diizinkan CORS, dibatasi domain sendiri dari env. */
function allowedOrigins(): string[] {
  const candidates = [
    process.env.APP_BASE_URL,
    process.env.DASHBOARD_USER_URL,
    process.env.DASHBOARD_ADMIN_URL,
    process.env.GATEWAY_BASE_URL,
  ];
  return candidates.filter((value): value is string => typeof value === "string" && value !== "");
}

export async function buildServer() {
  const app = Fastify({
    logger: { level: process.env.LOG_LEVEL ?? "info" },
    bodyLimit: 10 * 1024 * 1024,
  });

  await app.register(cors, {
    origin: allowedOrigins(),
    credentials: true,
  });

  const prisma = await registerPrisma(app);
  registerErrorHandler(app);

  // Route publik tanpa auth.
  await registerHealthRoute(app);

  // Rantai preHandler untuk semua endpoint /v1/*.
  const apiKeyAuth = createApiKeyAuth(prisma);
  const quotaGuard = createQuotaGuard(prisma);

  await app.register(async (v1) => {
    v1.addHook("preHandler", apiKeyAuth);
    v1.addHook("preHandler", quotaGuard);
    v1.addHook("preHandler", rateLimit);

    await registerModelsRoute(v1);
    await registerChatRoute(v1);
    await registerMessagesRoute(v1);
  });

  return app;
}

async function start(): Promise<void> {
  const app = await buildServer();
  const port = Number(process.env.GATEWAY_PORT ?? 4015);
  const host = process.env.GATEWAY_HOST ?? "0.0.0.0";

  try {
    await app.listen({ port, host });
  } catch (error: unknown) {
    app.log.error(error, "Gagal menjalankan gateway");
    process.exit(1);
  }
}

// Jalankan bila dieksekusi langsung (node dist/server.js) atau di produksi via
// PM2. PM2 fork mode membungkus entry lewat ProcessContainerFork sehingga
// process.argv[1] tidak menunjuk server.js; NODE_ENV=production dari ecosystem
// memastikan start() tetap terpanggil. Saat test (vitest via tsx) kedua kondisi
// false sehingga server tidak auto-start.
const runDirectly = process.argv[1]?.includes("server") ?? false;
if (process.env.NODE_ENV === "production" || runDirectly) {
  void start();
}
