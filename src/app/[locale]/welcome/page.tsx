import { AppShell } from "@/components/app-shell";
import { WelcomeFlow } from "@/components/welcome-flow";
import { getValidatedLocale } from "@/lib/validated-locale";

type LocalePageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
};

const allowedRedirects = new Set(["/account", "/publish", "/vehicle", "/messages", "/admin"]);

export default async function LocalizedWelcomePage({ params, searchParams }: LocalePageProps) {
  const { locale: rawLocale } = await params;
  const { next } = await searchParams;
  const locale = getValidatedLocale(rawLocale);
  const redirectPath = typeof next === "string" && allowedRedirects.has(next) ? next as "/account" | "/publish" | "/vehicle" | "/messages" | "/admin" : "/account";

  return (
    <AppShell locale={locale} path="/welcome">
      <WelcomeFlow locale={locale} redirectPath={redirectPath} />
    </AppShell>
  );
}