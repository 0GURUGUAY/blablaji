"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { RouteAutocomplete } from "@/components/route-autocomplete";
import { getLocalizedContent, routeOptions } from "@/lib/content";
import { getLocalePath, type Locale } from "@/lib/locale";
import { formatRouteEstimate, getRouteEstimate } from "@/lib/route-estimate";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { createRide } from "@/lib/supabase/rides";
import { fetchDriverVehicle, type DriverVehicleRecord } from "@/lib/supabase/vehicles";

type PublishRideFormProps = {
  locale: Locale;
};

export function PublishRideForm({ locale }: PublishRideFormProps) {
  const content = getLocalizedContent(locale).publish;
  const supabase = getSupabaseBrowserClient();
  const [session, setSession] = useState<Session | null>(null);
  const [vehicle, setVehicle] = useState<DriverVehicleRecord | null>(null);
  const [form, setForm] = useState({
    origin: routeOptions[0],
    destination: routeOptions[1],
    departureDate: "",
    departureTime: "18:10",
    seatsTotal: 1,
    seatPriceUyu: 320,
    notes: content.detailsValue,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const routeEstimate = formatRouteEstimate(locale, getRouteEstimate(form.origin, form.destination));

  useEffect(() => {
    let isMounted = true;

    async function hydrate(nextSession: Session | null) {
      if (!isMounted) {
        return;
      }

      setSession(nextSession);
      setError(null);
      setFeedback(null);

      if (!nextSession?.user) {
        setVehicle(null);
        setIsLoading(false);
        return;
      }

      try {
        const nextVehicle = await fetchDriverVehicle(supabase, nextSession.user.id);

        if (!isMounted) {
          return;
        }

        setVehicle(nextVehicle);
        if (nextVehicle) {
          setForm((current) => ({
            ...current,
            seatsTotal: Math.min(current.seatsTotal, nextVehicle.seats) || 1,
          }));
        }
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(`${content.loadError} ${loadError instanceof Error ? loadError.message : ""}`.trim());
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void supabase.auth.getSession().then(({ data }) => {
      void hydrate(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setIsLoading(true);
      void hydrate(nextSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [content.detailsValue, content.loadError, supabase]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session?.user) {
      setError(content.authRequired);
      return;
    }

    if (!vehicle) {
      setError(content.vehicleRequiredDescription);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setFeedback(null);

    try {
      await createRide(supabase, session.user, {
        vehicleId: vehicle.id,
        origin: form.origin,
        destination: form.destination,
        departureDate: form.departureDate,
        departureTime: form.departureTime,
        seatsTotal: Math.min(form.seatsTotal, vehicle.seats),
        seatPriceUyu: form.seatPriceUyu,
        notes: form.notes,
      });
      setFeedback(content.success);
    } catch (saveError) {
      setError(`${content.saveError} ${saveError instanceof Error ? saveError.message : ""}`.trim());
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-4 rounded-[32px] border border-[var(--uy-line)] bg-[color:rgba(255,255,255,0.9)] p-8 shadow-[0_20px_60px_-45px_rgba(19,89,135,0.35)]" onSubmit={handleSubmit}>
      {isLoading ? <p className="text-sm text-slate-600">{content.loading}</p> : null}
      {!isLoading && !session?.user ? <p className="rounded-2xl bg-[var(--uy-sky-pale)] px-4 py-3 text-sm text-slate-600">{content.authRequired}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
          {content.origin}
          <RouteAutocomplete locale={locale} value={form.origin} onValueChange={(nextValue) => setForm((current) => ({ ...current, origin: nextValue }))} placeholder={content.origin} />
        </label>
        <label className="rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
          {content.destination}
          <RouteAutocomplete locale={locale} value={form.destination} onValueChange={(nextValue) => setForm((current) => ({ ...current, destination: nextValue }))} placeholder={content.destination} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
          {content.date}
          <input type="date" required value={form.departureDate} onChange={(event) => setForm((current) => ({ ...current, departureDate: event.target.value }))} className="mt-3 w-full bg-transparent text-base font-semibold text-slate-900 outline-none" />
        </label>
        <label className="rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
          {content.time}
          <input type="time" required value={form.departureTime} onChange={(event) => setForm((current) => ({ ...current, departureTime: event.target.value }))} className="mt-3 w-full bg-transparent text-base font-semibold text-slate-900 outline-none" />
        </label>
        <label className="rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
          {content.seats}
          <input type="number" min="1" max={vehicle?.seats ?? 8} required value={form.seatsTotal} onChange={(event) => setForm((current) => ({ ...current, seatsTotal: Number(event.target.value) || 1 }))} className="mt-3 w-full bg-transparent text-base font-semibold text-slate-900 outline-none" />
          <p className="mt-2 text-xs leading-5 text-slate-500">{content.seatsHelp}</p>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
          {content.suggestedPrice}
          <input type="number" min="1" required value={form.seatPriceUyu} onChange={(event) => setForm((current) => ({ ...current, seatPriceUyu: Number(event.target.value) || 1 }))} className="mt-3 w-full bg-transparent text-base font-semibold text-slate-900 outline-none" />
        </label>
        <div className="rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
          {content.currentVehicle}
          <div className="mt-3 text-base font-semibold text-slate-900">
            {vehicle ? `${vehicle.brand} ${vehicle.model} · ${vehicle.plateNumber}` : "-"}
          </div>
        </div>
      </div>

      {routeEstimate ? (
        <div className="rounded-[28px] border border-[var(--uy-line)] bg-[color:rgba(0,91,187,0.04)] px-4 py-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">{form.origin} → {form.destination}</p>
          <p className="mt-2">{routeEstimate}</p>
        </div>
      ) : null}

      {!vehicle && !isLoading ? (
        <div className="rounded-[28px] border border-[var(--uy-line)] bg-[color:rgba(0,91,187,0.04)] p-4 text-sm leading-6 text-slate-600">
          <p className="font-semibold text-slate-900">{content.vehicleRequiredTitle}</p>
          <p className="mt-2">{content.vehicleRequiredDescription}</p>
          <Link href={getLocalePath(locale, "/vehicle")} className="mt-4 inline-flex text-sm font-semibold text-[var(--uy-deep)]">
            {content.vehicleCta}
          </Link>
        </div>
      ) : null}

      <label className="rounded-[28px] bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
        {content.details}
        <textarea rows={6} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} className="mt-3 w-full resize-none bg-transparent text-base font-semibold text-slate-900 outline-none" />
      </label>
      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
        {content.tags.map((item) => (
          <span key={item} className="rounded-full border border-[color:rgba(19,89,135,0.18)] px-3 py-2">
            {item}
          </span>
        ))}
      </div>

      {feedback ? <p className="text-sm text-[var(--uy-deep)]">{feedback}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button disabled={isLoading || isSubmitting || !session?.user || !vehicle} className="mt-2 rounded-full bg-[var(--uy-deep)] px-5 py-4 text-sm font-semibold text-[var(--uy-paper)] disabled:cursor-not-allowed disabled:opacity-70">
        {isSubmitting ? content.submitLoading : content.submitIdle}
      </button>
    </form>
  );
}