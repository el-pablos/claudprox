// Route GET /v1/models.
// Mengambil daftar model upstream, lalu memfilter hanya model yang ada di
// whitelist (REVERSE_MODEL_MAP). ID dikembalikan dalam versi user (tanpa kr/)
// sehingga nama upstream "kr/..." tidak pernah bocor ke klien.

import type { FastifyInstance } from "fastify";
import { MODEL_OWNED_BY } from "@claudprox/shared";
import type { ModelListEntry } from "@claudprox/shared";
import { toUserModel } from "../lib/modelTransform.js";
import { fetchModels } from "../lib/upstream.js";

interface UpstreamModelEntry {
  id: string;
}

interface UpstreamModelList {
  data?: UpstreamModelEntry[];
}

/** Ambil array model dari respons upstream secara aman. */
function readUpstreamModels(raw: unknown): UpstreamModelEntry[] {
  if (typeof raw !== "object" || raw === null) {
    return [];
  }
  const data = (raw as UpstreamModelList).data;
  if (!Array.isArray(data)) {
    return [];
  }
  return data.filter(
    (entry): entry is UpstreamModelEntry =>
      typeof entry === "object" && entry !== null && typeof (entry as UpstreamModelEntry).id === "string",
  );
}

export async function registerModelsRoute(app: FastifyInstance): Promise<void> {
  app.get("/v1/models", async () => {
    const raw = await fetchModels();
    const upstreamModels = readUpstreamModels(raw);

    const data: ModelListEntry[] = [];
    for (const entry of upstreamModels) {
      // toUserModel mengembalikan null bila model upstream tidak ada di
      // whitelist; model semacam itu (termasuk non-kr/) ikut tersaring keluar.
      const userId = toUserModel(entry.id);
      if (userId === null) {
        continue;
      }
      data.push({ id: userId, object: "model", owned_by: MODEL_OWNED_BY });
    }

    return { object: "list", data };
  });
}
