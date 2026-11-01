function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`متغير البيئة ${name} غير مضبوط. راجع ملف .env.example`);
  return value;
}

export const env = {
  supabaseUrl: required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: required("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  // يُقرأ عند الحاجة فقط حتى لا يُطلب في كود المتصفح
  supabaseServiceRoleKey: () =>
    required("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY),
};
