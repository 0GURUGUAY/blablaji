import type { ReactNode } from "react";
import { locales } from "@/lib/locale";
import { getValidatedLocale } from "@/lib/validated-locale";

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  getValidatedLocale(locale);

  return children;
}