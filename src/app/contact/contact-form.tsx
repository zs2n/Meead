"use client";

import { useState, useTransition } from "react";
import { Field, FormMessage, inputClass } from "@/components/form";
import { trackEvent } from "@/lib/track";
import { sendContactMessage, type ContactFormState } from "./actions";

const TOPICS = [
  { value: "general", label: "استفسار عام" },
  { value: "office", label: "أنا مكتب محاماة وعندي استفسار" },
  { value: "complaint", label: "بلاغ عن مكتب أو تقييم" },
  { value: "partnership", label: "شراكة أو إعلام" },
];

export function ContactForm() {
  const [state, setState] = useState<ContactFormState>(undefined);
  const [pending, startTransition] = useTransition();
  const errors = state && !state.ok ? state.fieldErrors ?? {} : {};

  // إرسال يدوي حتى تبقى القيم المكتوبة عند ظهور خطأ
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await sendContactMessage(undefined, fd);
      setState(result);
      if (result?.ok) trackEvent("contact_form_sent", { topic: String(fd.get("topic")) });
    });
  }

  if (state?.ok) {
    return (
      <div role="status" className="rounded-2xl border border-green-200 bg-green-50 p-6 text-green-900">
        <p className="text-lg font-semibold">وصلتنا رسالتك، شكراً لك.</p>
        <p className="mt-1">سنرد عليك على بريدك الإلكتروني في أقرب وقت.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="الاسم" error={errors.name}>
          <input name="name" required autoComplete="name" maxLength={80} className={inputClass} aria-invalid={!!errors.name} />
        </Field>
        <Field label="البريد الإلكتروني" error={errors.email}>
          <input name="email" type="email" required autoComplete="email" dir="ltr" className={`${inputClass} text-start`} aria-invalid={!!errors.email} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="رقم الجوال (اختياري)" error={errors.phone}>
          <input name="phone" inputMode="tel" autoComplete="tel" dir="ltr" maxLength={20} placeholder="05xxxxxxxx" className={`${inputClass} text-start`} />
        </Field>
        <Field label="موضوع الرسالة">
          <select name="topic" defaultValue="general" className={inputClass}>
            {TOPICS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="رسالتك" error={errors.message} hint="لا تكتب تفاصيل قضيتك هنا: ميعاد لا يقدّم استشارات قانونية.">
        <textarea name="message" required rows={6} maxLength={2000} className={inputClass} aria-invalid={!!errors.message} />
      </Field>
      {/* مصيدة سبام: مخفية عن البشر */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <FormMessage error={state && !state.ok ? state.message : null} />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-gold-500 px-8 py-3 font-semibold text-navy-900 transition hover:bg-gold-400 disabled:opacity-60 sm:w-auto"
      >
        {pending ? "جارٍ الإرسال…" : "إرسال الرسالة"}
      </button>
    </form>
  );
}
