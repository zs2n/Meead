import type { MyOffice } from "@/lib/dashboard";
import { STATUS_LABEL } from "@/lib/dashboard";
import Link from "next/link";

export function StatusBanner({ office }: { office: MyOffice }) {
  const s = STATUS_LABEL[office.status];
  const text = {
    pending: "طلبك قيد المراجعة. سنتحقق من الترخيص ونعتمد المكتب، ولن يظهر للزوار قبل ذلك.",
    approved: "مكتبك ظاهر في نتائج البحث.",
    rejected: "لم يُعتمد الطلب. عدّل البيانات المطلوبة ثم أعد التقديم من «ملف المكتب».",
    suspended: "المكتب موقوف حالياً ولا يظهر للزوار. تواصل مع إدارة ميعاد.",
  }[office.status];
  return (
    <div className="flex flex-wrap items-start gap-3 rounded-2xl border border-line bg-card p-4">
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.className}`}>{s.text}</span>
      <div className="flex-1 text-sm">
        <p>{text}</p>
        {office.status === "rejected" && office.rejection_reason && (
          <p className="mt-1 text-red-800">سبب الرفض: {office.rejection_reason}</p>
        )}
      </div>
      {office.status === "approved" && (
        <Link href={`/office/${office.slug}`} className="text-sm font-semibold text-navy-600 underline">
          عرض صفحتي العامة
        </Link>
      )}
    </div>
  );
}
