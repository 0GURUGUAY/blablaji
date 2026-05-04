import { StaticRedirectPage } from "@/components/static-redirect-page";
import { defaultLocale, getLocalePath } from "@/lib/locale";

export default function TripsPage() {
  return <StaticRedirectPage href={getLocalePath(defaultLocale, "/trips")} label="Abrir viajes" />;
}