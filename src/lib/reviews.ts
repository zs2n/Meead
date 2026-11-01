import "server-only";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/server";
import { VISITOR_COOKIE, hashToken, reviewCookieName } from "@/lib/contact";

/**
 * هل يحق للزائر الحالي تقييم هذا المكتب؟
 * الشرط: يحمل رمز تقييم صادر عند تواصله مع المكتب نفسه عبر ميعاد، لم يُستخدم بعد،
 * ولم يسبق له (بنفس معرّف الزائر) تقييم هذا المكتب.
 */
export async function getReviewEligibility(
  officeId: string,
): Promise<{ eligible: false } | { eligible: true; contactEventId: string; visitorId: string | null }> {
  const cookieStore = await cookies();
  const token = cookieStore.get(reviewCookieName(officeId))?.value;
  if (!token) return { eligible: false };

  const admin = createServiceClient();
  const { data: event } = await admin
    .from("contact_events")
    .select("id, visitor_id, reviews(id)")
    .eq("review_token_hash", hashToken(token))
    .eq("office_id", officeId)
    .maybeSingle();
  if (!event) return { eligible: false };
  // علاقة واحد-لواحد (contact_event_id فريد) قد تُعاد ككائن أو مصفوفة
  const linked = event.reviews as unknown;
  if (Array.isArray(linked) ? linked.length > 0 : !!linked) return { eligible: false };

  const visitorId = cookieStore.get(VISITOR_COOKIE)?.value ?? null;
  if (event.visitor_id) {
    const { count } = await admin
      .from("reviews")
      .select("id, contact_events!inner(visitor_id)", { count: "exact", head: true })
      .eq("office_id", officeId)
      .eq("contact_events.visitor_id", event.visitor_id);
    if ((count ?? 0) > 0) return { eligible: false };
  }

  return { eligible: true, contactEventId: event.id, visitorId };
}
