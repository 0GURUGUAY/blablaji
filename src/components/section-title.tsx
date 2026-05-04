type SectionTitleProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionTitle({ eyebrow, title, description }: SectionTitleProps) {
  return (
    <div className="max-w-2xl space-y-3">
      <p className="text-xs uppercase tracking-[0.34em] text-[var(--uy-deep)]">{eyebrow}</p>
      <h2 className="font-serif text-3xl leading-tight text-slate-900 sm:text-4xl">{title}</h2>
      <p className="text-sm leading-6 text-slate-600 sm:text-base">{description}</p>
    </div>
  );
}