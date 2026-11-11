import { requireAdmin } from "@/lib/auth";
import { getAdminCounts } from "@/lib/admin";
import { DashNav } from "../dashboard/dash-nav";
import { logout } from "../login/actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const counts = await getAdminCounts();
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-gold-700">لوحة الإدارة</p>
          <p className="font-semibold">{user.fullName ?? user.email}</p>
        </div>
        <form action={logout}>
          <button className="rounded-lg px-3 py-1.5 text-sm text-muted hover:bg-line/60 hover:text-ink">تسجيل الخروج</button>
        </form>
      </div>
      <DashNav
        items={[
          { href: "/admin", label: "طلبات المكاتب", badge: counts.pendingOffices },
          { href: "/admin/offices", label: "كل المكاتب" },
          { href: "/admin/reviews", label: "مراجعة التقييمات", badge: counts.pendingReviews },
          { href: "/admin/contacts", label: "سجل التواصل" },
          { href: "/admin/messages", label: "الرسائل والمشتركون", badge: counts.newMessages },
        ]}
      />
      <div className="mt-6">{children}</div>
    </div>
  );
}
