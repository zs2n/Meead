import type { Metadata } from "next";
import Link from "next/link";
import { STATUS_LABEL, type OfficeStatus } from "@/lib/dashboard";
import { createClient } from "@/lib/supabase/server";
import { OfficeTable, type AdminOfficeRow } from "../office-table";

export const metadata: Metadata = { title: "كل المكاتب" };

const FILTERS: (OfficeStatus | "all")[] = ["all", "pending", "approved", "rejected", "suspended"];

export default async function AdminOffices({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status: raw } = await searchParams;
  const status = FILTERS.includes(raw as OfficeStatus) ? (raw as OfficeStatus | "all") : "all";

  const supabase = await createClient();
  let q = supabase
    .from("offices")
    .select("id, name, status, created_at, updated_at, city:cities(name_ar)")
    .order("updated_at", { ascending: false });
  if (status !== "all") q = q.eq("status", status);
  const { data } = await q;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "all" ? "/admin/offices" : `/admin/offices?status=${f}`}
            className={`rounded-full border px-3 py-1 text-sm ${f === status ? "border-navy-700 bg-navy-700 text-white" : "border-line bg-card text-muted hover:text-ink"}`}
          >
            {f === "all" ? "الكل" : STATUS_LABEL[f].text}
          </Link>
        ))}
      </div>
      <OfficeTable rows={(data ?? []) as unknown as AdminOfficeRow[]} empty="لا توجد مكاتب بهذه الحالة" />
    </div>
  );
}
