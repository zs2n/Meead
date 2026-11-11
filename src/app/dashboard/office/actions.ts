"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { getMyOffice } from "@/lib/dashboard";
import { normalizeSaudiPhone } from "@/lib/phone";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { escapeHtml, notifyAdmin } from "@/lib/notify";
import { TOO_MANY, allow } from "@/lib/rate-limit";

export type OfficeFormState =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> }
  | undefined;

const MAX_FILE = 5 * 1024 * 1024;
const FILE_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const phoneField = z
  .string()
  .trim()
  .transform((v, ctx) => {
    if (!v) return null;
    const n = normalizeSaudiPhone(v);
    if (!n) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "رقم غير صحيح، مثال: 05xxxxxxxx" });
    return n;
  });

const OfficeInput = z
  .object({
    name: z.string().trim().min(2, "اسم المكتب مطلوب").max(120, "الاسم طويل جداً"),
    description: z.string().trim().max(2000, "الوصف أطول من ٢٠٠٠ حرف"),
    city: z.string().min(1, "اختر المدينة"),
    address: z.string().trim().max(300),
    specialties: z.array(z.string()).min(1, "اختر نوع قضية واحداً على الأقل"),
    phone: phoneField,
    whatsapp: phoneField,
    email: z
      .string()
      .trim()
      .transform((v) => v || null)
      .pipe(z.string().email("بريد غير صحيح").nullable()),
    license_number: z.string().trim().min(3, "رقم الترخيص مطلوب").max(50),
    hours: z.array(
      z
        .object({
          weekday: z.number().int().min(0).max(6),
          is_closed: z.boolean(),
          opens_at: z.string().nullable(),
          closes_at: z.string().nullable(),
        })
        .refine((h) => h.is_closed || (h.opens_at && h.closes_at && h.opens_at < h.closes_at), {
          message: "وقت الإغلاق يجب أن يكون بعد وقت الفتح",
        }),
    ),
  })
  .refine((v) => v.phone || v.whatsapp || v.email, {
    message: "أضف وسيلة تواصل واحدة على الأقل",
    path: ["contact"],
  });

function readHours(formData: FormData) {
  return [0, 1, 2, 3, 4, 5, 6].map((d) => {
    const is_closed = formData.get(`h${d}_closed`) === "on";
    return {
      weekday: d,
      is_closed,
      opens_at: is_closed ? null : String(formData.get(`h${d}_open`) || "") || null,
      closes_at: is_closed ? null : String(formData.get(`h${d}_close`) || "") || null,
    };
  });
}

const RPC_ERRORS: Record<string, string> = {
  specialty_required: "اختر نوع قضية واحداً على الأقل",
  invalid_city: "اختر مدينة صحيحة",
  office_suspended: "هذا المكتب موقوف، تواصل مع إدارة ميعاد",
};

export async function saveOffice(_: OfficeFormState, formData: FormData): Promise<OfficeFormState> {
  const user = await requireUser("/dashboard/office");
  if (!(await allow("office_save", 20, 3600))) return { ok: false, message: TOO_MANY };
  const existing = await getMyOffice(user.id);

  const parsed = OfficeInput.safeParse({
    name: formData.get("name") ?? "",
    description: formData.get("description") ?? "",
    city: formData.get("city") ?? "",
    address: formData.get("address") ?? "",
    specialties: formData.getAll("specialties").map(String),
    phone: formData.get("phone") ?? "",
    whatsapp: formData.get("whatsapp") ?? "",
    email: formData.get("email") ?? "",
    license_number: formData.get("license_number") ?? "",
    hours: readHours(formData),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { ok: false, message: "راجع الحقول المظللة", fieldErrors };
  }
  const v = parsed.data;

  // صورة الترخيص: إلزامية في الطلب الأول
  const file = formData.get("license_doc");
  let licenseDocPath: string | null = null;
  if (file instanceof File && file.size > 0) {
    const ext = FILE_TYPES[file.type];
    if (!ext) return { ok: false, message: "صيغة الملف غير مدعومة", fieldErrors: { license_doc: "PDF أو صورة فقط" } };
    if (file.size > MAX_FILE)
      return { ok: false, message: "الملف كبير", fieldErrors: { license_doc: "الحد الأقصى ٥ ميجابايت" } };
    licenseDocPath = `${user.id}/${randomUUID()}.${ext}`;
    const { error } = await createServiceClient()
      .storage.from("licenses")
      .upload(licenseDocPath, file, { contentType: file.type, upsert: false });
    if (error) {
      console.error("license upload failed", error);
      return { ok: false, message: "تعذّر رفع صورة الترخيص، حاول مرة أخرى" };
    }
  } else if (!existing?.private?.license_doc_path) {
    return { ok: false, message: "أرفق صورة الترخيص", fieldErrors: { license_doc: "صورة الترخيص مطلوبة للتحقق" } };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("save_my_office", {
    p: {
      name: v.name,
      description: v.description,
      city: v.city,
      address: v.address,
      specialties: v.specialties,
      phone: v.phone,
      whatsapp: v.whatsapp,
      email: v.email,
      license_number: v.license_number,
      license_doc_path: licenseDocPath,
      contact_name: user.fullName,
      hours: v.hours,
    },
  });
  if (error) {
    const known = Object.keys(RPC_ERRORS).find((k) => error.message.includes(k));
    if (!known) console.error("save_my_office failed", error);
    return { ok: false, message: known ? RPC_ERRORS[known] : "تعذّر حفظ البيانات، حاول مرة أخرى" };
  }

  revalidatePath("/dashboard", "layout");
  revalidatePath("/search");
  if (existing?.slug) revalidatePath(`/office/${existing.slug}`);

  if (!existing) {
    await notifyAdmin(
      "طلب تسجيل مكتب جديد في ميعاد",
      `<p>وصل طلب تسجيل مكتب جديد: <strong>${escapeHtml(v.name)}</strong>.</p><p>راجع الترخيص واعتمده من لوحة الإدارة.</p>`,
    );
  }

  if (!existing) return { ok: true, message: "تم إرسال طلبك بنجاح. سنراجع الترخيص ونبلغك عند اعتماد المكتب." };
  if (existing.status === "rejected") return { ok: true, message: "تم إعادة تقديم الطلب للمراجعة." };
  const licenseChanged =
    licenseDocPath !== null || v.license_number !== (existing.private?.license_number ?? "");
  if (existing.status === "approved" && licenseChanged)
    return { ok: true, message: "تم الحفظ. بما أن بيانات الترخيص تغيّرت، سيُعاد المكتب للمراجعة قبل ظهوره مجدداً." };
  return { ok: true, message: "تم حفظ التعديلات." };
}
