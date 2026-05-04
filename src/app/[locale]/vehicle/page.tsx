import { AppShell } from "@/components/app-shell";
import { ProfileSetupGate } from "@/components/profile-setup-gate";
import { VehicleProfileForm } from "@/components/vehicle-profile-form";
import { getValidatedLocale } from "@/lib/validated-locale";

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LocalizedVehiclePage({ params }: LocalePageProps) {
  const { locale: rawLocale } = await params;
  const locale = getValidatedLocale(rawLocale);

  return (
    <AppShell locale={locale} path="/vehicle">
      <ProfileSetupGate locale={locale} currentPath="/vehicle">
        <VehicleProfileForm locale={locale} />
      </ProfileSetupGate>
    </AppShell>
  );
}