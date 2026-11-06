"use client";

import Link from "next/link";
import { useState } from "react";
import type { OfficeListing } from "@/lib/data";
import { OfficeCard } from "./office-card";

const MAX = 3;

/** قائمة النتائج مع اختيار مكاتب للمقارنة (حتى ٣) */
export function ResultsList({ offices }: { offices: OfficeListing[] }) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(slug: string) {
    setSelected((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= MAX) return prev;
      return [...prev, slug];
    });
  }

  return (
    <>
      <ul className="space-y-3">
        {offices.map((o) => {
          const checked = selected.includes(o.slug);
          const disabled = !checked && selected.length >= MAX;
          return (
            <li key={o.id} className="relative">
              <OfficeCard office={o} />
              <label
                className={`absolute start-5 top-5 flex items-center gap-1.5 rounded-lg bg-paper/90 px-2 py-1 text-xs font-medium sm:static sm:mt-2 sm:inline-flex ${
                  disabled ? "text-muted/50" : "cursor-pointer text-navy-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggle(o.slug)}
                  className="h-4 w-4 accent-[#b08d57]"
                />
                قارن
              </label>
            </li>
          );
        })}
      </ul>

      {selected.length >= 2 && (
        <div className="fixed inset-x-0 bottom-4 z-30 mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl bg-navy-800 p-3 text-white shadow-xl">
          <span className="text-sm">اخترت {selected.length} مكاتب للمقارنة</span>
          <Link
            href={`/compare?o=${selected.join(",")}`}
            className="rounded-xl bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-900"
          >
            قارن الآن
          </Link>
        </div>
      )}
    </>
  );
}
