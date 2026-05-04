import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { AppShell } from "@/components/app-shell";
import { RideCard } from "@/components/ride-card";
import { SectionTitle } from "@/components/section-title";
import { getLocalizedContent } from "@/lib/content";
import { getLocalePath } from "@/lib/locale";
import { getValidatedLocale } from "@/lib/validated-locale";

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LocaleHomePage({ params }: LocalePageProps) {
  const { locale: rawLocale } = await params;
  const locale = getValidatedLocale(rawLocale);
  const content = getLocalizedContent(locale);

  return (
    <AppShell locale={locale} path="/">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_1.15fr] lg:items-start">
        <div className="space-y-5 rounded-[32px] bg-[linear-gradient(145deg,var(--uy-deep),var(--uy-deep-strong))] p-7 text-[var(--uy-paper)] shadow-[0_30px_70px_-45px_rgba(0,91,187,0.75)] sm:p-9">
          <div className="inline-flex rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.28em] text-[var(--uy-sky)]">
            {content.home.badge}
          </div>
          <div className="space-y-4">
            <h1 className="max-w-3xl font-serif text-3xl leading-tight sm:text-4xl">{content.home.title}</h1>
            <p className="max-w-2xl text-sm leading-6 text-[color:rgba(231,246,255,0.92)] sm:text-base">{content.home.description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={getLocalePath(locale, "/trips")} className="rounded-full bg-[var(--uy-sun)] px-6 py-3 text-sm font-semibold text-[var(--uy-deep-strong)] transition hover:bg-[var(--uy-sun-soft)]">
              {content.home.searchCta}
            </Link>
            <Link href={getLocalePath(locale, "/publish")} className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-[var(--uy-paper)] transition hover:bg-white/10">
              {content.home.publishCta}
            </Link>
          </div>
        </div>

        <div className="grid gap-4 rounded-[32px] border border-[var(--uy-line)] bg-[color:rgba(255,255,255,0.94)] p-6 shadow-[0_25px_70px_-45px_rgba(0,91,187,0.42)]">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
              {content.home.searchCard.origin}
              <div className="mt-2 text-lg font-semibold text-slate-900">Jose Ignacio</div>
            </label>
            <label className="rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
              {content.home.searchCard.destination}
              <div className="mt-2 text-lg font-semibold text-slate-900">Punta del Este</div>
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
              {content.home.searchCard.date}
              <div className="mt-2 text-base font-semibold text-slate-900">{content.home.searchCard.dateValue}</div>
            </label>
            <label className="rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
              {content.home.searchCard.seats}
              <div className="mt-2 text-base font-semibold text-slate-900">2</div>
            </label>
            <label className="rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
              {content.home.searchCard.maxPrice}
              <div className="mt-2 text-base font-semibold text-slate-900">UYU 400</div>
            </label>
          </div>
          <button className="rounded-full bg-[var(--uy-deep)] px-5 py-4 text-sm font-semibold text-[var(--uy-paper)] transition hover:bg-[var(--uy-deep-strong)]">
            {content.home.searchCard.action}
          </button>
          <p className="text-sm leading-6 text-slate-500">{content.home.searchCard.caption}</p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {content.trustMetrics.map((metric) => (
          <article key={metric.label} className="rounded-[28px] border border-[var(--uy-line)] bg-[color:rgba(255,255,255,0.74)] p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{metric.label}</p>
            <p className="mt-3 font-serif text-3xl text-[var(--uy-deep)] sm:text-4xl">{metric.value}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="space-y-8">
        <SectionTitle
          eyebrow={content.home.tripsEyebrow}
          title={content.home.tripsTitle}
          description={content.home.tripsDescription}
        />
        <div className="grid gap-6 lg:grid-cols-2">
          {content.featuredRides.map((ride) => (
            <RideCard key={ride.id} ride={ride} locale={locale} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {content.productPillars.map((pillar) => (
          <article key={pillar.title} className="rounded-[30px] border border-[var(--uy-line)] bg-[linear-gradient(180deg,var(--uy-sky-pale),rgba(255,226,138,0.28))] p-8">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--uy-deep)]">{content.home.pillarEyebrow}</p>
            <h3 className="mt-4 font-serif text-2xl text-slate-900">{pillar.title}</h3>
            <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">{pillar.description}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <AuthCard locale={locale} />

        <article className="rounded-[32px] bg-[linear-gradient(160deg,var(--uy-deep),#0a78d1)] p-8 text-[var(--uy-paper)]">
          <SectionTitle
            eyebrow={content.home.reviewsEyebrow}
            title={content.home.reviewsTitle}
            description={content.home.reviewsDescription}
          />
          <div className="mt-8 grid gap-4">
            {content.reviews.map((review) => (
              <div key={review.id} className="rounded-[26px] border border-white/10 bg-white/8 p-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold">{review.author}</p>
                  <p className="text-sm text-[var(--uy-sky)]">{review.rating}/5 · {review.route}</p>
                </div>
                <p className="mt-3 text-sm leading-7 text-[color:rgba(243,251,255,0.92)]">{review.body}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </AppShell>
  );
}