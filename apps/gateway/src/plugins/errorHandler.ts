// Error handler terpusat untuk gateway.
// Memformat semua error menjadi {error:{type,message}} sesuai keputusan terkunci.
// Tidak pernah membocorkan UPSTREAM_PROXY_API_KEY atau detail internal sensitif.

import type { FastifyInstance, FastifyError, FastifyReply, FastifyRequest } from "fastify";
import type { ApiErrorType } from "@claudprox/shared";
import { UpstreamError, UpstreamTimeoutError } from "../lib/upstream.js";

interface MappedError {
  status: number;
  type: ApiErrorType;
  message: string;
}

/** Petakan error apa pun menjadi status + tipe + pesan yang aman dikirim ke klien. */
function mapError(error: unknown): MappedError {
  if (error instanceof UpstreamTimeoutError) {
    return {
      status: 504,
      type: "gateway_timeout",
      message: "Permintaan ke layanan model melebihi batas waktu",
    };
  }

  if (error instanceof UpstreamError) {
    return {
      status: 502,
      type: "upstream_error",
      message: "Layanan model sedang bermasalah",
    };
  }

  const fastifyError = error as FastifyError;
  // Error validasi skema bawaan Fastify / body parser.
  if (fastifyError.statusCode === 400 || fastifyError.validation !== undefined) {
    return {
      status: 400,
      type: "bad_request",
      message: "Permintaan tidak valid",
    };
  }

  if (typeof fastifyError.statusCode === "number" && fastifyError.statusCode < 500) {
    return {
      status: fastifyError.statusCode,
      type: "bad_request",
      message: fastifyError.message || "Permintaan tidak dapat diproses",
    };
  }

  return {
    status: 500,
    type: "internal_error",
    message: "Terjadi kesalahan internal",
  };
}

/** Pasang error handler global pada instance Fastify. */
export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    const mapped = mapError(error);

    // Log error di sisi server tanpa membocorkan secret. Pesan asli dicatat
    // untuk diagnosis, tetapi yang dikirim ke klien selalu versi aman.
    request.log.error(
      { err: error, method: request.method, url: request.url, status: mapped.status },
      "Permintaan gagal diproses",
    );

    void reply.code(mapped.status).send({
      error: { type: mapped.type, message: mapped.message },
    });
  });
}
