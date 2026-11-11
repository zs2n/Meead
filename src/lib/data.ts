import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type City = { id: number; slug: string; name_ar: string };
export type Specialty = { id: number; slug: string; name_ar: string; parent_id: number | null };
export type SpecialtyTree = Specialty & { children: Specialty[] };

export type OfficeListing = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  address: string | null;
  city_slug: string;
  city_name: string;
  specialty_slugs: string[];
  specialty_names: string[];
  rating_avg: number;
  rating_count: number;
  created_at: string;
};

export type OfficeHours = {
  weekday: number;
  opens_at: string | null;
  closes_at: string | null;
  is_closed: boolean;
};

export type PublicReview = {
  id: string;
  reviewer_name: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type ContactMethods = { has_whatsapp: boolean; has_phone: boolean; has_email: boolean };

const LISTING_COLUMNS =
  "id, slug, name, description, address, city_slug, city_name, specialty_slugs, specialty_names, rating_avg, rating_count, created_at";

export const getCities = cache(async (): Promise<City[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cities")
    .select("id, slug, name_ar")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return data;
});

export const getSpecialtyTree = cache(async (): Promise<SpecialtyTree[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("specialties")
    .select("id, slug, name_ar, parent_id")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  const roots = data.filter((s) => s.parent_id === null);
  return roots.map((r) => ({ ...r, children: data.filter((s) => s.parent_id === r.id) }));
});

export type SortKey = "rating" | "reviews" | "new";
export type SearchParams = { city?: string; specialty?: string; type?: string; sort?: string; limit?: number };

export const SORTS: { key: SortKey; label: string }[] = [
  { key: "rating", label: "الأعلى تقييماً" },
  { key: "reviews", label: "الأكثر تقييمات" },
  { key: "new", label: "الأحدث انضماماً" },
];

/** يحدد التخصص ونوع القضية من الرابط. نوع القضية يكفي لتحديد تخصصه. */
export function resolveSpecialty(tree: SpecialtyTree[], params: { specialty?: string; type?: string }) {
  const byType = params.type ? tree.find((r) => r.children.some((c) => c.slug === params.type)) : undefined;
  const root = byType ?? tree.find((s) => s.slug === params.specialty) ?? null;
  const type = root?.children.find((c) => c.slug === params.type) ?? null;
  return { root, type };
}

/**
 * يبحث في المكاتب المعتمدة فقط (RLS يضمن ذلك، ونضيف شرط الحالة صراحةً للوضوح).
 * التخصص الرئيسي يطابق أي نوع قضية تحته؛ نوع القضية يضيّق النتائج.
 * بدون تخصص: كل المكاتب.
 */
export async function searchOffices(params: SearchParams): Promise<OfficeListing[]> {
  const supabase = await createClient();
  const tree = await getSpecialtyTree();

  let query = supabase.from("office_listing").select(LISTING_COLUMNS).eq("status", "approved");

  if (params.city && params.city !== "all") query = query.eq("city_slug", params.city);

  const { root, type } = resolveSpecialty(tree, params);
  if (root) {
    const slugs = type ? [type.slug] : [root.slug, ...root.children.map((c) => c.slug)];
    query = query.overlaps("specialty_slugs", slugs);
  }

  if (params.sort === "new") {
    query = query.order("created_at", { ascending: false });
  } else if (params.sort === "reviews") {
    query = query.order("rating_count", { ascending: false }).order("rating_avg", { ascending: false });
  } else {
    query = query.order("rating_avg", { ascending: false }).order("rating_count", { ascending: false });
  }
  query = query.order("name");
  if (params.limit) query = query.limit(params.limit);

  const { data, error } = await query;
  if (error) throw error;
  return data as OfficeListing[];
}

/** أرقام حقيقية من قاعدة البيانات لعرضها كعناصر ثقة */
export const getSiteStats = cache(async () => {
  const supabase = await createClient();
  const [offices, reviews] = await Promise.all([
    supabase.from("offices").select("id", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "approved"),
  ]);
  return { offices: offices.count ?? 0, reviews: reviews.count ?? 0 };
});

export const getOfficeBySlug = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("office_listing")
    .select(LISTING_COLUMNS)
    .eq("slug", slug)
    .eq("status", "approved")
    .maybeSingle();
  if (error) throw error;
  return data as OfficeListing | null;
});

export async function getOfficeHours(officeId: string): Promise<OfficeHours[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("office_hours")
    .select("weekday, opens_at, closes_at, is_closed")
    .eq("office_id", officeId)
    .order("weekday");
  if (error) throw error;
  return data;
}

export async function getApprovedReviews(officeId: string): Promise<PublicReview[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, reviewer_name, rating, comment, created_at")
    .eq("office_id", officeId)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
}

export async function getContactMethods(officeId: string): Promise<ContactMethods> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("office_contact_methods", { p_office_id: officeId });
  if (error) throw error;
  return data?.[0] ?? { has_whatsapp: false, has_phone: false, has_email: false };
}

/** مكاتب معتمدة بعينها (لصفحة المقارنة) */
export async function getOfficesBySlugs(slugs: string[]): Promise<OfficeListing[]> {
  if (slugs.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("office_listing")
    .select(LISTING_COLUMNS)
    .eq("status", "approved")
    .in("slug", slugs);
  if (error) throw error;
  return data as OfficeListing[];
}
