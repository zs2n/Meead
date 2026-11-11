import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VerifiedBadge } from "@/components/office-card";
import { Stars } from "@/components/stars";
import {
  getApprovedReviews,
  getContactMethods,
  getOfficeBySlug,
  getOfficeHours,
  type OfficeHours,
} from "@/lib/data";
import {
  WEEKDAYS,
  formatDate,
  formatNumber,
  formatTime,
  reviewsLabel,
  riyadhNow,
  toMinutes,
} from "@/lib/format";
import { cookies } from "next/headers";
import { REVIEW_SENT_COOKIE } from "@/lib/contact";
import { getReviewEligibility } from "@/lib/reviews";
import { JsonLd } from "@/components/json-ld";
import { ShareButtons } from "@/components/share-buttons";
import { absoluteUrl, site } from "@/lib/site";
import { ContactButtons } from "./contact-buttons";
import { ReviewForm } from "./review-form";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const office = await getOfficeBySlug(slug);
  if (!office) return { title: "المكتب غير موجود", robots: { index: false } };
  const title = `${office.name} — محامي في ${office.city_name}`;
  const description =
    office.description?.replace(/\s+/g, " ").slice(0, 155) ??
    `${office.name}: مكتب محاماة مرخّص في ${office.city_name} يتولى قضايا ${office.specialty_names.slice(0, 3).join("، ")}. شاهد التقييمات وتواصل مباشرة عبر ميعاد.`;
  return {
    title,
    description,
    alternates: { canonical: `/office/${office.slug}` },
    openGraph: { title: `${title} | ${site.name}`, description, url: `/office/${office.slug}`, type: "profile" },
  };
}

// أسبوع العمل في السعودية يبدأ بالأحد
const WEEK_ORDER = [0, 1, 2, 3, 4, 5, 6];

function openStatus(hours: OfficeHours[]): { open: boolean; label: string } | null {
  if (hours.length === 0) return null;
  const now = riyadhNow();
  const today = hours.find((h) => h.weekday === now.weekday);
  if (today && !today.is_closed && today.opens_at && today.closes_at) {
    const o = toMinutes(today.opens_at);
    const c = toMinutes(today.closes_at);
    if (now.minutes >= o && now.minutes < c) {
      return { open: true, label: `مفتوح الآن · يغلق ${formatTime(today.closes_at)}` };
    }
  }
  return { open: false, label: "مغلق الآن" };
}

export default async function OfficePage({ params }: Props) {
  const { slug } = await params;
  const office = await getOfficeBySlug(slug);
  if (!office) notFound();

  const [hours, reviews, methods, eligibility] = await Promise.all([
    getOfficeHours(office.id),
    getApprovedReviews(office.id),
    getContactMethods(office.id),
    getReviewEligibility(office.id),
  ]);

  const reviewSent = (await cookies()).get(REVIEW_SENT_COOKIE)?.value === office.id;
  const status = openStatus(hours);
  const today = riyadhNow().weekday;

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-28 lg:pb-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "LegalService",
              "@id": absoluteUrl(`/office/${office.slug}#office`),
              name: office.name,
              url: absoluteUrl(`/office/${office.slug}`),
              description: office.description ?? undefined,
              address: {
                "@type": "PostalAddress",
                addressLocality: office.city_name,
                addressCountry: "SA",
                ...(office.address ? { streetAddress: office.address } : {}),
              },
              areaServed: office.city_name,
              knowsAbout: office.specialty_names,
              ...(office.rating_count > 0
                ? {
                    aggregateRating: {
                      "@type": "AggregateRating",
                      ratingValue: office.rating_avg,
                      reviewCount: office.rating_count,
                      bestRating: 5,
                      worstRating: 1,
                    },
                  }
                : {}),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "الرئيسية", item: absoluteUrl("/") },
                { "@type": "ListItem", position: 2, name: "المكاتب", item: absoluteUrl("/search") },
                { "@type": "ListItem", position: 3, name: office.name, item: absoluteUrl(`/office/${office.slug}`) },
              ],
            },
          ],
        }}
      />
      <nav className="mb-4 text-sm text-muted" aria-label="مسار التنقل">
        <Link href="/" className="hover:text-ink">الرئيسية</Link>
        <span className="mx-2">/</span>
        <Link href="/search" className="hover:text-ink">المكاتب</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{office.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* المحتوى الرئيسي */}
        <div className="space-y-6">
          <header className="rounded-2xl border border-line bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">{office.name}</h1>
              <VerifiedBadge />
            </div>
            <p className="mt-1 text-sm text-muted">
              {office.city_name}
              {office.address ? ` · ${office.address}` : ""}
              {" · "}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${office.name} ${office.address ?? ""} ${office.city_name}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-navy-600 underline"
              >
                الموقع على الخريطة
              </a>
            </p>
            <div className="mt-3 flex items-center gap-2 text-sm">
              {office.rating_count > 0 ? (
                <>
                  <Stars value={office.rating_avg} size={18} />
                  <span className="font-bold">{formatNumber(office.rating_avg)}</span>
                  <span className="text-muted">({reviewsLabel(office.rating_count)})</span>
                </>
              ) : (
                <span className="text-muted">{reviewsLabel(0)}</span>
              )}
              {status && (
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.open ? "bg-green-100 text-green-800" : "bg-line text-muted"}`}>
                  {status.open ? "مفتوح الآن" : "مغلق الآن"}
                </span>
              )}
            </div>
            <div className="mt-4 border-t border-line pt-4">
              <ShareButtons url={absoluteUrl(`/office/${office.slug}`)} title={office.name} />
            </div>
          </header>

          {office.description && (
            <section className="rounded-2xl border border-line bg-card p-6">
              <h2 className="mb-2 text-lg font-bold">عن المكتب</h2>
              <p className="whitespace-pre-line text-ink/90">{office.description}</p>
            </section>
          )}

          <section className="rounded-2xl border border-line bg-card p-6">
            <h2 className="mb-3 text-lg font-bold">التخصصات</h2>
            <ul className="flex flex-wrap gap-2">
              {office.specialty_names.map((n) => (
                <li key={n} className="rounded-full bg-navy-50 px-3 py-1 text-sm font-medium text-navy-700">
                  {n}
                </li>
              ))}
            </ul>
          </section>

          <section id="reviews" className="rounded-2xl border border-line bg-card p-6">
            <h2 className="mb-4 text-lg font-bold">التقييمات</h2>

            {reviewSent && (
              <div role="status" className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-900">
                <p className="font-semibold">شكراً لك! استلمنا تقييمك.</p>
                <p className="mt-1 text-sm">سيظهر في صفحة المكتب بعد مراجعته من فريق ميعاد.</p>
              </div>
            )}

            {eligibility.eligible && !reviewSent && (
              <div className="mb-6">
                <ReviewForm officeId={office.id} officeName={office.name} />
              </div>
            )}

            {reviews.length > 0 ? (
              <>
                <div className="mb-6 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
                  <div className="text-center sm:pe-6">
                    <div className="text-4xl font-bold">{formatNumber(office.rating_avg)}</div>
                    <Stars value={office.rating_avg} size={18} />
                    <div className="mt-1 text-xs text-muted">{reviewsLabel(office.rating_count)}</div>
                  </div>
                  <ul className="space-y-1">
                    {distribution.map((d) => (
                      <li key={d.star} className="flex items-center gap-2 text-xs">
                        <span className="w-10 text-muted">{formatNumber(d.star)} نجوم</span>
                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                          <span
                            className="block h-full rounded-full bg-gold-500"
                            style={{ width: `${(d.count / reviews.length) * 100}%` }}
                          />
                        </span>
                        <span className="w-6 text-muted">{formatNumber(d.count)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <ul className="divide-y divide-line">
                  {reviews.map((r) => (
                    <li key={r.id} className="py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Stars value={r.rating} size={14} />
                        <span className="text-sm font-semibold">{r.reviewer_name || "عميل"}</span>
                        <span className="text-xs text-muted">· {formatDate(r.created_at)}</span>
                      </div>
                      {r.comment && <p className="mt-1 text-sm text-ink/90">{r.comment}</p>}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-muted">لا توجد تقييمات منشورة لهذا المكتب بعد.</p>
            )}

            <p className="mt-4 rounded-xl bg-paper p-3 text-xs text-muted">
              لا يستطيع التقييم إلا من تواصل مع المكتب عبر ميعاد، وتُراجع جميع التقييمات قبل نشرها.
            </p>
          </section>
        </div>

        {/* الشريط الجانبي: التواصل وساعات العمل */}
        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <section className="rounded-2xl border border-line bg-card p-5 shadow-sm">
            <h2 className="mb-3 font-bold">تواصل مع المكتب</h2>
            <ContactButtons officeId={office.id} methods={methods} />
            <p className="mt-3 text-xs text-muted">
              ميعاد لا يقدّم استشارات قانونية؛ التواصل يتم مباشرة بينك وبين المكتب.
            </p>
          </section>

          {hours.length > 0 && (
            <section className="rounded-2xl border border-line bg-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-bold">ساعات العمل</h2>
                {status && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.open ? "bg-green-100 text-green-800" : "bg-line text-muted"}`}
                  >
                    {status.label}
                  </span>
                )}
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {WEEK_ORDER.map((d) => {
                    const h = hours.find((x) => x.weekday === d);
                    return (
                      <tr key={d} className={d === today ? "font-semibold text-ink" : "text-ink/80"}>
                        <th scope="row" className="py-1 text-start font-[inherit]">
                          {WEEKDAYS[d]}
                        </th>
                        <td className="py-1 text-end">
                          {!h || h.is_closed || !h.opens_at || !h.closes_at
                            ? "مغلق"
                            : `${formatTime(h.opens_at)} – ${formatTime(h.closes_at)}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          )}
        </aside>
      </div>

      {/* شريط تواصل ثابت أسفل شاشة الجوال: الإجراء الأهم دائماً في المتناول */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/95 p-3 shadow-[0_-4px_16px_rgba(0,0,0,.08)] backdrop-blur lg:hidden">
        <ContactButtons officeId={office.id} methods={methods} variant="bar" />
      </div>
    </div>
  );
}
