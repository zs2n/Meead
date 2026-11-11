"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">حدث خطأ غير متوقع</h1>
      <p className="mt-2 text-muted">نعتذر عن ذلك. حاول مرة أخرى، وإن استمرت المشكلة فتواصل معنا.</p>
      {error.digest && <p className="ltr-nums mt-2 text-xs text-muted">رمز الخطأ: {error.digest}</p>}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="rounded-xl bg-navy-700 px-5 py-2.5 font-semibold text-white hover:bg-navy-800">
          إعادة المحاولة
        </button>
        <Link href="/" className="rounded-xl border border-navy-700 px-5 py-2.5 font-semibold text-navy-700 hover:bg-navy-50">
          الصفحة الرئيسية
        </Link>
      </div>
    </div>
  );
}
