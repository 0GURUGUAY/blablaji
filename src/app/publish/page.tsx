import { StaticRedirectPage } from "@/components/static-redirect-page";
import { defaultLocale, getLocalePath } from "@/lib/locale";

export default function PublishPage() {
  return <StaticRedirectPage href={getLocalePath(defaultLocale, "/publish")} label="Abrir publicar" />;
}