"use client";

import { useFormStatus } from "react-dom";

export const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-ink shadow-sm placeholder:text-muted/60 " +
  "focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-400/40 disabled:bg-paper";

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-muted">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-red-700">{error}</span>}
    </label>
  );
}

export function SubmitButton({
  children,
  pendingText = "جارٍ الإرسال…",
  className = "",
  name,
  value,
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      className={
        className ||
        "w-full rounded-xl bg-navy-700 px-6 py-3 font-semibold text-white transition hover:bg-navy-800 disabled:opacity-60"
      }
    >
      {pending ? pendingText : children}
    </button>
  );
}

export function FormMessage({ error, success }: { error?: string | null; success?: string | null }) {
  if (error)
    return (
      <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
        {error}
      </p>
    );
  if (success)
    return (
      <p role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-800">
        {success}
      </p>
    );
  return null;
}
