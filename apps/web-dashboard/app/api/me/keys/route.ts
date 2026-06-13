import { NextResponse } from "next/server";
import { generateApiKey } from "@claudprox/server";
import { readSession } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const APIKEY_HASH_SECRET = process.env.APIKEY_HASH_SECRET;
const GATEWAY_BASE_URL = process.env.GATEWAY_BASE_URL ?? "https://api.claudprox.tams.codes";

function ensureSecret(): string {
  if (APIKEY_HASH_SECRET === undefined || APIKEY_HASH_SECRET === "") {
    throw new Error("APIKEY_HASH_SECRET tidak diset");
  }
  return APIKEY_HASH_SECRET;
}

export async function GET() {
  const session = readSession();
  if (session === null) {
    return NextResponse.json({ error: { type: "unauthenticated" } }, { status: 401 });
  }
  const keys = await prisma.apiKey.findMany({
    where: { userId: session.sub },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      label: true,
      isActive: true,
      createdAt: true,
      lastUsedAt: true,
    },
  });
  // Prefix tidak disimpan di schema saat ini; pakai 12 char dari id sebagai display.
  const safe = keys.map((k) => ({
    id: k.id,
    prefix: `cpx_live_${k.id.slice(0, 8)}`,
    isActive: k.isActive,
    createdAt: k.createdAt.toISOString(),
    lastUsedAt: k.lastUsedAt ? k.lastUsedAt.toISOString() : null,
  }));
  return NextResponse.json({ baseUrl: GATEWAY_BASE_URL, keys: safe });
}

export async function POST() {
  const session = readSession();
  if (session === null) {
    return NextResponse.json({ error: { type: "unauthenticated" } }, { status: 401 });
  }
  const generated = generateApiKey(ensureSecret());
  await prisma.apiKey.create({
    data: {
      userId: session.sub,
      keyHash: generated.keyHash,
      label: "dashboard",
      isActive: true,
    },
  });
  return NextResponse.json({
    plaintext: generated.plaintext,
    prefix: generated.keyPrefix,
  });
}
