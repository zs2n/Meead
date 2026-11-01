import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type OfficeStatus = "pending" | "approved" | "rejected" | "suspended";

export type MyOffice = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  address: string | null;
  status: OfficeStatus;
  rejection_reason: string | null;
  city_slug: string;
  private: {
    phone: string | null;
    whatsapp: string | null;
    email: string | null;
    license_number: string | null;
    license_doc_path: string | null;
  } | null;
  specialty_slugs: string[];
  hours: { weekday: number; opens_at: string | null; closes_at: string | null; is_closed: boolean }[];
};

/** مكتب المستخدم الحالي (RLS يضمن أنه لا يرى إلا مكتبه) */
export const getMyOffice = cache(async (userId: string): Promise<MyOffice | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("offices")
    .select(
      `id, slug, name, description, address, status, rejection_reason,
       city:cities(slug),
       office_private(phone, whatsapp, email, license_number, license_doc_path),
       office_specialties(specialty:specialties(slug)),
       office_hours(weekday, opens_at, closes_at, is_closed)`,
    )
    .eq("owner_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  type Row = {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    address: string | null;
    status: string;
    rejection_reason: string | null;
    city: { slug: string } | null;
    office_private: MyOffice["private"];
    office_specialties: { specialty: { slug: string } | null }[];
    office_hours: MyOffice["hours"];
  };
  const row = data as unknown as Row;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    address: row.address,
    status: row.status as OfficeStatus,
    rejection_reason: row.rejection_reason,
    city_slug: row.city?.slug ?? "",
    private: row.office_private,
    specialty_slugs: row.office_specialties.map((s) => s.specialty?.slug).filter((s): s is string => !!s),
    hours: row.office_hours,
  };
});

export type ContactEventRow = { id: string; method: "whatsapp" | "call" | "email"; created_at: string; user_id: string | null };

export async function getMyContactEvents(officeId: string, limit = 200): Promise<ContactEventRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_events")
    .select("id, method, created_at, user_id")
    .eq("office_id", officeId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as ContactEventRow[];
}

export async function countContactsSince(officeId: string, days: number): Promise<number> {
  const supabase = await createClient();
  const since = new Date(Date.now() - days * 86400_000).toISOString();
  const { count, error } = await supabase
    .from("contact_events")
    .select("id", { count: "exact", head: true })
    .eq("office_id", officeId)
    .gte("created_at", since);
  if (error) throw error;
  return count ?? 0;
}

export type ReviewRow = {
  id: string;
  reviewer_name: string | null;
  rating: number;
  comment: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export async function getMyReviews(officeId: string): Promise<ReviewRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, reviewer_name, rating, comment, status, created_at")
    .eq("office_id", officeId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as ReviewRow[];
}

export const STATUS_LABEL: Record<OfficeStatus, { text: string; className: string }> = {
  pending: { text: "قيد المراجعة", className: "bg-amber-100 text-amber-800" },
  approved: { text: "معتمد ومنشور", className: "bg-green-100 text-green-800" },
  rejected: { text: "مرفوض", className: "bg-red-100 text-red-800" },
  suspended: { text: "موقوف", className: "bg-line text-muted" },
};

export const REVIEW_STATUS_LABEL: Record<ReviewRow["status"], { text: string; className: string }> = {
  pending: { text: "بانتظار المراجعة", className: "bg-amber-100 text-amber-800" },
  approved: { text: "منشور", className: "bg-green-100 text-green-800" },
  rejected: { text: "مرفوض", className: "bg-red-100 text-red-800" },
};

export const METHOD_LABEL = { whatsapp: "واتساب", call: "اتصال", email: "بريد إلكتروني" } as const;
