import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { Logo } from "./logo";
import { MobileMenu, type NavLink } from "./mobile-menu";

export async function SiteHeader() {
  const user = await getSessionUser();

  const main: NavLink[] = [
    { href: "/search", label: "ابحث عن مكتب" },
    { href: "/faq", label: "الأسئلة الشائعة" },
    { href: "/about", label: "من نحن" },
    { href: "/contact", label: "تواصل معنا" },
  ];
  const account: NavLink[] = user
    ? [
        ...(user.role === "admin" ? [{ href: "/admin", label: "الإدارة" }] : []),
        { href: "/dashboard", label: "لوحة مكتبي", highlight: true },
      ]
    : [
        { href: "/login", label: "دخول المكاتب" },
        { href: "/join", label: "سجّل مكتبك", highlight: true },
      ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-800/95 text-white backdrop-blur">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="ميعاد — الصفحة الرئيسية">
          <Logo />
        </Link>

        <nav aria-label="القائمة الرئيسية" className="hidden items-center gap-1 text-sm md:flex">
          {main.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-white/85 hover:bg-white/10 hover:text-white">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 text-sm md:flex">
          {account.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={
                l.highlight
                  ? "rounded-lg bg-gold-500 px-4 py-2 font-semibold text-navy-900 hover:bg-gold-400"
                  : "rounded-lg px-3 py-2 text-white/85 hover:bg-white/10 hover:text-white"
              }
            >
              {l.label}
            </Link>
          ))}
        </div>

        <MobileMenu links={[...main, ...account]} />
      </div>
    </header>
  );
}
