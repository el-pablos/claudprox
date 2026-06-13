// Passthrough SSE: pipe stream upstream ke reply Fastify tanpa buffering penuh,
// sambil mengintip setiap chunk untuk menangkap field `usage` (biasanya muncul
// pada event terakhir sebelum [DONE]). Mengembalikan total token terpakai.

import type { FastifyReply } from "fastify";
import type { TokenUsage } from "./tokenMeter.js";
import { extractUsage } from "./tokenMeter.js";

/**
 * Pipe ReadableStream SSE dari upstream ke reply Fastify.
 *
 * Setiap baris `data: {...}` di-parse untuk mencari field `usage`. Stream tetap
 * diteruskan apa adanya ke klien (tidak dibuffer penuh). Setelah selesai,
 * mengembalikan TokenUsage bila ditemukan, atau null bila tidak ada.
 *
 * @param upstreamBody body ReadableStream dari Response upstream.
 * @param reply        reply Fastify yang sudah diset header SSE oleh caller.
 */
export async function pipeSse(
  upstreamBody: ReadableStream<Uint8Array>,
  reply: FastifyReply,
): Promise<TokenUsage | null> {
  const reader = upstreamBody.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let usage: TokenUsage | null = null;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      // Teruskan chunk mentah ke klien langsung (tanpa menunggu stream selesai).
      reply.raw.write(chunk);

      // Intip usage dari baris data SSE.
      buffer += chunk;
      const found = scanBufferForUsage(buffer);
      if (found.usage !== null) {
        usage = found.usage;
      }
      buffer = found.remainder;
    }
  } finally {
    reader.releaseLock();
    reply.raw.end();
  }

  return usage;
}

interface ScanResult {
  usage: TokenUsage | null;
  /** Sisa buffer (baris terakhir yang belum lengkap). */
  remainder: string;
}

/**
 * Pindai buffer SSE per baris, cari payload JSON yang punya field `usage`.
 * Baris terakhir yang belum diakhiri newline dikembalikan sebagai remainder.
 */
function scanBufferForUsage(buffer: string): ScanResult {
  const lines = buffer.split("\n");
  // Baris terakhir mungkin belum lengkap; simpan untuk iterasi berikutnya.
  const remainder = lines.pop() ?? "";
  let usage: TokenUsage | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data:")) {
      continue;
    }
    const payload = trimmed.slice("data:".length).trim();
    if (payload === "" || payload === "[DONE]") {
      continue;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(payload);
    } catch {
      // Chunk SSE bisa terpotong; abaikan baris yang belum jadi JSON utuh.
      continue;
    }

    const found = extractUsage(parsed);
    if (found !== null) {
      usage = found;
    }
  }

  return { usage, remainder };
}
