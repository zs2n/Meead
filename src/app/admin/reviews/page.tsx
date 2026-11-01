import type { Metadata } from "next";
import Link from "next/link";
import { Stars } from "@/components/stars";
import { SubmitButton } from "@/components/form";
import { METHOD_LABEL, REVIEW_STATUS_LABEL, type ReviewRow } from "@/lib/dashboard";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { moderateReview } from "../actions";

export const metadata: Metadata = { title: "مراجعة التقييمات" };

type Row = ReviewRow & {
  office: { name: string; slug: string } | null;
  contact: { method: keyof typeof METHOD_LABEL; created_at: string } | null;
};

const FILTERS = ["pending", "approved", "rejected"] as const;

export default async function AdminReviews({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status: raw } = await searchParams;
  const status = FILTERS.find((f) => f === raw) ?? "pending";

  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select(
      "id, reviewer_name, rating, comment, status, created_at, office:offices(name, slug), contact:contact_events(method, created_at)",
    )
    .eq("status", status)
    .order("created_at", { ascending: status === "pending" })
    .limit(100);
  const rows = (data ?? []) as unknown as Row[];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={`/admin/reviews?status=${f}`}
            className={`rounded-full border px-3 py-1 text-sm ${f === status ? "border-navy-700 bg-navy-700 text-white" : "border-line bg-card text-muted hover:text-ink"}`}
          >
            {REVIEW_STATUS_LABEL[f].text}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-card p-8 text-center text-muted">لا توجد تقييمات هنا.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className="rounded-2xl border border-line bg-card p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/office/${r.office?.slug}`} className="font-semibold hover:underline">{r.office?.name}</Link>
                <Stars value={r.rating} size={14} />
                <span className="text-xs text-muted">
                  · {r.reviewer_name || "بدون اسم"} · أُرسل {formatDate(r.created_at)}
                  {r.contact && ` · تواصل عبر ${METHOD_LABEL[r.contact.method]} في ${formatDate(r.contact.created_at)}`}
                </span>
              </div>
              {r.comment ? <p className="mt-2 text-sm">{r.comment}</p> : <p className="mt-2 text-sm text-muted">بدون تعليق</p>}

              <form action={moderateReview} className="mt-3 flex gap-2">
                <input type="hidden" name="reviewId" value={r.id} />
                {r.status !== "approved" && (
                  <SubmitButton name="decision" value="approved" pendingText="…" className="rounded-lg bg-green-700 px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60">
                    نشر
                  </SubmitButton>
                )}
                {r.status !== "rejected" && (
                  <SubmitButton name="decision" value="rejected" pendingText="…" className="rounded-lg border border-red-300 px-4 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60">
                    رفض
                  </SubmitButton>
                )}
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
