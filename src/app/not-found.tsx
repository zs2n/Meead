import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">الصفحة غير موجودة</h1>
      <p className="mt-2 text-muted">ربما أُزيلت الصفحة أو أن الرابط غير صحيح.</p>
      <Link href="/" className="mt-6 inline-block rounded-xl bg-navy-700 px-5 py-2.5 font-semibold text-white">
        العودة للرئيسية
      </Link>
    </div>
  );
}
