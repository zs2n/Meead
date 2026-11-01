"use server";

import { cookies } from "next/headers";
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
} from "@/lib/contact";

const ContactInput = z.object({
  officeId: z.string().uuid(),
  method: z.enum(["whatsapp", "call", "email"]),
});

export type ContactResult = { ok: true; url: string } | { ok: false; error: string };

/** نافذة منع التكرار: نقرات متتالية من نفس الزائر لا تُحتسب تواصلاً جديداً. */
const DEDUPE_WINDOW_MS = 2 * 60 * 1000;

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
