"use client";

import { useActionState, useState } from "react";
import { FormMessage, SubmitButton, inputClass } from "@/components/form";
import { deleteOffice } from "../../actions";

/** حذف نهائي بخطوتين: فتح اللوحة ثم كتابة كلمة «حذف» */
export function DeletePanel({ officeId }: { officeId: string }) {
  const [state, action] = useActionState(deleteOffice, undefined);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-sm text-red-700 underline">
        حذف المكتب نهائياً
      </button>
    );
  }
  return (
    <form action={action} className="space-y-2 rounded-xl border border-red-200 bg-red-50 p-3">
      <input type="hidden" name="officeId" value={officeId} />
      <label className="block text-sm text-red-900">
        سيُحذف المكتب وتقييماته وسجل تواصله نهائياً. اكتب «حذف» للتأكيد:
        <input name="confirm" required autoComplete="off" className={`${inputClass} mt-1`} />
      </label>
      <FormMessage error={state?.error} />
      <div className="flex gap-2">
        <SubmitButton pendingText="جارٍ الحذف…" className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60">
          حذف نهائي
        </SubmitButton>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-muted hover:bg-white">
          إلغاء
        </button>
      </div>
    </form>
  );
}
