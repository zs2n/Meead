import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { METHOD_LABEL, getMyContactEvents, getMyOffice } from "@/lib/dashboard";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "الطلبات الواردة" };

const dateTime = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Riyadh",
});

export default async function RequestsPage() {
  const user = await requireUser("/dashboard/requests");
  const office = await getMyOffice(user.id);
  if (!office) redirect("/dashboard/office");

  const events = await getMyContactEvents(office.id);
  const byMethod = (["whatsapp", "call", "email"] as const).map((m) => ({
    method: m,
    count: events.filter((e) => e.method === m).length,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">الطلبات الواردة</h1>
        <p className="text-sm text-muted">
          كل ضغطة على أزرار التواصل في صفحتك تُسجَّل هنا. تكرار التواصل من الزائر نفسه بالوسيلة نفسها خلال نصف ساعة يُحتسب مرة
          واحدة.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {byMethod.map((m) => (
          <div key={m.method} className="rounded-2xl border border-line bg-card p-4">
            <div className="text-2xl font-bold">{formatNumber(m.count)}</div>
            <div className="text-sm text-muted">{METHOD_LABEL[m.method]}</div>
          </div>
        ))}
      </div>

      {events.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-card p-8 text-center text-muted">لا توجد طلبات بعد.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-card">
          <table className="w-full text-sm">
            <thead className="bg-paper text-muted">
              <tr>
                <th className="px-4 py-2 text-start font-medium">الوقت</th>
                <th className="px-4 py-2 text-start font-medium">الوسيلة</th>
                <th className="px-4 py-2 text-start font-medium">الزائر</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {events.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-2.5">{dateTime.format(new Date(e.created_at))}</td>
                  <td className="px-4 py-2.5">{METHOD_LABEL[e.method]}</td>
                  <td className="px-4 py-2.5 text-muted">{e.user_id ? "مستخدم مسجّل" : "زائر"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
