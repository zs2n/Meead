/** ترويسة موحّدة للصفحات التعريفية */
export function PageHeader({ eyebrow, title, lead }: { eyebrow?: string; title: string; lead?: string }) {
  return (
    <header className="bg-navy-800 text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        {eyebrow && <p className="mb-2 text-sm font-semibold text-gold-400">{eyebrow}</p>}
        <h1 className="text-3xl font-bold leading-snug sm:text-4xl">{title}</h1>
        {lead && <p className="mt-3 max-w-2xl text-white/85 sm:text-lg">{lead}</p>}
      </div>
    </header>
  );
}
