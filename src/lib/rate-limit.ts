import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { env } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase/server";

/** معرّف مجهول للعميل: تجزئة عنوان IP مع سرّ الخادم (لا يُخزَّن العنوان نفسه). */
async function clientKey(): Promise<string> {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  return createHash("sha256").update(`${ip}:${env.supabaseServiceRoleKey()}`).digest("hex").slice(0, 32);
}

/**
 * هل يُسمح بهذه المحاولة؟ (max محاولة لكل windowSeconds لكل عميل)
 * عند تعطّل الفحص نسمح بالطلب: الحماية لا يجب أن تعطّل الموقع.
 */
export async function allow(action: string, max: number, windowSeconds: number): Promise<boolean> {
  try {
    const { data, error } = await createServiceClient().rpc("hit_rate_limit", {
      p_key: `${action}:${await clientKey()}`,
      p_max: max,
      p_window_seconds: windowSeconds,
    });
    if (error) {
      console.error("rate limit check failed", error.message);
      return true;
    }
    return data !== false;
  } catch (err) {
    console.error("rate limit error", err);
    return true;
  }
}

export const TOO_MANY = "محاولات كثيرة خلال وقت قصير. انتظر قليلاً ثم حاول مرة أخرى.";
