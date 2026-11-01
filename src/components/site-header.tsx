import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { Logo } from "./logo";

export async function SiteHeader() {
  const user = await getSessionUser();
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-navy-800/95 text-white backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="ميعاد — الصفحة الرئيسية">
          <Logo />
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/search" className="hidden rounded-lg px-3 py-2 text-white/85 hover:bg-white/10 hover:text-white sm:block">
            تصفّح المكاتب
          </Link>
          {user ? (
            <>
              {user.role === "admin" && (
                <Link href="/admin" className="rounded-lg px-3 py-2 text-gold-100 hover:bg-white/10">
                  الإدارة
                </Link>
              )}
              <Link href="/dashboard" className="rounded-lg border border-gold-400/60 px-3 py-2 text-gold-100 hover:bg-gold-400/10">
                لوحة مكتبي
              </Link>
            </>
          ) : (
            <>
              <Link href="/join" className="rounded-lg px-3 py-2 text-white/85 hover:bg-white/10 hover:text-white">
                سجّل مكتبك
              </Link>
              <Link href="/login" className="rounded-lg border border-gold-400/60 px-3 py-2 text-gold-100 hover:bg-gold-400/10">
                دخول المكاتب
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
