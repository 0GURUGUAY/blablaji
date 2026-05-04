import { AccountForm } from "@/components/account-form";
import { AppShell } from "@/components/app-shell";
import { ProfileSetupGate } from "@/components/profile-setup-gate";
import { getValidatedLocale } from "@/lib/validated-locale";

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LocalizedAccountPage({ params }: LocalePageProps) {
  const { locale: rawLocale } = await params;
  const locale = getValidatedLocale(rawLocale);

  return (
    <AppShell locale={locale} path="/account">
      <ProfileSetupGate locale={locale} currentPath="/account">
        <AccountForm locale={locale} />
      </ProfileSetupGate>
    </AppShell>
  );
}