"use client";

/** يظهر فقط إذا تعطّل الهيكل العام نفسه (حالة نادرة) */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ fontFamily: "system-ui, sans-serif", textAlign: "center", padding: "4rem 1rem" }}>
        <h1>حدث خطأ غير متوقع</h1>
        <p>نعتذر عن ذلك. حاول تحديث الصفحة.</p>
        <button onClick={reset} style={{ marginTop: "1rem", padding: "0.6rem 1.2rem" }}>
          إعادة المحاولة
        </button>
      </body>
    </html>
  );
}
