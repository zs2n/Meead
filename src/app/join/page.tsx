import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "تسجيل مكتب جديد" };

const steps = [
  "أنشئ حساباً لمكتبك",
  "أكمل بيانات المكتب: التخصصات، ساعات العمل، وسائل التواصل، ورقم الترخيص مع صورته",
  "نراجع الترخيص يدوياً ونعتمد المكتب",
  "يظهر مكتبك في نتائج البحث وتبدأ طلبات العملاء بالوصول",
];

export default async function JoinPage() {
  if (await getSessionUser()) redirect("/dashboard/office");

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 lg:grid-cols-2">
      <div>
        <p className="text-sm font-semibold text-gold-700">للمكاتب</p>
        <h1 className="mt-1 text-3xl font-bold leading-snug">سجّل مكتبك في ميعاد</h1>
        <p className="mt-3 text-muted">
          اظهر للباحثين عن محامٍ في الأحوال الشخصية في الدمام والخبر، واستقبل طلبات التواصل مباشرة على
          واتساب أو الهاتف أو البريد.
        </p>
        <ol className="mt-6 space-y-3">
          {steps.map((s, i) => (
            <li key={s} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-800 text-sm font-bold text-gold-400">
                {new Intl.NumberFormat("ar-SA").format(i + 1)}
              </span>
              <span className="pt-0.5">{s}</span>
            </li>
          ))}
        </ol>
        <p className="mt-6 rounded-xl bg-gold-100/60 p-3 text-sm text-gold-700">
          لا يُنشر أي مكتب قبل التحقق من ترخيصه. التسجيل مجاني في هذه المرحلة.
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-card p-6 shadow-sm sm:p-8">
        <h2 className="mb-4 text-lg font-bold">الخطوة الأولى: إنشاء الحساب</h2>
        <SignupForm />
        <p className="mt-4 text-center text-sm text-muted">
          لديك حساب؟{" "}
          <Link href="/login?next=/dashboard/office" className="font-semibold text-navy-600 underline">
            سجّل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}
