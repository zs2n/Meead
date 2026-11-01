"use client";

import { useActionState, useState } from "react";
import { Field, FormMessage, SubmitButton, inputClass } from "@/components/form";
import { WEEKDAYS } from "@/lib/format";
import type { MyOffice } from "@/lib/dashboard";
import { saveOffice } from "./actions";

type Option = { slug: string; name_ar: string };

const DEFAULT_HOURS = [0, 1, 2, 3, 4, 5, 6].map((d) => ({
  weekday: d,
  is_closed: d === 5 || d === 6,
  opens_at: "09:00",
  closes_at: "17:00",
}));

/** "+9665xxxxxxxx" → "05xxxxxxxx" لعرض مألوف في النموذج */
const localPhone = (p: string | null | undefined) => (p?.startsWith("+966") ? "0" + p.slice(4) : p ?? "");

export function OfficeForm({
  office,
  cities,
  caseTypes,
}: {
  office: MyOffice | null;
  cities: Option[];
  caseTypes: Option[];
}) {
  const [state, action] = useActionState(saveOffice, undefined);
  const errors = state && !state.ok ? state.fieldErrors ?? {} : {};
  const isNew = !office;

  const initialHours = DEFAULT_HOURS.map((d) => {
    const h = office?.hours.find((x) => x.weekday === d.weekday);
    return h
      ? { weekday: d.weekday, is_closed: h.is_closed, opens_at: h.opens_at?.slice(0, 5) ?? "09:00", closes_at: h.closes_at?.slice(0, 5) ?? "17:00" }
      : d;
  });
  const [closed, setClosed] = useState(initialHours.map((h) => h.is_closed));

  return (
    <form action={action} className="space-y-6" noValidate>
      <Section title="بيانات المكتب">
        <Field label="اسم المكتب" error={errors.name}>
          <input name="name" defaultValue={office?.name} required maxLength={120} className={inputClass} />
        </Field>
        <Field label="نبذة عن المكتب" hint="خبرة المكتب وما يميزه — تظهر للزوار" error={errors.description}>
          <textarea name="description" defaultValue={office?.description ?? ""} rows={5} maxLength={2000} className={inputClass} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="المدينة" error={errors.city}>
            <select name="city" defaultValue={office?.city_slug ?? cities[0]?.slug} className={inputClass}>
              {cities.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name_ar}
                </option>
              ))}
            </select>
          </Field>
          <Field label="العنوان (الحي والشارع)" error={errors.address}>
            <input name="address" defaultValue={office?.address ?? ""} maxLength={300} className={inputClass} />
          </Field>
        </div>
      </Section>

      <Section title="أنواع القضايا التي يتولاها المكتب" subtitle="ضمن الأحوال الشخصية">
        <div className="grid gap-2 sm:grid-cols-2">
          {caseTypes.map((t) => (
            <label key={t.slug} className="flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5 has-[:checked]:border-gold-500 has-[:checked]:bg-gold-100/40">
              <input
                type="checkbox"
                name="specialties"
                value={t.slug}
                defaultChecked={office?.specialty_slugs.includes(t.slug)}
                className="h-4 w-4 accent-[#b08d57]"
              />
              {t.name_ar}
            </label>
          ))}
        </div>
        {errors.specialties && <p className="text-xs text-red-700">{errors.specialties}</p>}
      </Section>

      <Section title="وسائل التواصل" subtitle="لا تظهر الأرقام للزوار؛ يصلون إليك عبر أزرار ميعاد ويُسجّل كل طلب في لوحتك">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="واتساب" error={errors.whatsapp}>
            <input name="whatsapp" defaultValue={localPhone(office?.private?.whatsapp)} inputMode="tel" dir="ltr" placeholder="05xxxxxxxx" className={`${inputClass} text-start`} />
          </Field>
          <Field label="الهاتف" error={errors.phone}>
            <input name="phone" defaultValue={localPhone(office?.private?.phone)} inputMode="tel" dir="ltr" placeholder="05xxxxxxxx" className={`${inputClass} text-start`} />
          </Field>
          <Field label="البريد الإلكتروني" error={errors.email}>
            <input name="email" type="email" defaultValue={office?.private?.email ?? ""} dir="ltr" className={`${inputClass} text-start`} />
          </Field>
        </div>
        {errors.contact && <p className="text-xs text-red-700">{errors.contact}</p>}
      </Section>

      <Section title="ساعات العمل">
        <div className="divide-y divide-line">
          {initialHours.map((h, i) => (
            <div key={h.weekday} className="flex flex-wrap items-center gap-3 py-2">
              <span className="w-20 font-medium">{WEEKDAYS[h.weekday]}</span>
              <label className="flex items-center gap-1.5 text-sm text-muted">
                <input
                  type="checkbox"
                  name={`h${h.weekday}_closed`}
                  defaultChecked={h.is_closed}
                  onChange={(e) => setClosed((c) => c.map((v, j) => (j === i ? e.target.checked : v)))}
                  className="h-4 w-4 accent-[#b08d57]"
                />
                مغلق
              </label>
              <div className={`flex items-center gap-2 ${closed[i] ? "opacity-40" : ""}`}>
                <input type="time" name={`h${h.weekday}_open`} defaultValue={h.opens_at} disabled={closed[i]} aria-label={`فتح ${WEEKDAYS[h.weekday]}`} className={`${inputClass} w-32 py-1.5`} />
                <span className="text-muted">إلى</span>
                <input type="time" name={`h${h.weekday}_close`} defaultValue={h.closes_at} disabled={closed[i]} aria-label={`إغلاق ${WEEKDAYS[h.weekday]}`} className={`${inputClass} w-32 py-1.5`} />
              </div>
            </div>
          ))}
        </div>
        {errors.hours && <p className="text-xs text-red-700">{errors.hours}</p>}
      </Section>

      <Section title="الترخيص" subtitle="للتحقق فقط — لا يظهر للزوار">
        {office?.status === "approved" && (
          <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            تنبيه: تغيير رقم الترخيص أو صورته يعيد المكتب للمراجعة ويخفيه من النتائج حتى يُعتمد مجدداً.
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="رقم ترخيص المحاماة" error={errors.license_number}>
            <input name="license_number" defaultValue={office?.private?.license_number ?? ""} required dir="ltr" className={`${inputClass} text-start`} />
          </Field>
          <Field
            label={office?.private?.license_doc_path ? "استبدال صورة الترخيص (اختياري)" : "صورة الترخيص"}
            hint={office?.private?.license_doc_path ? "تم رفع صورة سابقاً" : "PDF أو صورة، حتى ٥ ميجابايت"}
            error={errors.license_doc}
          >
            <input
              type="file"
              name="license_doc"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              className="block w-full text-sm file:me-3 file:rounded-lg file:border-0 file:bg-navy-50 file:px-3 file:py-2 file:font-medium file:text-navy-700"
            />
          </Field>
        </div>
      </Section>

      <div className="sticky bottom-0 -mx-4 space-y-3 border-t border-line bg-paper/95 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <FormMessage error={state && !state.ok ? state.message : null} success={state?.ok ? state.message : null} />
        <SubmitButton className="w-full rounded-xl bg-gold-500 px-6 py-3 font-semibold text-navy-900 transition hover:bg-gold-400 disabled:opacity-60 sm:w-auto" pendingText="جارٍ الحفظ…">
          {isNew ? "إرسال طلب التسجيل" : office.status === "rejected" ? "حفظ وإعادة التقديم" : "حفظ التعديلات"}
        </SubmitButton>
      </div>
    </form>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-line bg-card p-5 sm:p-6">
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}
