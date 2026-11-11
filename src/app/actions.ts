"use server";

import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { TOO_MANY, allow } from "@/lib/rate-limit";

export type SubscribeState = { ok: boolean; message: string } | undefined;

const Email = z.string().trim().toLowerCase().email().max(200);

/** الاشتراك في تحديثات ميعاد (مدن وتخصصات جديدة) */
export async function subscribe(_: SubscribeState, formData: FormData): Promise<SubscribeState> {
  // مصيدة للروبوتات: حقل مخفي لا يملؤه البشر
  if (formData.get("website")) return { ok: true, message: "تم الاشتراك. شكراً لك!" };

  const parsed = Email.safeParse(formData.get("email"));
  if (!parsed.success) return { ok: false, message: "أدخل بريداً إلكترونياً صحيحاً" };
  if (!(await allow("subscribe", 5, 3600))) return { ok: false, message: TOO_MANY };

  const { error } = await createServiceClient()
    .from("subscribers")
    .insert({ email: parsed.data, source: String(formData.get("source") || "footer").slice(0, 30) });
  // 23505 = مشترك مسبقاً: نعامله كنجاح حتى لا نكشف من هو مشترك
  if (error && error.code !== "23505") {
    console.error("subscribe failed", error);
    return { ok: false, message: "تعذّر الاشتراك الآن، حاول لاحقاً" };
  }
  return { ok: true, message: "تم الاشتراك. سنخبرك عند إضافة مدن وتخصصات جديدة." };
}
