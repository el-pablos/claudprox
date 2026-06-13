// Setup PrismaClient singleton untuk Fastify.
// Tidak memakai fastify-plugin agar tidak menambah dependency; fungsi ini
// dipanggil langsung di server.ts (bukan via app.register) sehingga decorate
// berlaku pada instance utama tanpa batas enkapsulasi.

import { PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

/**
 * Pasang PrismaClient ke instance Fastify dan daftarkan disconnect saat close.
 * @returns instance PrismaClient yang dipakai (berguna untuk pengujian).
 */
export async function registerPrisma(app: FastifyInstance): Promise<PrismaClient> {
  const prisma = new PrismaClient();
  await prisma.$connect();

  app.decorate("prisma", prisma);
  app.addHook("onClose", async (instance) => {
    await instance.prisma.$disconnect();
  });

  return prisma;
}
