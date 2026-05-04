import { getLocalizedContent } from "@/lib/content";
import type { Locale } from "@/lib/locale";
import { formatRouteEstimate, getRouteEstimate } from "@/lib/route-estimate";
import type { Ride } from "@/lib/types";

type RideCardProps = {
  ride: Ride;
  locale: Locale;
};

export function RideCard({ ride, locale }: RideCardProps) {
  const content = getLocalizedContent(locale);
  const routeEstimate = formatRouteEstimate(locale, getRouteEstimate(ride.origin, ride.destination));

  return (
    <article className="flex h-full flex-col justify-between rounded-[28px] border border-[var(--uy-line)] bg-[color:rgba(255,255,255,0.9)] p-6 shadow-[0_25px_60px_-35px_rgba(31,77,107,0.22)]">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{ride.dateLabel}</p>
            <h3 className="mt-2 font-serif text-2xl text-slate-900">
              {ride.origin} <span className="text-slate-400">→</span> {ride.destination}
            </h3>
          </div>
          <span className="rounded-full bg-[var(--uy-sun-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--uy-deep-strong)]">
            {content.rideLabels.status[ride.status]}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
          <div className="rounded-2xl bg-[var(--uy-sky-pale)] p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{content.rideLabels.departure}</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{ride.departureTime}</p>
          </div>
          <div className="rounded-2xl bg-[var(--uy-sky-pale)] p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{content.rideLabels.seats}</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{ride.seatsLeft} {content.rideLabels.freeSeatsSuffix}</p>
          </div>
        </div>
        <div className="space-y-2 text-sm text-slate-600">
          <p>
            <span className="font-semibold text-slate-900">{content.rideLabels.driver}:</span> {ride.driverName} · {ride.driverRating}/5 · {ride.driverTrips} {content.rideLabels.tripCountSuffix}
          </p>
          <p>
            <span className="font-semibold text-slate-900">{content.rideLabels.vehicle}:</span> {ride.carModel}
          </p>
          {routeEstimate ? (
            <p>
              <span className="font-semibold text-slate-900">Trajet:</span> {routeEstimate}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {ride.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-[#d6c7b0] px-3 py-1 text-xs text-slate-600">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between gap-4 border-t border-black/5 pt-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{content.rideLabels.suggestedPrice}</p>
          <p className="font-serif text-3xl text-[var(--uy-deep)]">UYU {ride.priceUyu}</p>
        </div>
        <button className="rounded-full bg-[var(--uy-deep)] px-5 py-3 text-sm font-semibold text-[var(--uy-paper)] transition hover:bg-[var(--uy-deep-strong)]">
          {content.rideLabels.bookButton}
        </button>
      </div>
    </article>
  );
}