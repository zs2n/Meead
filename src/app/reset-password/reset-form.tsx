"use client";

import { useActionState } from "react";
import { Field, FormMessage, SubmitButton, inputClass } from "@/components/form";
import { updatePassword } from "../login/actions";

export function ResetForm() {
  const [state, action] = useActionState(updatePassword, undefined);
  return (
    <form action={action} className="space-y-4">
      <Field label="كلمة المرور الجديدة" hint="٨ أحرف على الأقل">
        <input name="password" type="password" required minLength={8} autoComplete="new-password" dir="ltr" className={`${inputClass} text-start`} />
      </Field>
      <Field label="أعد كتابة كلمة المرور">
        <input name="confirm" type="password" required minLength={8} autoComplete="new-password" dir="ltr" className={`${inputClass} text-start`} />
      </Field>
      <FormMessage error={state?.error} />
      <SubmitButton pendingText="جارٍ الحفظ…">حفظ كلمة المرور</SubmitButton>
    </form>
  );
}
