import { StaticRedirectPage } from "@/components/static-redirect-page";
import { defaultLocale, getLocalePath } from "@/lib/locale";

export default function HomePage() {
  return <StaticRedirectPage href={getLocalePath(defaultLocale)} label="Abrir la home" />;
}