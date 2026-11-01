"use client";

import { useActionState, useState } from "react";
import { Field, FormMessage, SubmitButton, inputClass } from "@/components/form";
import { submitReview } from "./actions";

const LABELS = ["", "سيئ", "مقبول", "جيد", "جيد جداً", "ممتاز"];

export function ReviewForm({ officeId, officeName }: { officeId: string; officeName: string }) {
  const [state, action] = useActionState(submitReview, undefined);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  // عند النجاح تُحدَّث الصفحة وتعرض رسالة الشكر من الخادم
  if (state?.ok) return null;

  const shown = hover || rating;
  return (
    <form action={action} className="space-y-4 rounded-2xl border border-gold-400/50 bg-gold-100/30 p-5">
      <div>
        <h3 className="font-bold">قيّم تجربتك مع {officeName}</h3>
        <p className="text-sm text-muted">تواصلت مع هذا المكتب عبر ميعاد، فرأيك يساعد غيرك على الاختيار.</p>
      </div>

      <fieldset>
        <legend className="mb-1 text-sm font-medium">تقييمك</legend>
        <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer" onMouseEnter={() => setHover(n)}>
              <input
                type="radio"
                name="rating"
                value={n}
                className="peer sr-only"
                onChange={() => setRating(n)}
                aria-label={`${n} من ٥ — ${LABELS[n]}`}
              />
              <svg width="34" height="34" viewBox="0 0 20 20" aria-hidden="true" className="rounded peer-focus-visible:outline-2 peer-focus-visible:outline-gold-500">
                <path
                  d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.8l-5.2 2.8 1-5.8L1.5 7.7l5.9-.9z"
                  fill={n <= shown ? "#b08d57" : "#e4e0d6"}
                />
              </svg>
            </label>
          ))}
          <span className="ms-2 text-sm text-muted">{LABELS[shown]}</span>
        </div>
      </fieldset>

      <Field label="اسمك (اختياري)" hint="اتركه فارغاً ليظهر التقييم باسم «عميل»">
        <input name="reviewer_name" maxLength={60} className={inputClass} />
      </Field>
      <Field label="تعليقك (اختياري)">
        <textarea name="comment" rows={3} maxLength={1000} className={inputClass} placeholder="كيف كان التعامل؟ هل كان الرد سريعاً وواضحاً؟" />
      </Field>
      <input type="hidden" name="officeId" value={officeId} />
      <FormMessage error={state && !state.ok ? state.error : null} />
      <SubmitButton className="rounded-xl bg-navy-700 px-6 py-2.5 font-semibold text-white hover:bg-navy-800 disabled:opacity-60">
        إرسال التقييم
      </SubmitButton>
      <p className="text-xs text-muted">يُراجع كل تقييم قبل نشره. الرجاء عدم ذكر بيانات شخصية أو تفاصيل القضية.</p>
    </form>
  );
}
