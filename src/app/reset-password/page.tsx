import type { Metadata } from "next";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = { title: "تعيين كلمة مرور جديدة", robots: { index: false } };

export default async function ResetPasswordPage() {
  const user = await getSessionUser();
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl border border-line bg-card p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold">تعيين كلمة مرور جديدة</h1>
        {user ? (
          <>
            <p className="mb-6 mt-1 text-sm text-muted">
              للحساب: <span className="ltr-nums">{user.email}</span>
            </p>
            <ResetForm />
          </>
        ) : (
          <>
            <p className="mt-2 text-muted">انتهت صلاحية الرابط أو أنه غير صحيح. اطلب رابطاً جديداً.</p>
            <Link href="/forgot-password" className="mt-5 inline-block rounded-xl bg-navy-700 px-5 py-2.5 font-semibold text-white hover:bg-navy-800">
              طلب رابط جديد
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
