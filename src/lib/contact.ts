import "server-only";
import { createHash, randomBytes, randomUUID } from "node:crypto";

export const VISITOR_COOKIE = "meead_vid";
export const reviewCookieName = (officeId: string) => `meead_rt_${officeId}`;

export const REVIEW_TOKEN_MAX_AGE = 60 * 60 * 24 * 90; // 90 يوماً
export const VISITOR_MAX_AGE = 60 * 60 * 24 * 365;

export function newReviewToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function newVisitorId() {
  return randomUUID();
}

export const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

const GREETING = "السلام عليكم، وصلت إليكم عن طريق منصة ميعاد وأرغب بالاستفسار.";

export function buildContactUrl(
  method: "whatsapp" | "call" | "email",
  target: string,
): string {
  switch (method) {
    case "whatsapp":
      return `https://wa.me/${target.replace(/\D/g, "")}?text=${encodeURIComponent(GREETING)}`;
    case "call":
      return `tel:${target}`;
    case "email":
      return `mailto:${target}?subject=${encodeURIComponent("استفسار عبر منصة ميعاد")}`;
  }
}
