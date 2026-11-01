"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/auth";

export type AuthState = { error?: string; success?: string } | undefined;

const LoginInput = z.object({
  email: z.string().trim().email("أدخل بريداً إلكترونياً صحيحاً"),
  password: z.string().min(1, "أدخل كلمة المرور"),
});

export async function login(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = LoginInput.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (error.code === "email_not_confirmed")
      return { error: "لم يتم تأكيد البريد بعد. افتح الرابط المرسل إلى بريدك." };
    return { error: "البريد أو كلمة المرور غير صحيحة" };
  }
  redirect(safeNext(formData.get("next")));
}

const SignupInput = z.object({
  full_name: z.string().trim().min(2, "أدخل اسمك").max(80),
  email: z.string().trim().email("أدخل بريداً إلكترونياً صحيحاً"),
  password: z.string().min(8, "كلمة المرور يجب ألا تقل عن ٨ أحرف").max(72),
});

export async function signup(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = SignupInput.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.full_name },
      emailRedirectTo: `${site}/auth/confirm?next=/dashboard/office`,
    },
  });
  if (error) {
    if (error.code === "user_already_exists") return { error: "هذا البريد مسجّل مسبقاً، سجّل الدخول بدلاً من ذلك." };
    if (error.code === "weak_password") return { error: "كلمة المرور ضعيفة، اختر كلمة أقوى." };
    return { error: "تعذّر إنشاء الحساب، حاول مرة أخرى." };
  }
  // عند تفعيل تأكيد البريد لا تُنشأ جلسة حتى يضغط المستخدم الرابط
  if (!data.session) {
    return { success: "أرسلنا رابط تأكيد إلى بريدك. افتحه لإكمال طلب تسجيل المكتب." };
  }
  redirect("/dashboard/office");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
