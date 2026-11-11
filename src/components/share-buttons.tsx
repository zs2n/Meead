"use client";

import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/track";

/** أزرار مشاركة الصفحة: واتساب، إكس، نسخ الرابط، ومشاركة النظام على الجوال */
export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  // يُحدَّد بعد التحميل لتفادي اختلاف ما يرسمه الخادم عن المتصفح
  const [canNative, setCanNative] = useState(false);
  useEffect(() => setCanNative(typeof navigator.share === "function"), []);
  const text = `${title} — على ميعاد`;
  const enc = encodeURIComponent;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      trackEvent("share", { channel: "copy" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // المتصفح منع النسخ: لا شيء
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, text, url });
      trackEvent("share", { channel: "native" });
    } catch {
      // أُلغيت المشاركة
    }
  }

  const btn = "flex h-10 items-center gap-1.5 rounded-xl border border-line bg-card px-3 text-sm font-medium text-ink hover:border-navy-600";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted">شارك:</span>
      <a
        href={`https://wa.me/?text=${enc(`${text}\n${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent("share", { channel: "whatsapp" })}
        className={btn}
      >
        واتساب
      </a>
      <a
        href={`https://x.com/intent/post?text=${enc(text)}&url=${enc(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent("share", { channel: "x" })}
        className={btn}
      >
        إكس
      </a>
      <button type="button" onClick={copy} className={btn} aria-live="polite">
        {copied ? "تم النسخ ✓" : "نسخ الرابط"}
      </button>
      {canNative && (
        <button type="button" onClick={nativeShare} className={`${btn} sm:hidden`}>
          المزيد
        </button>
      )}
    </div>
  );
}
