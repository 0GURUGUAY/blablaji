import { AppShell } from "@/components/app-shell";
import { MessagesCenter } from "@/components/messages-center";
import { ProfileSetupGate } from "@/components/profile-setup-gate";
import { getValidatedLocale } from "@/lib/validated-locale";

type LocalePageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ride?: string; passenger?: string }>;
};

export default async function LocalizedMessagesPage({ params, searchParams }: LocalePageProps) {
  const { locale: rawLocale } = await params;
  const { ride, passenger } = await searchParams;
  const locale = getValidatedLocale(rawLocale);

  return (
    <AppShell locale={locale} path="/messages">
      <ProfileSetupGate locale={locale} currentPath="/messages">
        <MessagesCenter locale={locale} rideId={typeof ride === "string" ? ride : undefined} passengerId={typeof passenger === "string" ? passenger : undefined} />
      </ProfileSetupGate>
    </AppShell>
  );
}