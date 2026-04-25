import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/app-env";

const baseUrl = getSiteUrl();

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: baseUrl,
      lastModified: new Date()
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date()
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date()
    }
  ];
}
