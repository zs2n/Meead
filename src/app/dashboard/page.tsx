import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { countContactsSince, getMyOffice, getMyReviews } from "@/lib/dashboard";
import { formatNumber } from "@/lib/format";
import { StatusBanner } from "./status-banner";

export const metadata: Metadata = { title: "لوحة المكتب" };

export default async function DashboardHome() {
  const user = await requireUser();
  const office = await getMyOffice(user.id);

  if (!office) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-card p-10 text-center">
        <h1 className="text-xl font-bold">لم تقدّم طلب تسجيل مكتب بعد</h1>
        <p className="mt-2 text-muted">أكمل بيانات مكتبك وأرفق الترخيص لنراجعه ونعتمده.</p>
        <Link href="/dashboard/office" className="mt-6 inline-block rounded-xl bg-gold-500 px-6 py-3 font-semibold text-navy-900">
          أكمل طلب التسجيل
        </Link>
      </div>
    );
  }

  const [week, month, reviews] = await Promise.all([
    countContactsSince(office.id, 7),
    countContactsSince(office.id, 30),
    getMyReviews(office.id),
  ]);
  const approved = reviews.filter((r) => r.status === "approved");
  const avg = approved.length ? approved.reduce((s, r) => s + r.rating, 0) / approved.length : 0;
  const pendingReviews = reviews.filter((r) => r.status === "pending").length;

  const stats = [
    { label: "طلبات تواصل آخر ٧ أيام", value: formatNumber(week), href: "/dashboard/requests" },
    { label: "طلبات تواصل آخر ٣٠ يوماً", value: formatNumber(month), href: "/dashboard/requests" },
    { label: "متوسط التقييم", value: approved.length ? formatNumber(Math.round(avg * 10) / 10) : "—", href: "/dashboard/reviews" },
    { label: "تقييمات بانتظار المراجعة", value: formatNumber(pendingReviews), href: "/dashboard/reviews" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{office.name}</h1>
      <StatusBanner office={office} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-2xl border border-line bg-card p-4 transition hover:shadow-sm">
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="mt-1 text-sm text-muted">{s.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
