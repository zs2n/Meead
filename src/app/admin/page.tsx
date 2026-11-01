import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { OfficeTable, type AdminOfficeRow } from "./office-table";

export const metadata: Metadata = { title: "طلبات المكاتب" };

export default async function AdminHome() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("offices")
    .select("id, name, status, created_at, updated_at, city:cities(name_ar)")
    .eq("status", "pending")
    .order("updated_at", { ascending: true });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">طلبات بانتظار الاعتماد</h1>
        <p className="text-sm text-muted">
          تحقّق من رقم الترخيص وصورته يدوياً قبل الاعتماد. يشمل ذلك الطلبات الجديدة والمكاتب التي غيّرت بيانات ترخيصها.
        </p>
      </div>
      <OfficeTable rows={(data ?? []) as unknown as AdminOfficeRow[]} empty="لا توجد طلبات بانتظار المراجعة 🎉" />
    </div>
  );
}
