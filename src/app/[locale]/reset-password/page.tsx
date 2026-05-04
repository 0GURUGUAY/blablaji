import { AppShell } from "@/components/app-shell";
import { ResetPasswordFlow } from "@/components/reset-password-flow";
import { getValidatedLocale } from "@/lib/validated-locale";

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LocalizedResetPasswordPage({ params }: LocalePageProps) {
  const { locale: rawLocale } = await params;
  const locale = getValidatedLocale(rawLocale);

  return (
    <AppShell locale={locale} path="/reset-password">
      <ResetPasswordFlow locale={locale} />
    </AppShell>
  );
}