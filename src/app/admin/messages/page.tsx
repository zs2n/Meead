import type { Metadata } from "next";
import { SubmitButton } from "@/components/form";
import { formatDate, formatNumber } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { setMessageHandled } from "../actions";

export const metadata: Metadata = { title: "الرسائل والمشتركون" };

const TOPIC: Record<string, string> = {
  general: "استفسار عام",
  office: "مكتب محاماة",
  complaint: "بلاغ",
  partnership: "شراكة",
};

type Message = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  topic: string;
  message: string;
  handled: boolean;
  created_at: string;
};

export default async function AdminMessages() {
  const supabase = await createClient();
  const [{ data: messages }, { data: subscribers, count }] = await Promise.all([
    supabase
      .from("contact_messages")
      .select("id, name, email, phone, topic, message, handled, created_at")
      .order("handled")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase.from("subscribers").select("email, created_at", { count: "exact" }).order("created_at", { ascending: false }).limit(500),
  ]);
  const rows = (messages ?? []) as Message[];

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-xl font-bold">رسائل «تواصل معنا»</h1>
        {rows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line bg-card p-8 text-center text-muted">لا توجد رسائل.</p>
        ) : (
          <ul className="space-y-3">
            {rows.map((m) => (
              <li key={m.id} className={`rounded-2xl border bg-card p-4 ${m.handled ? "border-line opacity-70" : "border-gold-400"}`}>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-semibold">{m.name}</span>
                  <a href={`mailto:${m.email}`} className="ltr-nums text-navy-600 underline">{m.email}</a>
                  {m.phone && <span className="ltr-nums text-muted">{m.phone}</span>}
                  <span className="rounded-full bg-navy-50 px-2 py-0.5 text-xs text-navy-700">{TOPIC[m.topic] ?? m.topic}</span>
                  <span className="text-xs text-muted">{formatDate(m.created_at)}</span>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm">{m.message}</p>
                <form action={setMessageHandled} className="mt-3">
                  <input type="hidden" name="messageId" value={m.id} />
                  <input type="hidden" name="handled" value={m.handled ? "false" : "true"} />
                  <SubmitButton pendingText="…" className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium hover:bg-paper disabled:opacity-60">
                    {m.handled ? "إعادة فتح" : "تمت المعالجة ✓"}
                  </SubmitButton>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">مشتركو التحديثات ({formatNumber(count ?? 0)})</h2>
        {(subscribers ?? []).length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line bg-card p-8 text-center text-muted">لا يوجد مشتركون بعد.</p>
        ) : (
          <>
            <p className="text-sm text-muted">انسخ القائمة لاستخدامها في أداة البريد عند إعلان مدينة أو تخصص جديد.</p>
            <textarea
              readOnly
              dir="ltr"
              rows={Math.min(10, (subscribers ?? []).length + 1)}
              aria-label="قائمة بريد المشتركين"
              className="w-full rounded-2xl border border-line bg-card p-4 text-start font-mono text-sm"
              defaultValue={(subscribers ?? []).map((s) => s.email).join("\n")}
            />
          </>
        )}
      </section>
    </div>
  );
}
