"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getLocalizedContent } from "@/lib/content";
import type { Locale } from "@/lib/locale";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { reserveRideSeat } from "@/lib/supabase/rides";
import { formatRouteEstimate, getRouteEstimate } from "@/lib/route-estimate";
import type { Ride } from "@/lib/types";

type RideCardProps = {
  ride: Ride;
  locale: Locale;
};

export function RideCard({ ride, locale }: RideCardProps) {
  const content = getLocalizedContent(locale);
  const supabase = getSupabaseBrowserClient();
  const [session, setSession] = useState<Session | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasBooked, setHasBooked] = useState(false);
  const routeEstimate = formatRouteEstimate(locale, getRouteEstimate(ride.origin, ride.destination));
  const ui = locale === "fr"
    ? {
        bookingSuccess: "Place reservee. Le conducteur verra ta demande.",
        bookingLoading: "Reservation...",
        bookingUnavailable: "Reservation indisponible sur cette carte.",
        ownRideError: "Tu ne peux pas reserver une place sur ton propre trajet.",
        duplicateError: "Tu as deja une reservation sur ce trajet.",
        fullError: "Il n'y a plus assez de places disponibles.",
        genericError: "Impossible de reserver cette place pour le moment.",
        bookedLabel: "Place reservee",
      }
    : {
        bookingSuccess: "Plaza reservada. El conductor vera tu solicitud.",
        bookingLoading: "Reservando...",
        bookingUnavailable: "La reserva no esta disponible en esta tarjeta.",
        ownRideError: "No puedes reservar un asiento en tu propio viaje.",
        duplicateError: "Ya tienes una reserva en este viaje.",
        fullError: "Ya no quedan plazas suficientes disponibles.",
        genericError: "No se pudo reservar este asiento por ahora.",
        bookedLabel: "Plaza reservada",
      };

  function getBookingErrorMessage(message: string) {
    const normalized = message.toLowerCase();

    if (normalized.includes("your own ride")) {
      return ui.ownRideError;
    }

    if (normalized.includes("already booked")) {
      return ui.duplicateError;
    }

    if (normalized.includes("not enough seats") || normalized.includes("not bookable")) {
      return ui.fullError;
    }

    if (normalized.includes("not found") || normalized.includes("could not be created")) {
      return ui.bookingUnavailable;
    }

    return ui.genericError;
  }

  async function handleBooking() {
    if (!ride.isBookable) {
      setError(ui.bookingUnavailable);
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    setError(null);

    try {
      await reserveRideSeat(supabase, ride.id);
      setHasBooked(true);
      setFeedback(ui.bookingSuccess);
    } catch (bookingError) {
      const message = bookingError instanceof Error ? bookingError.message : "";
      setError(getBookingErrorMessage(message));
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (isMounted) {
        setSession(nextSession);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

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
        {session?.user && ride.isBookable ? (
          <button
            type="button"
            onClick={handleBooking}
            disabled={isSubmitting || hasBooked}
            className="rounded-full bg-[var(--uy-deep)] px-5 py-3 text-sm font-semibold text-[var(--uy-paper)] transition hover:bg-[var(--uy-deep-strong)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {hasBooked ? ui.bookedLabel : isSubmitting ? ui.bookingLoading : content.rideLabels.bookButton}
          </button>
        ) : (
          <span aria-disabled="true" className="cursor-not-allowed rounded-full bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-400">
            {content.rideLabels.bookButton}
          </span>
        )}
      </div>
      {feedback ? <p className="mt-3 text-sm text-[var(--uy-deep)]">{feedback}</p> : null}
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </article>
  );
}