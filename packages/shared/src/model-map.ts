/**
 * Tabel pemetaan model TamsHub ClaudProx.
 *
 * Sumber kebenaran: ENGINEERING.md (52 model kr/ whitelist).
 * - user-id  : nama model yang DIPAKAI client gateway (tanpa prefix kr/, titik diganti -)
 * - upstream-id : nama model yang DIKIRIM ke proxy.tams.codes (dengan prefix kr/ dan titik asli)
 *
 * Reversibilitas dijamin lewat tabel eksplisit, bukan regex. Beberapa model tidak
 * punya titik (glm-5-thinking, qwen3-coder-next-*, claude-sonnet-4) sehingga transform
 * balik `-` -> `.` lewat regex akan salah. Tabel ini menghindari ambiguitas itu.
 */
export const MODEL_MAP: Record<string, string> = {
  // auto
  "auto": "kr/auto",
  "auto-thinking": "kr/auto-thinking",

  // claude-opus-4.8
  "claude-opus-4-8": "kr/claude-opus-4.8",
  "claude-opus-4-8-thinking": "kr/claude-opus-4.8-thinking",
  "claude-opus-4-8-agentic": "kr/claude-opus-4.8-agentic",
  "claude-opus-4-8-thinking-agentic": "kr/claude-opus-4.8-thinking-agentic",

  // claude-opus-4.7
  "claude-opus-4-7": "kr/claude-opus-4.7",
  "claude-opus-4-7-thinking": "kr/claude-opus-4.7-thinking",
  "claude-opus-4-7-agentic": "kr/claude-opus-4.7-agentic",
  "claude-opus-4-7-thinking-agentic": "kr/claude-opus-4.7-thinking-agentic",

  // claude-opus-4.6
  "claude-opus-4-6": "kr/claude-opus-4.6",
  "claude-opus-4-6-thinking": "kr/claude-opus-4.6-thinking",
  "claude-opus-4-6-agentic": "kr/claude-opus-4.6-agentic",
  "claude-opus-4-6-thinking-agentic": "kr/claude-opus-4.6-thinking-agentic",

  // claude-sonnet-4.6
  "claude-sonnet-4-6": "kr/claude-sonnet-4.6",
  "claude-sonnet-4-6-thinking": "kr/claude-sonnet-4.6-thinking",
  "claude-sonnet-4-6-agentic": "kr/claude-sonnet-4.6-agentic",
  "claude-sonnet-4-6-thinking-agentic": "kr/claude-sonnet-4.6-thinking-agentic",

  // claude-opus-4.5
  "claude-opus-4-5": "kr/claude-opus-4.5",
  "claude-opus-4-5-thinking": "kr/claude-opus-4.5-thinking",
  "claude-opus-4-5-agentic": "kr/claude-opus-4.5-agentic",
  "claude-opus-4-5-thinking-agentic": "kr/claude-opus-4.5-thinking-agentic",

  // claude-sonnet-4.5
  "claude-sonnet-4-5": "kr/claude-sonnet-4.5",
  "claude-sonnet-4-5-thinking": "kr/claude-sonnet-4.5-thinking",
  "claude-sonnet-4-5-agentic": "kr/claude-sonnet-4.5-agentic",
  "claude-sonnet-4-5-thinking-agentic": "kr/claude-sonnet-4.5-thinking-agentic",

  // claude-sonnet-4 (tanpa titik)
  "claude-sonnet-4": "kr/claude-sonnet-4",
  "claude-sonnet-4-thinking": "kr/claude-sonnet-4-thinking",
  "claude-sonnet-4-agentic": "kr/claude-sonnet-4-agentic",
  "claude-sonnet-4-thinking-agentic": "kr/claude-sonnet-4-thinking-agentic",

  // claude-haiku-4.5
  "claude-haiku-4-5": "kr/claude-haiku-4.5",
  "claude-haiku-4-5-thinking": "kr/claude-haiku-4.5-thinking",
  "claude-haiku-4-5-agentic": "kr/claude-haiku-4.5-agentic",
  "claude-haiku-4-5-thinking-agentic": "kr/claude-haiku-4.5-thinking-agentic",

  // deepseek-3.2
  "deepseek-3-2": "kr/deepseek-3.2",
  "deepseek-3-2-thinking": "kr/deepseek-3.2-thinking",
  "deepseek-3-2-agentic": "kr/deepseek-3.2-agentic",
  "deepseek-3-2-thinking-agentic": "kr/deepseek-3.2-thinking-agentic",

  // minimax-m2.5
  "minimax-m2-5": "kr/minimax-m2.5",
  "minimax-m2-5-thinking": "kr/minimax-m2.5-thinking",
  "minimax-m2-5-agentic": "kr/minimax-m2.5-agentic",
  "minimax-m2-5-thinking-agentic": "kr/minimax-m2.5-thinking-agentic",

  // minimax-m2.1
  "minimax-m2-1": "kr/minimax-m2.1",
  "minimax-m2-1-thinking": "kr/minimax-m2.1-thinking",
  "minimax-m2-1-agentic": "kr/minimax-m2.1-agentic",
  "minimax-m2-1-thinking-agentic": "kr/minimax-m2.1-thinking-agentic",

  // glm-5 (tanpa titik)
  "glm-5-thinking": "kr/glm-5-thinking",
  "glm-5-agentic": "kr/glm-5-agentic",
  "glm-5-thinking-agentic": "kr/glm-5-thinking-agentic",

  // qwen3-coder-next (tanpa titik)
  "qwen3-coder-next-thinking": "kr/qwen3-coder-next-thinking",
  "qwen3-coder-next-agentic": "kr/qwen3-coder-next-agentic",
  "qwen3-coder-next-thinking-agentic": "kr/qwen3-coder-next-thinking-agentic",
};

/**
 * Pemetaan balik: upstream-id (kr/...) -> user-id.
 * Dibangun otomatis dari MODEL_MAP supaya tidak ada duplikasi sumber data.
 */
export const REVERSE_MODEL_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(MODEL_MAP).map(([userModel, upstreamModel]) => [upstreamModel, userModel]),
);

/**
 * Konversi nama model user menjadi nama model upstream.
 * @throws {Error} bila model tidak ada di whitelist.
 */
export function toUpstreamModel(userModel: string): string {
  const upstream = MODEL_MAP[userModel];
  if (upstream === undefined) {
    throw new Error(`Model tidak dikenal: ${userModel}`);
  }
  return upstream;
}

/**
 * Konversi nama model upstream menjadi nama model user.
 * @returns user-id, atau null bila tidak dikenal.
 */
export function toUserModel(upstreamModel: string): string | null {
  const user = REVERSE_MODEL_MAP[upstreamModel];
  return user === undefined ? null : user;
}

/**
 * Daftar semua user-id model yang diekspos gateway.
 */
export function listUserModels(): string[] {
  return Object.keys(MODEL_MAP);
}
