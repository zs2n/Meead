/**
 * يحوّل الأرقام السعودية الشائعة إلى صيغة دولية موحدة: ‎+9665XXXXXXXX
 * يقبل: 05XXXXXXXX ، 5XXXXXXXX ، 9665XXXXXXXX ، +9665XXXXXXXX ، 00966…، وأرقام الهاتف الثابت 013…
 * ويحوّل الأرقام العربية-الهندية (٠-٩) إلى لاتينية.
 */
export function normalizeSaudiPhone(input: string): string | null {
  let s = input
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[\s\-()]/g, "");
  if (!s) return null;
  if (s.startsWith("00")) s = "+" + s.slice(2);
  if (s.startsWith("+")) return /^\+[0-9]{8,15}$/.test(s) ? s : null;
  if (s.startsWith("966")) return /^966[0-9]{8,9}$/.test(s) ? "+" + s : null;
  if (s.startsWith("0")) s = s.slice(1);
  return /^[1-9][0-9]{7,8}$/.test(s) ? "+966" + s : null;
}
