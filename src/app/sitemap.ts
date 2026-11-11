import type { MetadataRoute } from "next";
import { getSpecialtyTree } from "@/lib/data";
import { absoluteUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const [tree, { data: offices }] = await Promise.all([
    getSpecialtyTree(),
    supabase.from("offices").select("slug, updated_at").eq("status", "approved").limit(5000),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/search"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/join"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/faq"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.4 },
    { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.2 },
  ];

  const casePages: MetadataRoute.Sitemap = tree.flatMap((root) => [
    { url: absoluteUrl(`/cases/${root.slug}`), changeFrequency: "daily" as const, priority: 0.8 },
    ...root.children.map((c) => ({
      url: absoluteUrl(`/cases/${c.slug}`),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ]);

  const officePages: MetadataRoute.Sitemap = (offices ?? []).map((o) => ({
    url: absoluteUrl(`/office/${o.slug}`),
    lastModified: o.updated_at,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...casePages, ...officePages];
}
