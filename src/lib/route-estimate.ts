import { routeCoordinates } from "@/lib/data";
import type { Locale } from "@/lib/locale";

type RouteEstimate = {
  distanceKm: number;
  durationMinutes: number;
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function haversineDistanceKm(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(destination.lat - origin.lat);
  const dLng = toRadians(destination.lng - origin.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(origin.lat)) * Math.cos(toRadians(destination.lat)) * Math.sin(dLng / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(a));
}

export function getRouteEstimate(originName: string, destinationName: string): RouteEstimate | null {
  const origin = routeCoordinates[originName];
  const destination = routeCoordinates[destinationName];

  if (!origin || !destination || originName === destinationName) {
    return null;
  }

  const directDistance = haversineDistanceKm(origin, destination);
  const roadDistance = Math.max(4, directDistance * 1.22);
  const averageSpeed = roadDistance < 25 ? 42 : roadDistance < 80 ? 58 : 74;
  const durationMinutes = Math.max(8, Math.round((roadDistance / averageSpeed) * 60 / 5) * 5);

  return {
    distanceKm: Math.round(roadDistance),
    durationMinutes,
  };
}

export function formatRouteEstimate(locale: Locale, estimate: RouteEstimate | null) {
  if (!estimate) {
    return null;
  }

  const hours = Math.floor(estimate.durationMinutes / 60);
  const minutes = estimate.durationMinutes % 60;

  if (locale === "fr") {
    const duration = hours > 0 ? `${hours} h ${minutes.toString().padStart(2, "0")}` : `${minutes} min`;
    return `${estimate.distanceKm} km · ${duration}`;
  }

  const duration = hours > 0 ? `${hours} h ${minutes.toString().padStart(2, "0")}` : `${minutes} min`;
  return `${estimate.distanceKm} km · ${duration}`;
}