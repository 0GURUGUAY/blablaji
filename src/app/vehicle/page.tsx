import { StaticRedirectPage } from "@/components/static-redirect-page";
import { defaultLocale, getLocalePath } from "@/lib/locale";

export default function VehiclePage() {
  return <StaticRedirectPage href={getLocalePath(defaultLocale, "/vehicle")} label="Abrir vehiculo" />;
}