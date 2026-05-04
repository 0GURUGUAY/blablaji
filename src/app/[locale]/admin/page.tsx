import { AdminGate } from "@/components/admin-gate";
import { AppShell } from "@/components/app-shell";
import { SectionTitle } from "@/components/section-title";
import { getLocalizedContent } from "@/lib/content";
import { getValidatedLocale } from "@/lib/validated-locale";

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LocalizedAdminPage({ params }: LocalePageProps) {
  const { locale: rawLocale } = await params;
  const locale = getValidatedLocale(rawLocale);
  const content = getLocalizedContent(locale);

  return (
    <AppShell locale={locale} path="/admin">
      <AdminGate locale={locale}>
        <section className="space-y-8">
          <SectionTitle eyebrow={content.admin.eyebrow} title={content.admin.title} description={content.admin.description} />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {content.trustMetrics.map((metric) => (
              <article key={metric.label} className="rounded-[28px] border border-[var(--uy-line)] bg-[color:rgba(255,255,255,0.88)] p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{metric.label}</p>
                <p className="mt-3 font-serif text-4xl text-[var(--uy-deep)]">{metric.value}</p>
                <p className="mt-2 text-sm text-slate-500">{metric.detail}</p>
              </article>
            ))}
          </div>

          <div className="overflow-hidden rounded-[32px] border border-[var(--uy-line)] bg-[color:rgba(255,255,255,0.9)] shadow-[0_20px_60px_-45px_rgba(19,89,135,0.35)]">
            <div className="grid grid-cols-[1.2fr_1.5fr_0.8fr_0.9fr_0.9fr] gap-4 border-b border-black/5 px-6 py-4 text-xs uppercase tracking-[0.24em] text-slate-400">
              <span>{content.admin.headers.subject}</span>
              <span>{content.admin.headers.reason}</span>
              <span>{content.admin.headers.severity}</span>
              <span>{content.admin.headers.opened}</span>
              <span>{content.admin.headers.status}</span>
            </div>
            {content.moderationCases.map((item) => (
              <div key={item.id} className="grid grid-cols-[1.2fr_1.5fr_0.8fr_0.9fr_0.9fr] gap-4 border-b border-black/5 px-6 py-5 text-sm text-slate-600 last:border-b-0">
                <span className="font-semibold text-slate-900">{item.subject}</span>
                <span>{item.reason}</span>
                <span>{content.moderationLabels.severity[item.severity]}</span>
                <span>{item.openedAt}</span>
                <span className="font-semibold text-[var(--uy-deep)]">{content.moderationLabels.status[item.status]}</span>
              </div>
            ))}
          </div>
        </section>
      </AdminGate>
    </AppShell>
  );
}