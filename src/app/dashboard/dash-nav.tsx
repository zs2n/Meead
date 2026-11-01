"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function DashNav({ items }: { items: { href: string; label: string; badge?: number }[] }) {
  const path = usePathname();
  return (
    <nav className="-mx-4 overflow-x-auto px-4">
      <ul className="flex min-w-max gap-1 border-b border-line">
        {items.map((it) => {
          const active = path === it.href;
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={`-mb-px flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium ${
                  active ? "border-gold-500 text-ink" : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {it.label}
                {!!it.badge && (
                  <span className="rounded-full bg-gold-500 px-1.5 text-xs text-navy-900">
                    {new Intl.NumberFormat("ar-SA").format(it.badge)}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
