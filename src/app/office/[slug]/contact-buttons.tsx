"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ContactMethods } from "@/lib/data";
import { trackEvent } from "@/lib/track";
import { startContact } from "./actions";

type Method = "whatsapp" | "call" | "email";

const BUTTONS: { method: Method; key: keyof ContactMethods; label: string; className: string; icon: React.ReactNode }[] = [
  {
    method: "whatsapp",
    key: "has_whatsapp",
    label: "واتساب",
    className: "bg-[#1f8f4e] text-white hover:bg-[#187a41]",
    icon: (
      <path d="M10 2a8 8 0 00-6.9 12l-1 3.8 3.9-1A8 8 0 1010 2zm4.3 11.2c-.2.5-1 1-1.5 1-.4.1-.9.1-1.4-.1a12 12 0 01-1.3-.5 9.6 9.6 0 01-3.6-3.2 4.2 4.2 0 01-.9-2.2c0-1 .5-1.5.7-1.8.2-.2.4-.2.6-.2h.4c.1 0 .3 0 .5.4l.7 1.6c0 .1.1.3 0 .4l-.3.5-.3.4c-.1.1-.2.2-.1.5.2.3.7 1.1 1.4 1.7.9.8 1.7 1.1 2 1.2.2.1.4.1.5 0l.7-.9c.2-.2.3-.2.5-.1l1.6.8c.2.1.4.2.4.3.1.1.1.6-.1 1.2z" fill="currentColor" />
    ),
  },
  {
    method: "call",
    key: "has_phone",
    label: "اتصال",
    className: "bg-navy-700 text-white hover:bg-navy-800",
    icon: (
      <path d="M6.6 2.5l1.6 3.4c.2.4.1.9-.2 1.2L6.6 8.4a10 10 0 005 5l1.3-1.4c.3-.3.8-.4 1.2-.2l3.4 1.6c.4.2.6.7.5 1.1l-.6 2.3c-.1.5-.6.8-1.1.8A15 15 0 012.4 4.1c0-.5.3-1 .8-1.1l2.3-.6c.4-.1.9.1 1.1.5z" fill="currentColor" />
    ),
  },
  {
    method: "email",
    key: "has_email",
    label: "بريد إلكتروني",
    className: "border border-navy-700 bg-white text-navy-700 hover:bg-navy-50",
    icon: (
      <path d="M3 5h14v10H3zM3 5l7 6 7-6" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
    ),
  },
];

export function ContactButtons({
  officeId,
  methods,
  variant = "stack",
}: {
  officeId: string;
  methods: ContactMethods;
  /** stack: أزرار كاملة العرض · bar: شريط مضغوط أسفل شاشة الجوال */
  variant?: "stack" | "bar";
}) {
  const [pending, startTransition] = useTransition();
  const [active, setActive] = useState<Method | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const available = BUTTONS.filter((b) => methods[b.key]);
  if (available.length === 0) {
    return variant === "bar" ? null : <p className="text-sm text-muted">لا تتوفر وسائل تواصل لهذا المكتب حالياً.</p>;
  }

  function contact(method: Method) {
    setError(null);
    setActive(method);
    startTransition(async () => {
      trackEvent("contact_click", { method, placement: variant });
      const res = await startContact({ officeId, method });
      if (!res.ok) {
        setError(res.error);
        setActive(null);
        return;
      }
      // تحديث الصفحة لإظهار نموذج التقييم، ثم فتح وسيلة التواصل
      router.refresh();
      window.location.href = res.url;
      setActive(null);
    });
  }

  return (
    <div className="space-y-2">
      <div className={variant === "bar" ? "flex gap-2" : "grid gap-2"}>
        {available.map((b) => (
          <button
            key={b.method}
            type="button"
            disabled={pending}
            onClick={() => contact(b.method)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 font-semibold transition disabled:opacity-60 ${b.className}`}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
              {b.icon}
            </svg>
            {active === b.method ? "جارٍ التحويل…" : variant === "bar" && b.method === "email" ? "بريد" : b.label}
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
