import "server-only";

/**
 * يرسل إشعاراً بالبريد عبر Resend. لا يرمي خطأً أبداً: فشل الإشعار
 * لا يجب أن يفشل حفظ الطلب نفسه.
 * المتغيرات المطلوبة في Vercel: RESEND_API_KEY و NOTIFY_EMAIL.
 */
export async function notifyAdmin(subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
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
    if (!res.ok) console.error("notifyAdmin failed", res.status, await res.text());
  } catch (err) {
    console.error("notifyAdmin error", err);
  }
}
