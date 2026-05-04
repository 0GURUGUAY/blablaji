import { StaticRedirectPage } from "@/components/static-redirect-page";
import { defaultLocale, getLocalePath } from "@/lib/locale";

export default function AccountPage() {
  return <StaticRedirectPage href={getLocalePath(defaultLocale, "/account")} label="Abrir cuenta" />;
}