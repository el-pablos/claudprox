/**
 * Setup DNS Cloudflare untuk subdomain ClaudProx ke origin VPS (IP via ENV VPS_ORIGIN_IP).
 *
 * Idempoten: cek dulu, baru create/update. Semua subdomain 1-level (mis.
 * api-claudprox) memakai proxied=true supaya IP origin tersembunyi di balik
 * Cloudflare (anti-DDoS) dan tetap ter-cover Universal SSL *.tams.codes.
 *
 * IP origin dibaca dari ENV VPS_ORIGIN_IP (jangan hardcode di source).
 *
 * Pemakaian:
 *   pnpm dlx tsx scripts/cloudflare-dns.ts
 */

import "dotenv/config";

const VPS_IP = process.env.VPS_ORIGIN_IP ?? "";
const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID ?? "";
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN ?? "";
const API_BASE = "https://api.cloudflare.com/client/v4";
const ZONE_DOMAIN = "tams.codes";

interface DnsRecordPlan {
  /** subdomain tanpa zone, mis. "claudprox" */
  name: string;
  /** Cloudflare proxy. false untuk endpoint streaming. */
  proxied: boolean;
}

const PLAN: DnsRecordPlan[] = [
  // Semua proxied=true: IP origin tersembunyi di balik Cloudflare.
  // Nama 1-level di bawah tams.codes agar ter-cover Universal SSL *.tams.codes.
  { name: "claudprox", proxied: true },
  { name: "dashboard-claudprox", proxied: true },
  { name: "admin-claudprox", proxied: true },
  { name: "api-claudprox", proxied: true },
];

interface ApiResponse<T> {
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  result: T;
}

interface DnsRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  proxied: boolean;
  ttl: number;
}

function ensureEnv(): void {
  if (ZONE_ID === "") throw new Error("CLOUDFLARE_ZONE_ID tidak diset");
  if (API_TOKEN === "") throw new Error("CLOUDFLARE_API_TOKEN tidak diset");
}

async function cf<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const text = await res.text();
  let body: ApiResponse<T>;
  try {
    body = JSON.parse(text) as ApiResponse<T>;
  } catch {
    throw new Error(`Cloudflare bukan JSON: status=${res.status} body=${text.slice(0, 200)}`);
  }
  if (!body.success) {
    const errMsg = body.errors.map((e) => `${e.code}: ${e.message}`).join(", ");
    throw new Error(`Cloudflare error: ${errMsg}`);
  }
  return body.result;
}

async function listRecords(fqdn: string): Promise<DnsRecord[]> {
  return cf<DnsRecord[]>(
    `/zones/${ZONE_ID}/dns_records?type=A&name=${encodeURIComponent(fqdn)}`,
  );
}

async function createRecord(fqdn: string, proxied: boolean): Promise<DnsRecord> {
  return cf<DnsRecord>(`/zones/${ZONE_ID}/dns_records`, {
    method: "POST",
    body: JSON.stringify({
      type: "A",
      name: fqdn,
      content: VPS_IP,
      ttl: 1,
      proxied,
    }),
  });
}

async function updateRecord(
  id: string,
  fqdn: string,
  proxied: boolean,
): Promise<DnsRecord> {
  return cf<DnsRecord>(`/zones/${ZONE_ID}/dns_records/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      type: "A",
      name: fqdn,
      content: VPS_IP,
      ttl: 1,
      proxied,
    }),
  });
}

async function main(): Promise<void> {
  ensureEnv();

  let created = 0;
  let updated = 0;
  let ok = 0;

  for (const entry of PLAN) {
    const fqdn = `${entry.name}.${ZONE_DOMAIN}`;
    const existing = await listRecords(fqdn);

    if (existing.length === 0) {
      await createRecord(fqdn, entry.proxied);
      created++;
      console.log(`[CREATE] ${fqdn} -> ${VPS_IP} (proxied=${entry.proxied})`);
      continue;
    }

    const current = existing[0];
    if (current === undefined) continue;
    if (current.content !== VPS_IP || current.proxied !== entry.proxied) {
      await updateRecord(current.id, fqdn, entry.proxied);
      updated++;
      console.log(`[UPDATE] ${fqdn} -> ${VPS_IP} (proxied=${entry.proxied})`);
    } else {
      ok++;
      console.log(`[OK]     ${fqdn} sudah benar`);
    }
  }

  console.log(`\nSelesai. created=${created} updated=${updated} ok=${ok}`);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`Gagal: ${msg}`);
  process.exit(1);
});
