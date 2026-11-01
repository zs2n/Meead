"use client";

import { useActionState } from "react";
import { Field, FormMessage, SubmitButton, inputClass } from "@/components/form";
import { signup } from "../login/actions";

export function SignupForm() {
  const [state, action] = useActionState(signup, undefined);
  if (state?.success) return <FormMessage success={state.success} />;
  return (
    <form action={action} className="space-y-4">
      <Field label="اسم مسؤول الحساب">
        <input name="full_name" required autoComplete="name" className={inputClass} />
      </Field>
      <Field label="البريد الإلكتروني" hint="ستستخدمه لتسجيل الدخول واستلام إشعار الاعتماد">
        <input name="email" type="email" required autoComplete="email" dir="ltr" className={`${inputClass} text-start`} />
      </Field>
      <Field label="كلمة المرور" hint="٨ أحرف على الأقل">
        <input name="password" type="password" required minLength={8} autoComplete="new-password" dir="ltr" className={`${inputClass} text-start`} />
      </Field>
      <FormMessage error={state?.error} />
      <SubmitButton pendingText="جارٍ إنشاء الحساب…">التالي: بيانات المكتب</SubmitButton>
    </form>
  );
}
