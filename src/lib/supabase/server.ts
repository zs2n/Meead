import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createRawClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * عميل Supabase بصلاحيات الزائر/المستخدم الحالي — يخضع لـ RLS.
 * استخدمه لكل القراءات العامة وعمليات لوحة المكتب.
 */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // يُستدعى من Server Component حيث لا يمكن كتابة الكوكيز؛ الـ middleware يتولى التحديث.
        }
      },
    },
  });
}

/**
 * عميل بصلاحيات الخادم الكاملة (يتجاوز RLS).
 * للعمليات التي يجب ألا يقوم بها المتصفح مباشرة: تسجيل التواصل، إرسال التقييم، قراءة أرقام التواصل.
 * لا يُستورد أبداً في كود يعمل في المتصفح.
 */
export function createServiceClient() {
  return createRawClient(env.supabaseUrl, env.supabaseServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
