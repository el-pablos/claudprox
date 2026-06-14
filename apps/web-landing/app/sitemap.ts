import type { MetadataRoute } from "next";

const BASE_URL = process.env.APP_BASE_URL ?? "https://claudprox.tams.codes";

// Sitemap statis untuk halaman publik landing + docs. AEO/SEO crawlability.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const paths = [
    "",
    "/pricing",
    "/docs",
    "/docs/quick-start",
    "/docs/endpoints",
    "/docs/auth",
    "/docs/models",
    "/docs/sse-streaming",
    "/docs/error-codes",
  ];
  return paths.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
