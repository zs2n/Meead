import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { STATUS_LABEL, type OfficeStatus } from "@/lib/dashboard";
import { WEEKDAYS, formatDate, formatTime } from "@/lib/format";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { DecisionPanel } from "./decision-panel";

export const metadata: Metadata = { title: "مراجعة مكتب" };

type Detail = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  address: string | null;
  status: OfficeStatus;
  rejection_reason: string | null;
  owner_id: string | null;
  created_at: string;
  reviewed_at: string | null;
  city: { name_ar: string } | null;
  office_private: {
    phone: string | null;
    whatsapp: string | null;
    email: string | null;
    license_number: string | null;
    license_doc_path: string | null;
  } | null;
  office_specialties: { specialty: { name_ar: string } | null }[];
  office_hours: { weekday: number; opens_at: string | null; closes_at: string | null; is_closed: boolean }[];
};

export default async function AdminOfficeDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("offices")
    .select(
      `id, slug, name, description, address, status, rejection_reason, owner_id, created_at, reviewed_at,
       city:cities(name_ar),
       office_private(phone, whatsapp, email, license_number, license_doc_path),
       office_specialties(specialty:specialties(name_ar)),
       office_hours(weekday, opens_at, closes_at, is_closed)`,
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const o = data as unknown as Detail;

  // بيانات حساب المتقدّم + رابط مؤقت لصورة الترخيص (صالح ١٠ دقائق)
  const service = createServiceClient();
  const [ownerRes, docRes] = await Promise.all([
    o.owner_id ? service.auth.admin.getUserById(o.owner_id) : Promise.resolve(null),
    o.office_private?.license_doc_path
      ? service.storage.from("licenses").createSignedUrl(o.office_private.license_doc_path, 600)
      : Promise.resolve(null),
  ]);
  const owner = ownerRes?.data.user;
  const docUrl = docRes?.data?.signedUrl;
  const isImage = /\.(jpg|png|webp)$/.test(o.office_private?.license_doc_path ?? "");
  const s = STATUS_LABEL[o.status];
  const p = o.office_private;

  return (
    <div className="space-y-4">
      <Link href="/admin" className="text-sm text-muted hover:text-ink">→ العودة للطلبات</Link>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-line bg-card p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold">{o.name}</h1>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.className}`}>{s.text}</span>
            </div>
            <p className="mt-1 text-sm text-muted">
              {o.city?.name_ar}
              {o.address ? ` · ${o.address}` : ""} · قُدّم {formatDate(o.created_at)}
            </p>
            {o.rejection_reason && <p className="mt-2 text-sm text-red-800">سبب الرفض السابق: {o.rejection_reason}</p>}
            {o.description && <p className="mt-4 whitespace-pre-line text-sm">{o.description}</p>}
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {o.office_specialties.map((x) => (
                <li key={x.specialty?.name_ar} className="rounded-full bg-navy-50 px-3 py-0.5 text-xs font-medium text-navy-700">
                  {x.specialty?.name_ar}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-line bg-card p-5">
            <h2 className="mb-3 font-bold">الترخيص</h2>
            <dl className="grid gap-2 text-sm sm:grid-cols-[auto_1fr]">
              <dt className="text-muted">رقم الترخيص</dt>
              <dd className="ltr-nums font-semibold">{p?.license_number ?? "—"}</dd>
            </dl>
            {docUrl ? (
              <div className="mt-3 space-y-2">
                {isImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={docUrl} alt="صورة الترخيص" className="max-h-96 rounded-xl border border-line" />
                )}
                <a href={docUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-semibold text-navy-600 underline">
                  فتح ملف الترخيص في نافذة جديدة
                </a>
              </div>
            ) : (
              <p className="mt-3 text-sm text-red-700">لم تُرفع صورة الترخيص.</p>
            )}
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-card p-5">
              <h2 className="mb-3 font-bold">التواصل والحساب</h2>
              <dl className="space-y-1.5 text-sm">
                <Row label="واتساب" value={p?.whatsapp} />
                <Row label="الهاتف" value={p?.phone} />
                <Row label="بريد المكتب" value={p?.email} />
                <Row label="بريد الحساب" value={owner?.email} />
                <Row label="اسم المسؤول" value={(owner?.user_metadata?.full_name as string | undefined) ?? null} rtl />
              </dl>
            </div>
            <div className="rounded-2xl border border-line bg-card p-5">
              <h2 className="mb-3 font-bold">ساعات العمل</h2>
              <ul className="space-y-1 text-sm">
                {[0, 1, 2, 3, 4, 5, 6].map((d) => {
                  const h = o.office_hours.find((x) => x.weekday === d);
                  return (
                    <li key={d} className="flex justify-between">
                      <span>{WEEKDAYS[d]}</span>
                      <span className="text-muted">
                        {!h || h.is_closed || !h.opens_at || !h.closes_at ? "مغلق" : `${formatTime(h.opens_at)} – ${formatTime(h.closes_at)}`}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start">
          <section className="rounded-2xl border border-line bg-card p-5 shadow-sm">
            <h2 className="mb-1 font-bold">القرار</h2>
            <p className="mb-4 text-xs text-muted">
              لا تعتمد المكتب إلا بعد التحقق يدوياً من صحة الترخيص (مثلاً عبر منصة ناجز أو هيئة المحامين).
            </p>
            <DecisionPanel officeId={o.id} status={o.status} />
          </section>
          {o.status === "approved" && (
            <Link href={`/office/${o.slug}`} className="block text-center text-sm font-semibold text-navy-600 underline">
              عرض الصفحة العامة
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, rtl = false }: { label: string; value: string | null | undefined; rtl?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className={rtl ? "" : "ltr-nums"}>{value || "—"}</dd>
    </div>
  );
}
