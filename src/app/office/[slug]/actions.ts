"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getReviewEligibility } from "@/lib/reviews";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  VISITOR_COOKIE,
  VISITOR_MAX_AGE,
  REVIEW_TOKEN_MAX_AGE,
  buildContactUrl,
  cookieBase,
  newReviewToken,
  newVisitorId,
  reviewCookieName,
  REVIEW_SENT_COOKIE,
} from "@/lib/contact";

const ContactInput = z.object({
  officeId: z.string().uuid(),
  method: z.enum(["whatsapp", "call", "email"]),
});

export type ContactResult = { ok: true; url: string } | { ok: false; error: string };

/** نافذة منع التكرار: تواصل الزائر نفسه مع المكتب نفسه بالوسيلة نفسها خلال نصف ساعة يُحتسب مرة واحدة. */
const DEDUPE_WINDOW_MS = 30 * 60 * 1000;

/**
 * يسجّل التواصل في قاعدة البيانات أولاً، ثم يعيد رابط التواصل.
 * لا يصل الزائر إلى رقم المكتب إلا عبر هذه الدالة، فلا يفلت أي تواصل من التسجيل.
 */
export async function startContact(input: unknown): Promise<ContactResult> {
  const parsed = ContactInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "طلب غير صالح" };
  const { officeId, method } = parsed.data;

  const admin = createServiceClient();
  const { data: office } = await admin
    .from("offices")
    .select("id, status, office_private(phone, whatsapp, email)")
    .eq("id", officeId)
    .eq("status", "approved")
    .maybeSingle();

  const priv = office?.office_private as
    | { phone: string | null; whatsapp: string | null; email: string | null }
    | null
    | undefined;
  const target =
    method === "whatsapp" ? priv?.whatsapp : method === "call" ? priv?.phone : priv?.email;
  if (!office || !target) return { ok: false, error: "وسيلة التواصل غير متاحة لهذا المكتب" };

  const cookieStore = await cookies();
  let visitorId = cookieStore.get(VISITOR_COOKIE)?.value;
  if (!visitorId || !z.string().uuid().safeParse(visitorId).success) {
    visitorId = newVisitorId();
    cookieStore.set(VISITOR_COOKIE, visitorId, { ...cookieBase, maxAge: VISITOR_MAX_AGE });
  }

  // المستخدم المسجّل (إن وُجد)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // منع احتساب النقرات المتكررة
  const since = new Date(Date.now() - DEDUPE_WINDOW_MS).toISOString();
  const { data: recent } = await admin
    .from("contact_events")
    .select("id")
    .eq("office_id", officeId)
    .eq("visitor_id", visitorId)
    .eq("method", method)
    .gte("created_at", since)
    .limit(1);

  if (!recent?.length) {
    const { token, hash } = newReviewToken();
    const { error } = await admin.from("contact_events").insert({
      office_id: officeId,
      method,
      visitor_id: visitorId,
      user_id: user?.id ?? null,
      review_token_hash: hash,
    });
    if (error) {
      console.error("contact_events insert failed", error);
      return { ok: false, error: "تعذّر إتمام الطلب، حاول مرة أخرى" };
    }
    cookieStore.set(reviewCookieName(officeId), token, {
      ...cookieBase,
      maxAge: REVIEW_TOKEN_MAX_AGE,
    });
  }

  return { ok: true, url: buildContactUrl(method, target) };
}

// ------------------------------------------------------------
// إرسال تقييم (لا يُنشر قبل مراجعة الإدارة)
// ------------------------------------------------------------

export type ReviewState = { ok: true } | { ok: false; error: string } | undefined;

const ReviewInput = z.object({
  officeId: z.string().uuid(),
  rating: z.coerce.number().int().min(1, "اختر عدد النجوم").max(5),
  reviewer_name: z.string().trim().max(60, "الاسم طويل جداً"),
  comment: z.string().trim().max(1000, "التعليق أطول من ١٠٠٠ حرف"),
});

export async function submitReview(_: ReviewState, formData: FormData): Promise<ReviewState> {
  const parsed = ReviewInput.safeParse({
    officeId: formData.get("officeId"),
    rating: formData.get("rating") ?? 0,
    reviewer_name: formData.get("reviewer_name") ?? "",
    comment: formData.get("comment") ?? "",
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const v = parsed.data;

  const eligibility = await getReviewEligibility(v.officeId);
  if (!eligibility.eligible) return { ok: false, error: "التقييم متاح فقط لمن تواصل مع المكتب عبر ميعاد" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await createServiceClient().from("reviews").insert({
    office_id: v.officeId,
    contact_event_id: eligibility.contactEventId,
    user_id: user?.id ?? null,
    reviewer_name: v.reviewer_name || null,
    rating: v.rating,
    comment: v.comment || null,
    status: "pending",
  });
  if (error) {
    if (error.code === "23505") return { ok: false, error: "سبق إرسال تقييم لهذا التواصل" };
    console.error("review insert failed", error);
    return { ok: false, error: "تعذّر إرسال التقييم، حاول مرة أخرى" };
  }

  const cookieStore = await cookies();
  cookieStore.delete(reviewCookieName(v.officeId));
  // رسالة شكر تظهر بعد تحديث الصفحة (لدقيقتين)
  cookieStore.set(REVIEW_SENT_COOKIE, v.officeId, { ...cookieBase, maxAge: 120 });
  revalidatePath("/admin/reviews");
  return { ok: true };
}
