"use client";

import { useActionState } from "react";
import { Field, FormMessage, SubmitButton, inputClass } from "@/components/form";
import { requestPasswordReset } from "../login/actions";

export function ForgotForm() {
  const [state, action] = useActionState(requestPasswordReset, undefined);
  if (state?.success) return <FormMessage success={state.success} />;
  return (
    <form action={action} className="space-y-4">
      <Field label="البريد الإلكتروني المسجّل">
        <input name="email" type="email" required autoComplete="email" dir="ltr" className={`${inputClass} text-start`} />
      </Field>
      <FormMessage error={state?.error} />
      <SubmitButton pendingText="جارٍ الإرسال…">أرسل رابط الاستعادة</SubmitButton>
    </form>
  );
}
