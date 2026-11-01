import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getCities, getSpecialtyTree } from "@/lib/data";
import { getMyOffice } from "@/lib/dashboard";
import { StatusBanner } from "../status-banner";
import { OfficeForm } from "./office-form";

export const metadata: Metadata = { title: "ملف المكتب" };

export default async function OfficeProfilePage() {
  const user = await requireUser("/dashboard/office");
  const [office, cities, tree] = await Promise.all([getMyOffice(user.id), getCities(), getSpecialtyTree()]);
  const caseTypes = tree.flatMap((t) => t.children);

  return (
    <div className="space-y-4">
      {office ? (
        <StatusBanner office={office} />
      ) : (
        <div className="rounded-2xl bg-navy-800 p-5 text-white">
          <h1 className="text-xl font-bold">طلب تسجيل مكتب جديد</h1>
          <p className="mt-1 text-sm text-white/80">
            أكمل جميع البيانات وأرفق صورة الترخيص. بعد الإرسال نراجع الطلب يدوياً، ويظهر مكتبك للزوار فور اعتماده.
          </p>
        </div>
      )}
      <OfficeForm
        office={office}
        cities={cities.map(({ slug, name_ar }) => ({ slug, name_ar }))}
        caseTypes={caseTypes.map(({ slug, name_ar }) => ({ slug, name_ar }))}
      />
    </div>
  );
}
