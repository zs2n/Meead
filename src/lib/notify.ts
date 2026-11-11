import "server-only";

/**
 * يرسل بريداً عبر Resend. لا يرمي خطأً أبداً: فشل الإشعار
 * لا يجب أن يفشل الحفظ أو القرار نفسه.
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !to) return;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ميعاد <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
      }),
    });
    if (!res.ok) console.error("sendEmail failed", res.status, await res.text());
  } catch (err) {
    console.error("sendEmail error", err);
  }
}

/** يمنع حقن HTML في رسائل البريد عند إدراج نصوص كتبها المستخدم */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** إشعار لفريق الإدارة (NOTIFY_EMAIL) */
export function notifyAdmin(subject: string, html: string): Promise<void> {
  const to = process.env.NOTIFY_EMAIL;
  return to ? sendEmail(to, subject, html) : Promise.resolve();
}
