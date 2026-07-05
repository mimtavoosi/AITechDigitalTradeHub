import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aitech.local";

  return [
    "",
    "/domains",
    "/services",
    "/projects",
    "/investment",
    "/courses",
    "/companies"
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date()
  }));
}
