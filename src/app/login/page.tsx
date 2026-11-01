import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser, safeNext } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "دخول المكاتب" };

type Props = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const target = safeNext(next);
  if (await getSessionUser()) redirect(target);

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl border border-line bg-card p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold">دخول المكاتب</h1>
        <p className="mt-1 mb-6 text-sm text-muted">لإدارة ملف مكتبك ومتابعة الطلبات والتقييمات.</p>
        <LoginForm next={target} />
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        مكتبك غير مسجّل في ميعاد؟{" "}
        <Link href="/join" className="font-semibold text-navy-600 underline">
          سجّل مكتبك الآن
        </Link>
      </p>
    </div>
  );
}
