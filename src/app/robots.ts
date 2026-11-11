import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dashboard", "/auth/", "/reset-password", "/forgot-password", "/compare"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
