"use server";

import { z } from "zod";
import { escapeHtml, notifyAdmin } from "@/lib/notify";
import { TOO_MANY, allow } from "@/lib/rate-limit";
import { createServiceClient } from "@/lib/supabase/server";

export type ContactFormState =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string> }
  | undefined;

const TOPICS = ["general", "office", "complaint", "partnership"] as const;
const TOPIC_LABEL: Record<(typeof TOPICS)[number], string> = {
  general: "استفسار عام",
  office: "استفسار من مكتب محاماة",
  complaint: "بلاغ عن مكتب أو تقييم",
  partnership: "شراكة أو إعلام",
};

const Input = z.object({
  name: z.string().trim().min(2, "اكتب اسمك").max(80, "الاسم طويل جداً"),
  email: z.string().trim().email("أدخل بريداً إلكترونياً صحيحاً").max(200),
  phone: z.string().trim().max(20, "الرقم طويل جداً"),
  topic: z.enum(TOPICS),
  message: z.string().trim().min(10, "اكتب رسالتك (١٠ أحرف على الأقل)").max(2000, "الرسالة أطول من ٢٠٠٠ حرف"),
});

export async function sendContactMessage(_: ContactFormState, formData: FormData): Promise<ContactFormState> {
  // مصيدة الروبوتات: نتظاهر بالنجاح دون حفظ شيء
  if (formData.get("website")) return { ok: true };

  const parsed = Input.safeParse({
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    topic: formData.get("topic") ?? "general",
    message: formData.get("message") ?? "",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { ok: false, message: "راجع الحقول المظللة", fieldErrors };
  }
  if (!(await allow("contact_form", 3, 3600))) return { ok: false, message: TOO_MANY };

  const v = parsed.data;
  const { error } = await createServiceClient()
    .from("contact_messages")
    .insert({ name: v.name, email: v.email, phone: v.phone || null, topic: v.topic, message: v.message });
  if (error) {
    console.error("contact message insert failed", error);
    return { ok: false, message: "تعذّر إرسال رسالتك الآن. حاول مرة أخرى بعد قليل." };
  }

  await notifyAdmin(
    `رسالة جديدة في ميعاد: ${TOPIC_LABEL[v.topic]}`,
    `<p><strong>${escapeHtml(v.name)}</strong> (${escapeHtml(v.email)}${v.phone ? ` · ${escapeHtml(v.phone)}` : ""})</p>
     <p style="white-space:pre-line">${escapeHtml(v.message)}</p>`,
  );
  return { ok: true };
}
