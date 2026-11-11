"use client";

import { track as vercelTrack } from "@vercel/analytics";

type Props = Record<string, string | number | boolean | null>;

/** يسجّل حدثاً في التحليلات (Vercel Analytics، وGoogle Analytics إن كان مفعّلاً). لا يرمي خطأً أبداً. */
export function trackEvent(name: string, props?: Props) {
  try {
    vercelTrack(name, props);
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    w.gtag?.("event", name, props ?? {});
  } catch {
    // التحليلات اختيارية
  }
}
