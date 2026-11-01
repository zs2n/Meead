"use client";

import { useActionState, useState } from "react";
import { FormMessage, SubmitButton, inputClass } from "@/components/form";
import type { OfficeStatus } from "@/lib/dashboard";
import { decideOffice } from "../../actions";

export function DecisionPanel({ officeId, status }: { officeId: string; status: OfficeStatus }) {
  const [state, action] = useActionState(decideOffice, undefined);
  const [rejecting, setRejecting] = useState(false);

  return (
    <div className="space-y-3">
      <FormMessage error={state?.error} />

      {(status === "pending" || status === "rejected") && !rejecting && (
        <div className="grid gap-2">
          <form action={action}>
            <input type="hidden" name="officeId" value={officeId} />
            <input type="hidden" name="decision" value="approve" />
            <SubmitButton className="w-full rounded-xl bg-green-700 px-4 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-60" pendingText="جارٍ الاعتماد…">
              ✓ تحققت من الترخيص — اعتماد ونشر
            </SubmitButton>
          </form>
          {status === "pending" && (
            <button type="button" onClick={() => setRejecting(true)} className="rounded-xl border border-red-300 px-4 py-2.5 font-semibold text-red-700 hover:bg-red-50">
              رفض الطلب
            </button>
          )}
        </div>
      )}

      {rejecting && (
        <form action={action} className="space-y-2">
          <input type="hidden" name="officeId" value={officeId} />
          <input type="hidden" name="decision" value="reject" />
          <label className="block text-sm font-medium">
            سبب الرفض (يظهر للمكتب)
            <textarea name="reason" required rows={3} maxLength={500} className={`${inputClass} mt-1`} placeholder="مثال: صورة الترخيص غير واضحة، أو الرقم لا يطابق السجلات" />
          </label>
          <div className="flex gap-2">
            <SubmitButton className="flex-1 rounded-xl bg-red-700 px-4 py-2.5 font-semibold text-white hover:bg-red-800 disabled:opacity-60">تأكيد الرفض</SubmitButton>
            <button type="button" onClick={() => setRejecting(false)} className="rounded-xl px-4 py-2.5 text-muted hover:bg-line/60">إلغاء</button>
          </div>
        </form>
      )}

      {status === "approved" && (
        <form action={action}>
          <input type="hidden" name="officeId" value={officeId} />
          <input type="hidden" name="decision" value="suspend" />
          <SubmitButton className="w-full rounded-xl border border-line px-4 py-2.5 font-semibold text-muted hover:bg-line/60 disabled:opacity-60">
            إيقاف المكتب وإخفاؤه
          </SubmitButton>
        </form>
      )}

      {status === "suspended" && (
        <form action={action}>
          <input type="hidden" name="officeId" value={officeId} />
          <input type="hidden" name="decision" value="reinstate" />
          <SubmitButton className="w-full rounded-xl bg-navy-700 px-4 py-2.5 font-semibold text-white hover:bg-navy-800 disabled:opacity-60">
            إعادة تفعيل المكتب
          </SubmitButton>
        </form>
      )}
    </div>
  );
}
