"use client";

import { useActionState } from "react";
import { Field, FormMessage, SubmitButton, inputClass } from "@/components/form";
import { login } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(login, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <Field label="البريد الإلكتروني">
        <input name="email" type="email" required autoComplete="email" dir="ltr" className={`${inputClass} text-start`} />
      </Field>
      <Field label="كلمة المرور">
        <input name="password" type="password" required autoComplete="current-password" dir="ltr" className={`${inputClass} text-start`} />
      </Field>
      <FormMessage error={state?.error} />
      <SubmitButton pendingText="جارٍ الدخول…">دخول</SubmitButton>
    </form>
  );
}
