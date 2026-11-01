import type { Metadata } from "next";
import Link from "next/link";
import { METHOD_LABEL } from "@/lib/dashboard";
import { formatNumber } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "سجل التواصل" };

type Ev = { office_id: string; method: keyof typeof METHOD_LABEL; office: { name: string; slug: string } | null };

export default async function AdminContacts({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const { days: raw } = await searchParams;
  const days = [7, 30, 90].includes(Number(raw)) ? Number(raw) : 30;
  const since = new Date(Date.now() - days * 86400_000).toISOString();

  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_events")
    .select("office_id, method, office:offices(name, slug)")
    .gte("created_at", since)
    .limit(10000);
  const events = (data ?? []) as unknown as Ev[];

  const byOffice = new Map<string, { name: string; slug: string; total: number; whatsapp: number; call: number; email: number }>();
  for (const e of events) {
    const row = byOffice.get(e.office_id) ?? { name: e.office?.name ?? "—", slug: e.office?.slug ?? "", total: 0, whatsapp: 0, call: 0, email: 0 };
    row.total++;
    row[e.method]++;
    byOffice.set(e.office_id, row);
  }
  const rows = [...byOffice.values()].sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold">سجل التواصل</h1>
          <p className="text-sm text-muted">إجمالي {formatNumber(events.length)} تواصل خلال آخر {formatNumber(days)} يوماً — أساس نموذج الدفع لاحقاً.</p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <Link key={d} href={`/admin/contacts?days=${d}`} className={`rounded-full border px-3 py-1 text-sm ${d === days ? "border-navy-700 bg-navy-700 text-white" : "border-line bg-card text-muted"}`}>
              {formatNumber(d)} يوماً
            </Link>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-line bg-card">
        <table className="w-full min-w-[480px] text-sm">
          <thead className="bg-paper text-muted">
            <tr>
              <th className="px-4 py-2 text-start font-medium">المكتب</th>
              <th className="px-4 py-2 text-start font-medium">الإجمالي</th>
              <th className="px-4 py-2 text-start font-medium">واتساب</th>
              <th className="px-4 py-2 text-start font-medium">اتصال</th>
              <th className="px-4 py-2 text-start font-medium">بريد</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-muted">لا يوجد تواصل في هذه الفترة</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.slug}>
                <td className="px-4 py-2.5 font-medium">{r.name}</td>
                <td className="px-4 py-2.5 font-bold">{formatNumber(r.total)}</td>
                <td className="px-4 py-2.5">{formatNumber(r.whatsapp)}</td>
                <td className="px-4 py-2.5">{formatNumber(r.call)}</td>
                <td className="px-4 py-2.5">{formatNumber(r.email)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
