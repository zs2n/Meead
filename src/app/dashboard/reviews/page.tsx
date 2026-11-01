import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Stars } from "@/components/stars";
import { requireUser } from "@/lib/auth";
import { REVIEW_STATUS_LABEL, getMyOffice, getMyReviews } from "@/lib/dashboard";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "التقييمات" };

export default async function MyReviewsPage() {
  const user = await requireUser("/dashboard/reviews");
  const office = await getMyOffice(user.id);
  if (!office) redirect("/dashboard/office");
  const reviews = await getMyReviews(office.id);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">التقييمات</h1>
        <p className="text-sm text-muted">تظهر هنا كل التقييمات. لا يُنشر للزوار إلا ما اعتمدته إدارة ميعاد.</p>
      </div>
      {reviews.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-card p-8 text-center text-muted">لا توجد تقييمات بعد.</p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => {
            const s = REVIEW_STATUS_LABEL[r.status];
            return (
              <li key={r.id} className="rounded-2xl border border-line bg-card p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Stars value={r.rating} size={14} />
                  <span className="text-sm font-semibold">{r.reviewer_name || "عميل"}</span>
                  <span className="text-xs text-muted">· {formatDate(r.created_at)}</span>
                  <span className={`ms-auto rounded-full px-2 py-0.5 text-xs font-medium ${s.className}`}>{s.text}</span>
                </div>
                {r.comment && <p className="mt-2 text-sm">{r.comment}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
