import { formatNumber } from "@/lib/format";

/** عرض التقييم بالنجوم (للقراءة فقط) */
export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  const label = `${formatNumber(value)} من ٥`;
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={label} title={label}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)));
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
            <defs>
              {/* الاتجاه من اليمين لليسار: التعبئة تبدأ من اليمين */}
              <linearGradient id={`s${i}-${Math.round(fill * 100)}`} x1="1" x2="0" y1="0" y2="0">
                <stop offset={`${fill * 100}%`} stopColor="#b08d57" />
                <stop offset={`${fill * 100}%`} stopColor="#e4e0d6" />
              </linearGradient>
            </defs>
            <path
              d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.8l-5.2 2.8 1-5.8L1.5 7.7l5.9-.9z"
              fill={`url(#s${i}-${Math.round(fill * 100)})`}
            />
          </svg>
        );
      })}
    </span>
  );
}
