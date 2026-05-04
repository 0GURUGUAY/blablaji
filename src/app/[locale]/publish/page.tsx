import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PublishRideForm } from "@/components/publish-ride-form";
import { SectionTitle } from "@/components/section-title";
import { getLocalizedContent } from "@/lib/content";
import { getLocalePath } from "@/lib/locale";
import { getValidatedLocale } from "@/lib/validated-locale";

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LocalizedPublishPage({ params }: LocalePageProps) {
  const { locale: rawLocale } = await params;
  const locale = getValidatedLocale(rawLocale);
  const content = getLocalizedContent(locale);

  return (
    <AppShell locale={locale} path="/publish">
      <section className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[32px] bg-[linear-gradient(160deg,var(--uy-deep),#0a78d1)] p-8 text-[var(--uy-paper)]">
          <SectionTitle eyebrow={content.publish.eyebrow} title={content.publish.title} description={content.publish.description} />
          <div className="mt-6">
            <Link
              href={getLocalePath(locale, "/vehicle")}
              className="inline-flex rounded-full bg-[var(--uy-sun)] px-5 py-3 text-sm font-semibold text-[var(--uy-deep-strong)] transition hover:bg-[var(--uy-sun-soft)]"
            >
              {content.publish.vehicleCta}
            </Link>
          </div>
          <div className="mt-8 grid gap-4">
            {content.publish.steps.map((step, index) => (
              <div key={step} className="flex items-center gap-4 rounded-[24px] border border-white/10 bg-white/8 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--uy-sun)] font-semibold text-[var(--uy-deep-strong)]">
                  0{index + 1}
                </div>
                <p className="text-sm leading-6 text-[color:rgba(231,246,255,0.92)]">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <PublishRideForm locale={locale} />
      </section>
    </AppShell>
  );
}