// Client HTTP ke upstream proxy.tams.codes.
// Auth via Authorization: Bearer <UPSTREAM_PROXY_API_KEY>. Timeout 300 detik.
// Body diteruskan apa adanya; transform model dilakukan di layer route.

import { UPSTREAM_TIMEOUT_MS } from "@claudprox/shared";

/** Error khusus saat request upstream melebihi batas waktu (-> 504). */
export class UpstreamTimeoutError extends Error {
  constructor(message = "Permintaan ke upstream melebihi batas waktu") {
    super(message);
    this.name = "UpstreamTimeoutError";
  }
}

/** Error umum saat upstream membalas non-2xx atau gagal koneksi (-> 502). */
export class UpstreamError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "UpstreamError";
    this.status = status;
  }
}

interface UpstreamConfig {
  baseUrl: string;
  apiKey: string;
}

function loadConfig(): UpstreamConfig {
  const baseUrl = process.env.UPSTREAM_PROXY_BASE_URL;
  const apiKey = process.env.UPSTREAM_PROXY_API_KEY;
  if (baseUrl === undefined || baseUrl === "") {
    throw new Error("UPSTREAM_PROXY_BASE_URL belum diset");
  }
  if (apiKey === undefined || apiKey === "") {
    throw new Error("UPSTREAM_PROXY_API_KEY belum diset");
  }
  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}

async function upstreamFetch(path: string, init: RequestInit): Promise<Response> {
  const config = loadConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    return await fetch(`${config.baseUrl}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        ...init.headers,
        Authorization: `Bearer ${config.apiKey}`,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new UpstreamTimeoutError();
    }
    const message = error instanceof Error ? error.message : "Gagal menghubungi upstream";
    throw new UpstreamError(message, 502);
  } finally {
    clearTimeout(timeout);
  }
}

/** Ambil daftar model mentah dari upstream GET /v1/models. */
export async function fetchModels(): Promise<unknown> {
  const response = await upstreamFetch("/v1/models", { method: "GET" });
  if (!response.ok) {
    throw new UpstreamError(`Upstream membalas ${response.status} pada /v1/models`, 502);
  }
  return response.json();
}

/**
 * Teruskan permintaan chat OpenAI-compatible ke upstream.
 * @returns Response mentah (caller memutuskan parse JSON atau pipe stream).
 */
export async function forwardChat(body: unknown, stream: boolean): Promise<Response> {
  return forwardJson("/v1/chat/completions", body, stream);
}

/**
 * Teruskan permintaan Anthropic-style messages ke upstream.
 * @returns Response mentah (caller memutuskan parse JSON atau pipe stream).
 */
export async function forwardMessages(body: unknown, stream: boolean): Promise<Response> {
  return forwardJson("/v1/messages", body, stream);
}

async function forwardJson(path: string, body: unknown, stream: boolean): Promise<Response> {
  const response = await upstreamFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  // Untuk non-stream, tetap kembalikan response apa pun statusnya supaya
  // caller bisa membaca body error. Untuk stream, pastikan ada body.
  if (stream && response.body === null) {
    throw new UpstreamError(`Upstream tidak mengirim body stream pada ${path}`, 502);
  }
  return response;
}
