// Test route GET /v1/models: mock upstream, pastikan tak ada kr/ bocor
// dan model non-kr difilter keluar.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Fastify, { type FastifyInstance } from "fastify";

// Mock modul upstream sebelum import route.
vi.mock("../lib/upstream.js", () => ({
  fetchModels: vi.fn(),
}));

import { fetchModels } from "../lib/upstream.js";
import { registerModelsRoute } from "../routes/v1-models.js";

const fetchModelsMock = vi.mocked(fetchModels);

async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify();
  await registerModelsRoute(app);
  await app.ready();
  return app;
}

describe("GET /v1/models", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await buildApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it("memfilter hanya model kr/ yang ada di whitelist dan mengembalikan id versi user", async () => {
    // Upstream membalas campuran: model kr/ whitelist, model kr/ tak dikenal,
    // dan model non-kr/ (mis. gpt-4) yang harus disaring keluar.
    fetchModelsMock.mockResolvedValue({
      object: "list",
      data: [
        { id: "kr/claude-haiku-4.5", object: "model", owned_by: "anthropic" },
        { id: "kr/claude-opus-4.8", object: "model", owned_by: "anthropic" },
        { id: "kr/model-tak-dikenal", object: "model", owned_by: "x" },
        { id: "gpt-4", object: "model", owned_by: "openai" },
        { id: "gemini-pro", object: "model", owned_by: "google" },
      ],
    });

    const response = await app.inject({ method: "GET", url: "/v1/models" });
    expect(response.statusCode).toBe(200);

    const body = response.json() as {
      object: string;
      data: { id: string; object: string; owned_by: string }[];
    };

    expect(body.object).toBe("list");
    // Hanya 2 model whitelist yang lolos.
    expect(body.data).toHaveLength(2);

    const ids = body.data.map((m) => m.id);
    expect(ids).toContain("claude-haiku-4-5");
    expect(ids).toContain("claude-opus-4-8");
    // Model non-whitelist dan non-kr/ tidak muncul.
    expect(ids).not.toContain("gpt-4");
    expect(ids).not.toContain("gemini-pro");
  });

  it("tidak pernah membocorkan prefix kr/ di respons", async () => {
    fetchModelsMock.mockResolvedValue({
      object: "list",
      data: [
        { id: "kr/claude-haiku-4.5", object: "model", owned_by: "anthropic" },
        { id: "kr/glm-5-thinking", object: "model", owned_by: "z" },
      ],
    });

    const response = await app.inject({ method: "GET", url: "/v1/models" });
    const raw = response.body;

    // Tidak ada substring "kr/" di seluruh body respons.
    expect(raw).not.toContain("kr/");
    // owned_by selalu claudprox, bukan vendor upstream.
    const body = response.json() as { data: { owned_by: string }[] };
    for (const entry of body.data) {
      expect(entry.owned_by).toBe("claudprox");
    }
  });

  it("mengembalikan list kosong saat upstream tidak punya model whitelist", async () => {
    fetchModelsMock.mockResolvedValue({
      object: "list",
      data: [{ id: "gpt-4", object: "model", owned_by: "openai" }],
    });

    const response = await app.inject({ method: "GET", url: "/v1/models" });
    const body = response.json() as { object: string; data: unknown[] };
    expect(body.object).toBe("list");
    expect(body.data).toHaveLength(0);
  });

  it("menangani bentuk respons upstream yang tidak terduga tanpa crash", async () => {
    fetchModelsMock.mockResolvedValue({ tidak: "sesuai format" });

    const response = await app.inject({ method: "GET", url: "/v1/models" });
    expect(response.statusCode).toBe(200);
    const body = response.json() as { data: unknown[] };
    expect(body.data).toHaveLength(0);
  });
});
