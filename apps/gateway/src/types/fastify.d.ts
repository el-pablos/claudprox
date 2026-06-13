// Augmentasi tipe FastifyRequest untuk menyimpan konteks auth, subscription,
// dan rate limit antar preHandler. Disusun terpisah agar dipakai semua middleware.

import "fastify";
import type { Subscription, User, Plan } from "@prisma/client";

/** Konteks API key yang sudah terverifikasi pada request. */
export interface ApiKeyContext {
  apiKeyId: string;
  userId: string;
  user: User;
}

declare module "fastify" {
  interface FastifyRequest {
    /** Diisi oleh middleware apiKeyAuth setelah key valid. */
    apiKeyCtx?: ApiKeyContext;
    /** Diisi oleh middleware quotaGuard: subscription aktif beserta plan-nya. */
    subscription?: Subscription & { plan: Plan };
  }
}
