"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export type NavLink = { href: string; label: string; highlight?: boolean };

export function MobileMenu({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // إغلاق القائمة عند الانتقال لصفحة أخرى أو ضغط Escape
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
        className="flex h-11 w-11 items-center justify-center rounded-xl text-white hover:bg-white/10"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="القائمة الرئيسية"
          className="absolute inset-x-0 top-16 border-t border-white/10 bg-navy-800 px-4 pb-4 pt-2 shadow-xl"
        >
          <ul className="space-y-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={pathname === l.href ? "page" : undefined}
                  className={
                    l.highlight
                      ? "mt-2 block rounded-xl bg-gold-500 px-4 py-3 text-center font-semibold text-navy-900"
                      : "block rounded-xl px-4 py-3 text-white/90 hover:bg-white/10 aria-[current=page]:bg-white/10 aria-[current=page]:text-white"
                  }
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
