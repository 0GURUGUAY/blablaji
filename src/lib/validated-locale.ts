import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/locale";

export function getValidatedLocale(value: string): Locale {
  if (!isLocale(value)) {
    notFound();
  }

  return value;
}