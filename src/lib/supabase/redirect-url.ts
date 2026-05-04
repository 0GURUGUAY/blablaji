export function getAuthEmailRedirectUrl(locale: "es" | "fr" = "es", path = "/welcome") {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (configuredUrl) {
    return `${configuredUrl.replace(/\/$/, "")}/${locale}${path}`;
  }

  if (typeof window !== "undefined") {
    return `${window.location.origin}/${locale}${path}`;
  }

  return undefined;
}