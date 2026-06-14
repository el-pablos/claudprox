import type { MetadataRoute } from "next";

const BASE_URL = process.env.APP_BASE_URL ?? "https://claudprox.tams.codes";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Halaman dashboard/admin di subdomain terpisah dan tidak untuk diindeks.
        disallow: ["/api/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
