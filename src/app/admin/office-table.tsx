import Link from "next/link";
import { STATUS_LABEL, type OfficeStatus } from "@/lib/dashboard";
import { formatDate } from "@/lib/format";

export type AdminOfficeRow = {
  id: string;
  name: string;
  status: OfficeStatus;
  created_at: string;
  updated_at: string;
  city: { name_ar: string } | null;
};

export function OfficeTable({ rows, empty }: { rows: AdminOfficeRow[]; empty: string }) {
  if (rows.length === 0)
    return <p className="rounded-2xl border border-dashed border-line bg-card p-8 text-center text-muted">{empty}</p>;
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
      {rows.map((o) => {
        const s = STATUS_LABEL[o.status];
        return (
          <li key={o.id}>
            <Link href={`/admin/offices/${o.id}`} className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-paper">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{o.name}</p>
                <p className="text-xs text-muted">
                  {o.city?.name_ar} · قُدّم {formatDate(o.created_at)} · آخر تحديث {formatDate(o.updated_at)}
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.className}`}>{s.text}</span>
              <span className="text-sm font-semibold text-navy-600">مراجعة ←</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
