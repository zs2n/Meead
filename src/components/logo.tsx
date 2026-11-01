export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
        <rect x="1" y="1" width="30" height="30" rx="9" fill="#b08d57" />
        {/* ميزان مبسّط */}
        <path d="M16 8v16M10 24h12M9 12h14" stroke="#0b1a2e" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M9 12l-3 6h6zM23 12l-3 6h6z" fill="#0b1a2e" />
      </svg>
      <span className="text-xl font-bold tracking-tight">ميعاد</span>
    </span>
  );
}
