export function getAuthEmailRedirectUrl(locale: "es" | "fr" = "es") {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (configuredUrl) {
    return `${configuredUrl.replace(/\/$/, "")}/${locale}/welcome`;
  }

  if (typeof window !== "undefined") {
    return `${window.location.origin}/${locale}/welcome`;
  }

  return undefined;
}