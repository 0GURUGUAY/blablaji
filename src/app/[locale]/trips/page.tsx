import { AppShell } from "@/components/app-shell";
import { RideMarketplace } from "@/components/ride-marketplace";
import { getLocalizedContent } from "@/lib/content";
import { getValidatedLocale } from "@/lib/validated-locale";

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LocalizedTripsPage({ params }: LocalePageProps) {
  const { locale: rawLocale } = await params;
  const locale = getValidatedLocale(rawLocale);
  const content = getLocalizedContent(locale);

  return (
    <AppShell locale={locale} path="/trips">
      <RideMarketplace locale={locale} fallbackRides={content.featuredRides} />
    </AppShell>
  );
}