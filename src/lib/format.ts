const num = new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 1 });

export const formatNumber = (n: number) => num.format(n);

/** صيغة الجمع العربية لكلمة "تقييم" */
export function reviewsLabel(count: number): string {
  if (count === 0) return "لا توجد تقييمات بعد";
  if (count === 1) return "تقييم واحد";
  if (count === 2) return "تقييمان";
  if (count >= 3 && count <= 10) return `${formatNumber(count)} تقييمات`;
  return `${formatNumber(count)} تقييماً`;
}

export const WEEKDAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

/** "09:00:00" → "٩:٠٠ ص" */
export function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const period = h < 12 ? "ص" : "م";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${formatNumber(h12)}:${new Intl.NumberFormat("ar-SA", { minimumIntegerDigits: 2 }).format(m)} ${period}`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Riyadh",
  }).format(new Date(iso));
}

/** اليوم والوقت الحاليان بتوقيت السعودية */
export function riyadhNow(): { weekday: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Riyadh",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { weekday, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

export const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

/** صيغة الجمع العربية لكلمة "مكتب" */
export function officesLabel(count: number): string {
  if (count === 0) return "لا توجد مكاتب";
  if (count === 1) return "مكتب واحد";
  if (count === 2) return "مكتبان";
  if (count >= 3 && count <= 10) return `${formatNumber(count)} مكاتب`;
  return `${formatNumber(count)} مكتباً`;
}
