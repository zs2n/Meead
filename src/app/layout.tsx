import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "ميعاد — دليلك لاختيار محامي الأحوال الشخصية",
    template: "%s | ميعاد",
  },
  description:
    "ميعاد دليل ذكي لمكاتب المحاماة في الدمام والخبر: قارن بين المكاتب الموثّقة وتقييماتها وتواصل مع المكتب المناسب لقضيتك.",
};

export const viewport: Viewport = {
  themeColor: "#112540",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={plexArabic.variable}>
      <body className="flex min-h-dvh flex-col font-sans antialiased">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
