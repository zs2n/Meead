"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { subscribe } from "@/app/actions";
import { trackEvent } from "@/lib/track";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 rounded-xl bg-gold-500 px-4 py-2.5 text-sm font-semibold text-navy-900 transition hover:bg-gold-400 disabled:opacity-60"
    >
      {pending ? "…" : "اشترك"}
    </button>
  );
}

export function NewsletterForm({ source = "footer" }: { source?: string }) {
  const [state, action] = useActionState(subscribe, undefined);
  useEffect(() => {
    if (state?.ok) trackEvent("newsletter_subscribe", { source });
  }, [state, source]);

  if (state?.ok) {
    return (
      <p role="status" className="rounded-xl bg-white/10 p-3 text-sm text-gold-100">
        {state.message}
      </p>
    );
  }
  return (
    <form action={action} className="space-y-2">
      <div className="flex gap-2">
        <label className="sr-only" htmlFor={`nl-${source}`}>
          بريدك الإلكتروني
        </label>
        <input
          id={`nl-${source}`}
          name="email"
          type="email"
          required
          dir="ltr"
          autoComplete="email"
          placeholder="name@example.com"
          className="min-w-0 flex-1 rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-start text-sm text-white placeholder:text-white/60 focus:border-gold-400 focus:outline-none"
        />
        {/* مصيدة سبام: مخفية عن البشر */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
        <input type="hidden" name="source" value={source} />
        <Submit />
      </div>
      {state && !state.ok && (
        <p role="alert" className="text-xs text-red-200">
          {state.message}
        </p>
      )}
    </form>
  );
}
