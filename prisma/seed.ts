// Seed data ClaudProx: 3 paket langganan + 1 admin.
// Dijalankan via `pnpm prisma:seed` (tsx prisma/seed.ts) dari root.
// Kredensial admin diambil dari env (.env root), tidak boleh di-hardcode.

import path from "node:path";
import { config as loadEnv } from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

// .env ada di root repo. Saat dijalankan dari root cwd-nya sudah benar,
// tapi resolve eksplisit ke ../.env relatif file ini agar tetap jalan
// meski dipanggil dari direktori lain.
loadEnv({ path: path.resolve(__dirname, "..", ".env") });

const BCRYPT_COST = 12;

interface PlanSeed {
  name: string;
  tokenQuota: bigint;
  durationDays: number;
  priceIdr: number;
  rateLimitRpm: number;
  sortOrder: number;
}

const PLAN_SEEDS: PlanSeed[] = [
  {
    name: "Starter",
    tokenQuota: 20_000_000n,
    durationDays: 3,
    priceIdr: 30_000,
    rateLimitRpm: 60,
    sortOrder: 1,
  },
  {
    name: "Pro",
    tokenQuota: 100_000_000n,
    durationDays: 6,
    priceIdr: 50_000,
    rateLimitRpm: 120,
    sortOrder: 2,
  },
  {
    name: "Ultra",
    tokenQuota: 300_000_000n,
    durationDays: 14,
    priceIdr: 120_000,
    rateLimitRpm: 240,
    sortOrder: 3,
  },
];

function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    throw new Error(`Variabel env wajib tidak ditemukan: ${name}`);
  }
  return value;
}

async function seedPlans(prisma: PrismaClient): Promise<void> {
  for (const plan of PLAN_SEEDS) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: {
        tokenQuota: plan.tokenQuota,
        durationDays: plan.durationDays,
        priceIdr: plan.priceIdr,
        rateLimitRpm: plan.rateLimitRpm,
        sortOrder: plan.sortOrder,
      },
      create: {
        name: plan.name,
        tokenQuota: plan.tokenQuota,
        durationDays: plan.durationDays,
        priceIdr: plan.priceIdr,
        rateLimitRpm: plan.rateLimitRpm,
        sortOrder: plan.sortOrder,
      },
    });
    console.log(`Plan disiapkan: ${plan.name}`);
  }
}

async function seedAdmin(prisma: PrismaClient): Promise<void> {
  const email = requireEnv("SEED_ADMIN_EMAIL");
  const password = requireEnv("SEED_ADMIN_PASSWORD");
  const name = requireEnv("SEED_ADMIN_NAME");

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      role: "ADMIN",
    },
    create: {
      email,
      name,
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log(`Admin disiapkan: ${email}`);
}

async function main(): Promise<void> {
  const prisma = new PrismaClient();
  try {
    await seedPlans(prisma);
    await seedAdmin(prisma);
    console.log("Seed selesai.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error("Seed gagal:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
