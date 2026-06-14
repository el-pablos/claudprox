import { NextResponse, type NextRequest } from "next/server";

// Endpoint penampung laporan pelanggaran CSP selama fase Report-Only.
// Sengaja minimal: batasi ukuran body, catat hanya field non-sensitif
// (directive + blocked-uri + dokumen), tidak pernah mencatat cookie,
// Authorization header, atau memantulkan payload mentah ke response.
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 8 * 1024;

interface CspReportBody {
  "csp-report"?: {
    "document-uri"?: string;
    "violated-directive"?: string;
    "effective-directive"?: string;
    "blocked-uri"?: string;
  };
}

function sanitize(value: unknown): string {
  if (typeof value !== "string") return "";
  // Buang karakter kontrol agar log tidak bisa di-inject baris palsu.
  return value.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 256);
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return new NextResponse(null, { status: 413 });
  }

  let parsed: CspReportBody | null = null;
  try {
    parsed = JSON.parse(raw) as CspReportBody;
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const report = parsed["csp-report"];
  if (report) {
    const directive = sanitize(report["violated-directive"] ?? report["effective-directive"]);
    const blocked = sanitize(report["blocked-uri"]);
    const doc = sanitize(report["document-uri"]);
    console.warn(`[csp-report] directive=${directive} blocked=${blocked} doc=${doc}`);
  }

  return new NextResponse(null, { status: 204 });
}
