import { StaticRedirectPage } from "@/components/static-redirect-page";
import { defaultLocale, getLocalePath } from "@/lib/locale";

export default function AdminPage() {
  return <StaticRedirectPage href={getLocalePath(defaultLocale, "/admin")} label="Abrir admin" />;
}