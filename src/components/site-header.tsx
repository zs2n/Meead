import Link from "next/link";
import { Logo } from "./logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-navy-800/95 text-white backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2" aria-label="ميعاد — الصفحة الرئيسية">
          <Logo />
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/search" className="rounded-lg px-3 py-2 text-white/85 hover:bg-white/10 hover:text-white">
            تصفّح المكاتب
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-gold-400/60 px-3 py-2 text-gold-100 hover:bg-gold-400/10"
          >
            دخول المكاتب
          </Link>
        </nav>
      </div>
    </header>
  );
}
