import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { logout } from "../login/actions";
import { DashNav } from "./dash-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted">لوحة المكتب</p>
          <p className="font-semibold">{user.fullName ?? user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          {user.role === "admin" && (
            <Link href="/admin" className="rounded-lg bg-gold-100 px-3 py-1.5 text-sm font-medium text-gold-700">
              لوحة الإدارة
            </Link>
          )}
          <form action={logout}>
            <button className="rounded-lg px-3 py-1.5 text-sm text-muted hover:bg-line/60 hover:text-ink">تسجيل الخروج</button>
          </form>
        </div>
      </div>
      <DashNav
        items={[
          { href: "/dashboard", label: "نظرة عامة" },
          { href: "/dashboard/office", label: "ملف المكتب" },
          { href: "/dashboard/requests", label: "الطلبات الواردة" },
          { href: "/dashboard/reviews", label: "التقييمات" },
        ]}
      />
      <div className="mt-6">{children}</div>
    </div>
  );
}
