"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type AdminState = { error?: string } | undefined;

const OfficeDecision = z.object({
  officeId: z.string().uuid(),
  decision: z.enum(["approve", "reject", "suspend", "reinstate"]),
  reason: z.string().trim().max(500).optional().default(""),
});

export async function decideOffice(_: AdminState, formData: FormData): Promise<AdminState> {
  const admin = await requireAdmin();
  const parsed = OfficeDecision.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "طلب غير صالح" };
  const { officeId, decision, reason } = parsed.data;

  const supabase = await createClient();
  const { data: office } = await supabase
    .from("offices")
    .select("id, slug, status, office_private(license_number, license_doc_path, phone, whatsapp, email)")
    .eq("id", officeId)
    .maybeSingle();
  if (!office) return { error: "المكتب غير موجود" };

  const priv = office.office_private as unknown as {
    license_number: string | null;
    license_doc_path: string | null;
    phone: string | null;
    whatsapp: string | null;
    email: string | null;
  } | null;

  if (decision === "approve" || decision === "reinstate") {
    if (!priv?.license_number || !priv.license_doc_path)
      return { error: "لا يمكن الاعتماد: رقم الترخيص أو صورته غير موجودة" };
    if (!priv.phone && !priv.whatsapp && !priv.email)
      return { error: "لا يمكن الاعتماد: لا توجد وسيلة تواصل" };
  }
  if (decision === "reject" && !reason) return { error: "اكتب سبب الرفض ليظهر للمكتب" };

  const status = { approve: "approved", reinstate: "approved", reject: "rejected", suspend: "suspended" }[decision];
  const { error } = await supabase
    .from("offices")
    .update({
      status,
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: decision === "reject" ? reason : null,
    })
    .eq("id", officeId);
  if (error) {
    console.error("decideOffice failed", error);
    return { error: "تعذّر حفظ القرار" };
  }

  revalidatePath("/admin", "layout");
  revalidatePath("/search");
  revalidatePath(`/office/${office.slug}`);
  redirect(`/admin/offices?status=${status}`);
}

const ReviewDecision = z.object({
  reviewId: z.string().uuid(),
  decision: z.enum(["approved", "rejected"]),
});

export async function moderateReview(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const parsed = ReviewDecision.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .update({ status: parsed.data.decision, moderated_by: admin.id, moderated_at: new Date().toISOString() })
    .eq("id", parsed.data.reviewId)
    .select("offices(slug)")
    .maybeSingle();
  if (error) console.error("moderateReview failed", error);

  revalidatePath("/admin", "layout");
  revalidatePath("/search");
  const slug = (data?.offices as unknown as { slug: string } | null)?.slug;
  if (slug) revalidatePath(`/office/${slug}`);
}
