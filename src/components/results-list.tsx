"use client";

import Link from "next/link";
import { useState } from "react";
import type { OfficeListing } from "@/lib/data";
import { formatNumber } from "@/lib/format";
import { trackEvent } from "@/lib/track";
import { OfficeCard } from "./office-card";

const MAX = 3;

/** قائمة النتائج مع اختيار مكاتب للمقارنة (حتى ٣) */
export function ResultsList({ offices }: { offices: OfficeListing[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const canCompare = offices.length >= 2;

  function toggle(slug: string) {
    setSelected((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= MAX) return prev;
      return [...prev, slug];
    });
  }

  return (
    <>
      <h2 className="sr-only">قائمة المكاتب</h2>
      <ul className={`space-y-3 ${selected.length >= 2 ? "pb-24" : ""}`}>
        {offices.map((o) => {
          const checked = selected.includes(o.slug);
          const disabled = !checked && selected.length >= MAX;
          return (
            <li key={o.id}>
              <OfficeCard
                office={o}
                action={
                  canCompare && (
                    <label
                      className={`flex items-center gap-2 rounded-lg py-1 ${disabled ? "text-muted/60" : "cursor-pointer text-navy-700"}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => toggle(o.slug)}
                        className="h-5 w-5 accent-[#b08d57]"
                      />
                      أضف للمقارنة
                    </label>
                  )
                }
              />
            </li>
          );
        })}
      </ul>

      {selected.length >= 2 && (
        <div className="fixed inset-x-3 bottom-3 z-30 mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl bg-navy-800 p-3 text-white shadow-xl">
          <span className="text-sm">اخترت {formatNumber(selected.length)} مكاتب</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setSelected([])} className="rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10">
              إلغاء
            </button>
            <Link
              href={`/compare?o=${selected.join(",")}`}
              onClick={() => trackEvent("compare_open", { count: selected.length })}
              className="rounded-xl bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-gold-400"
            >
              قارن الآن
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
