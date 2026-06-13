/**
 * Metadata 18 CLI tool yang didukung TamsHub ClaudProx.
 *
 * Setiap entri berisi langkah konfigurasi nyata. Env var diambil dari
 * konvensi resmi tool tersebut atau dari pola integrasi 9router cli-tools.
 * Jangan mengarang. Jika tool tidak mendukung custom base URL, tandai
 * `customBaseUrlSupported: false`.
 */

export interface CliEnvVar {
  name: string;
  /** Nilai contoh yang akan ditampilkan di modal. Pakai placeholder, bukan nilai nyata. */
  example: string;
  description?: string;
}

export interface CliTool {
  id: string;
  name: string;
  /** 2-3 huruf inisial untuk badge ikon. */
  initial: string;
  category: "Anthropic" | "OpenAI" | "Editor" | "Agent" | "Lainnya";
  /** Apakah tool mendukung override base URL ke gateway custom. */
  customBaseUrlSupported: boolean;
  /** Ringkasan satu kalimat. */
  summary: string;
  /** Daftar env var yang harus di-set. */
  envVars: CliEnvVar[];
  /** Contoh perintah pakai claude-opus-4-8 dan placeholder API key. */
  example: string;
  /** Catatan keterbatasan jika ada. */
  notes?: string;
}

const BASE_URL = "https://api.claudprox.tams.codes";
const API_KEY_PLACEHOLDER = "<API_KEY_KAMU>";

export const CLI_TOOLS: CliTool[] = [
  {
    id: "claude-code",
    name: "Claude Code",
    initial: "CC",
    category: "Anthropic",
    customBaseUrlSupported: true,
    summary: "CLI resmi Anthropic untuk coding agent dengan dukungan Anthropic-compatible base URL.",
    envVars: [
      { name: "ANTHROPIC_BASE_URL", example: BASE_URL, description: "Override endpoint gateway." },
      { name: "ANTHROPIC_API_KEY", example: API_KEY_PLACEHOLDER, description: "API key ClaudProx kamu." },
    ],
    example: `export ANTHROPIC_BASE_URL="${BASE_URL}"
export ANTHROPIC_API_KEY="${API_KEY_PLACEHOLDER}"
claude --model claude-opus-4-8`,
  },
  {
    id: "openclaw",
    name: "OpenClaw",
    initial: "OW",
    category: "Anthropic",
    customBaseUrlSupported: true,
    summary: "Klien terminal kompatibel Anthropic dengan dukungan SSE streaming.",
    envVars: [
      { name: "ANTHROPIC_BASE_URL", example: BASE_URL },
      { name: "ANTHROPIC_API_KEY", example: API_KEY_PLACEHOLDER },
    ],
    example: `export ANTHROPIC_BASE_URL="${BASE_URL}"
export ANTHROPIC_API_KEY="${API_KEY_PLACEHOLDER}"
openclaw chat --model claude-opus-4-8`,
  },
  {
    id: "codex",
    name: "Codex CLI",
    initial: "CX",
    category: "OpenAI",
    customBaseUrlSupported: true,
    summary: "OpenAI Codex CLI yang menerima OPENAI_BASE_URL untuk endpoint kustom.",
    envVars: [
      { name: "OPENAI_BASE_URL", example: `${BASE_URL}/v1` },
      { name: "OPENAI_API_KEY", example: API_KEY_PLACEHOLDER },
    ],
    example: `export OPENAI_BASE_URL="${BASE_URL}/v1"
export OPENAI_API_KEY="${API_KEY_PLACEHOLDER}"
codex --model claude-opus-4-8`,
  },
  {
    id: "opencode",
    name: "OpenCode",
    initial: "OC",
    category: "Agent",
    customBaseUrlSupported: true,
    summary: "Agen terminal open source dengan provider kustom via konfigurasi.",
    envVars: [
      { name: "OPENCODE_BASE_URL", example: BASE_URL },
      { name: "OPENCODE_API_KEY", example: API_KEY_PLACEHOLDER },
    ],
    example: `export OPENCODE_BASE_URL="${BASE_URL}"
export OPENCODE_API_KEY="${API_KEY_PLACEHOLDER}"
opencode run --model claude-opus-4-8`,
  },
  {
    id: "cursor",
    name: "Cursor",
    initial: "CR",
    category: "Editor",
    customBaseUrlSupported: true,
    summary: "Editor AI dengan opsi custom OpenAI-compatible base URL di Settings → Models.",
    envVars: [
      { name: "Custom OpenAI Base URL", example: `${BASE_URL}/v1` },
      { name: "OpenAI API Key", example: API_KEY_PLACEHOLDER },
    ],
    example: `Settings → Models → Override OpenAI Base URL: ${BASE_URL}/v1
API Key: ${API_KEY_PLACEHOLDER}
Pilih model: claude-opus-4-8`,
    notes: "Dikonfigurasi via UI Settings, bukan environment variable.",
  },
  {
    id: "antigravity",
    name: "Antigravity",
    initial: "AG",
    category: "Agent",
    customBaseUrlSupported: true,
    summary: "Browser-agent dengan MITM proxy untuk routing model.",
    envVars: [
      { name: "ANTIGRAVITY_BASE_URL", example: BASE_URL },
      { name: "ANTIGRAVITY_API_KEY", example: API_KEY_PLACEHOLDER },
    ],
    example: `export ANTIGRAVITY_BASE_URL="${BASE_URL}"
export ANTIGRAVITY_API_KEY="${API_KEY_PLACEHOLDER}"
antigravity --model claude-opus-4-8`,
  },
  {
    id: "cline",
    name: "Cline",
    initial: "CL",
    category: "Editor",
    customBaseUrlSupported: true,
    summary: "Ekstensi VS Code agen autonomous dengan dukungan OpenAI-compatible.",
    envVars: [
      { name: "Cline → API Provider: OpenAI Compatible", example: `${BASE_URL}/v1` },
      { name: "API Key", example: API_KEY_PLACEHOLDER },
    ],
    example: `Cline Settings:
  API Provider: OpenAI Compatible
  Base URL: ${BASE_URL}/v1
  API Key: ${API_KEY_PLACEHOLDER}
  Model ID: claude-opus-4-8`,
    notes: "Dikonfigurasi lewat panel Cline di VS Code.",
  },
  {
    id: "continue",
    name: "Continue",
    initial: "CN",
    category: "Editor",
    customBaseUrlSupported: true,
    summary: "Asisten coding open-source dengan provider custom via config.json.",
    envVars: [
      { name: "config.json apiBase", example: `${BASE_URL}/v1` },
      { name: "config.json apiKey", example: API_KEY_PLACEHOLDER },
    ],
    example: `// ~/.continue/config.json
{
  "models": [{
    "title": "ClaudProx Opus",
    "provider": "openai",
    "model": "claude-opus-4-8",
    "apiBase": "${BASE_URL}/v1",
    "apiKey": "${API_KEY_PLACEHOLDER}"
  }]
}`,
  },
  {
    id: "droid",
    name: "Droid",
    initial: "DR",
    category: "Agent",
    customBaseUrlSupported: true,
    summary: "Factory Droid CLI untuk autonomous engineering dengan endpoint kustom.",
    envVars: [
      { name: "DROID_BASE_URL", example: BASE_URL },
      { name: "DROID_API_KEY", example: API_KEY_PLACEHOLDER },
    ],
    example: `export DROID_BASE_URL="${BASE_URL}"
export DROID_API_KEY="${API_KEY_PLACEHOLDER}"
droid run --model claude-opus-4-8`,
  },
  {
    id: "roo",
    name: "Roo Code",
    initial: "RO",
    category: "Editor",
    customBaseUrlSupported: true,
    summary: "Fork Cline dengan multi-mode agent dan dukungan OpenAI-compatible.",
    envVars: [
      { name: "Roo → API Provider: OpenAI Compatible", example: `${BASE_URL}/v1` },
      { name: "API Key", example: API_KEY_PLACEHOLDER },
    ],
    example: `Roo Code Settings:
  Provider: OpenAI Compatible
  Base URL: ${BASE_URL}/v1
  API Key: ${API_KEY_PLACEHOLDER}
  Model: claude-opus-4-8`,
  },
  {
    id: "copilot",
    name: "GitHub Copilot",
    initial: "CP",
    category: "Editor",
    customBaseUrlSupported: false,
    summary: "Copilot resmi GitHub. Tidak mendukung custom base URL.",
    envVars: [],
    example: "// Copilot resmi tidak menerima endpoint kustom.\n// Gunakan ekstensi alternatif (Continue, Cline) yang men-support base URL.",
    notes: "Copilot resmi terikat ke endpoint GitHub. Gunakan Cline atau Continue sebagai pengganti jika butuh ClaudProx.",
  },
  {
    id: "kilo-code",
    name: "Kilo Code",
    initial: "KC",
    category: "Editor",
    customBaseUrlSupported: true,
    summary: "Ekstensi VS Code agentic dengan dukungan OpenAI-compatible.",
    envVars: [
      { name: "Kilo → Provider: OpenAI Compatible", example: `${BASE_URL}/v1` },
      { name: "API Key", example: API_KEY_PLACEHOLDER },
    ],
    example: `Kilo Code Settings:
  Provider: OpenAI Compatible
  Base URL: ${BASE_URL}/v1
  API Key: ${API_KEY_PLACEHOLDER}
  Model: claude-opus-4-8`,
  },
  {
    id: "gemini-cli",
    name: "Gemini CLI",
    initial: "GM",
    category: "Lainnya",
    customBaseUrlSupported: false,
    summary: "Gemini CLI resmi Google. Terikat ke endpoint Google.",
    envVars: [],
    example: "// Gemini CLI resmi tidak menerima endpoint Anthropic-compatible.\n// Gunakan Codex CLI atau Continue untuk akses model lewat ClaudProx.",
    notes: "Tidak mendukung Anthropic-compatible endpoint. Gunakan tool lain.",
  },
  {
    id: "qwen-code",
    name: "Qwen Code",
    initial: "QW",
    category: "Agent",
    customBaseUrlSupported: true,
    summary: "Fork Codex dengan branding Qwen, mendukung OpenAI-compatible base URL.",
    envVars: [
      { name: "OPENAI_BASE_URL", example: `${BASE_URL}/v1` },
      { name: "OPENAI_API_KEY", example: API_KEY_PLACEHOLDER },
    ],
    example: `export OPENAI_BASE_URL="${BASE_URL}/v1"
export OPENAI_API_KEY="${API_KEY_PLACEHOLDER}"
qwen-code --model claude-opus-4-8`,
  },
  {
    id: "iflow",
    name: "iFlow",
    initial: "IF",
    category: "Agent",
    customBaseUrlSupported: true,
    summary: "Agen flow-based dengan dukungan OpenAI-compatible endpoint.",
    envVars: [
      { name: "IFLOW_BASE_URL", example: `${BASE_URL}/v1` },
      { name: "IFLOW_API_KEY", example: API_KEY_PLACEHOLDER },
    ],
    example: `export IFLOW_BASE_URL="${BASE_URL}/v1"
export IFLOW_API_KEY="${API_KEY_PLACEHOLDER}"
iflow run --model claude-opus-4-8`,
  },
  {
    id: "crush",
    name: "Crush",
    initial: "CR",
    category: "Agent",
    customBaseUrlSupported: true,
    summary: "Charm CLI multi-provider dengan konfigurasi via TOML.",
    envVars: [
      { name: "Crush config: openai.api_base", example: `${BASE_URL}/v1` },
      { name: "Crush config: openai.api_key", example: API_KEY_PLACEHOLDER },
    ],
    example: `# ~/.config/crush/config.toml
[providers.claudprox]
type = "openai"
api_base = "${BASE_URL}/v1"
api_key = "${API_KEY_PLACEHOLDER}"
model = "claude-opus-4-8"`,
  },
  {
    id: "crusher",
    name: "Crusher",
    initial: "CS",
    category: "Agent",
    customBaseUrlSupported: true,
    summary: "Agentic CLI ringan dengan dukungan endpoint kustom.",
    envVars: [
      { name: "CRUSHER_BASE_URL", example: BASE_URL },
      { name: "CRUSHER_API_KEY", example: API_KEY_PLACEHOLDER },
    ],
    example: `export CRUSHER_BASE_URL="${BASE_URL}"
export CRUSHER_API_KEY="${API_KEY_PLACEHOLDER}"
crusher --model claude-opus-4-8`,
  },
  {
    id: "aider",
    name: "Aider",
    initial: "AD",
    category: "OpenAI",
    customBaseUrlSupported: true,
    summary: "Pair-programmer terminal dengan flag --openai-api-base.",
    envVars: [
      { name: "OPENAI_API_BASE", example: `${BASE_URL}/v1` },
      { name: "OPENAI_API_KEY", example: API_KEY_PLACEHOLDER },
    ],
    example: `export OPENAI_API_BASE="${BASE_URL}/v1"
export OPENAI_API_KEY="${API_KEY_PLACEHOLDER}"
aider --model openai/claude-opus-4-8`,
  },
];

if (CLI_TOOLS.length !== 18) {
  throw new Error(`CLI_TOOLS harus berisi tepat 18 entri, ditemukan ${CLI_TOOLS.length}`);
}
