/**
 * إعدادات الموقع العامة. كل القيم الاختيارية تُقرأ من متغيرات البيئة،
 * والعناصر التي تعتمد عليها (واتساب، حسابات التواصل…) لا تظهر إن لم تُضبط.
 */
const opt = (v: string | undefined) => (v && v.trim() ? v.trim() : null);

export const site = {
  name: "ميعاد",
  tagline: "دليلك لاختيار المحامي المناسب",
  description:
    "ميعاد دليل مكاتب المحاماة المرخّصة في الدمام والخبر. قارن بين المكاتب حسب نوع قضيتك وتقييمات العملاء، وتواصل مع المكتب مباشرة ومجاناً.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  region: "الدمام والخبر",
  contactEmail: opt(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
  /** رقم واتساب المنصة بصيغة دولية بلا "+": 9665XXXXXXXX */
  whatsapp: opt(process.env.NEXT_PUBLIC_WHATSAPP)?.replace(/\D/g, "") ?? null,
  social: {
    x: opt(process.env.NEXT_PUBLIC_SOCIAL_X),
    instagram: opt(process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM),
    tiktok: opt(process.env.NEXT_PUBLIC_SOCIAL_TIKTOK),
    snapchat: opt(process.env.NEXT_PUBLIC_SOCIAL_SNAPCHAT),
    linkedin: opt(process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN),
  },
  gaId: opt(process.env.NEXT_PUBLIC_GA_ID),
};

export const absoluteUrl = (path = "/") => `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
