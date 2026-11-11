import type { Metadata } from "next";
import Link from "next/link";
import { ForgotForm } from "./forgot-form";

export const metadata: Metadata = { title: "استعادة كلمة المرور", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl border border-line bg-card p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold">نسيت كلمة المرور؟</h1>
        <p className="mb-6 mt-1 text-sm text-muted">اكتب بريد حساب مكتبك، ونرسل لك رابطاً لتعيين كلمة مرور جديدة.</p>
        <ForgotForm />
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        تذكّرتها؟{" "}
        <Link href="/login" className="font-semibold text-navy-600 underline">
          العودة لتسجيل الدخول
        </Link>
      </p>
    </div>
  );
}
