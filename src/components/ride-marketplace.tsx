"use client";

import { startTransition, useEffect, useState } from "react";
import { RideCard } from "@/components/ride-card";
import { RouteAutocomplete } from "@/components/route-autocomplete";
import { SectionTitle } from "@/components/section-title";
import { UserRideOffers } from "@/components/user-ride-offers";
import { getLocalizedContent } from "@/lib/content";
import type { Locale } from "@/lib/locale";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { fetchPublicRideCatalog, type RideFilters } from "@/lib/supabase/rides";
import type { Ride } from "@/lib/types";

type RideMarketplaceProps = {
  locale: Locale;
  fallbackRides: Ride[];
};

function hasActiveFilters(filters: RideFilters) {
  return Boolean(filters.origin?.trim() || filters.destination?.trim() || filters.departureDate || filters.maxPriceUyu);
}

export function RideMarketplace({ locale, fallbackRides }: RideMarketplaceProps) {
  const content = getLocalizedContent(locale);
  const supabase = getSupabaseBrowserClient();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);

  async function loadCatalog(nextFilters: RideFilters) {
    const filtered = hasActiveFilters(nextFilters);

    setIsLoading(true);
    setError(null);

    try {
      const nextRides = await fetchPublicRideCatalog(supabase, locale, nextFilters);
      setRides(nextRides);
      setShowFallback(!filtered && nextRides.length === 0);
    } catch (loadError) {
      setRides([]);
      setShowFallback(!filtered);
      setError(loadError instanceof Error ? loadError.message : content.trips.catalogError);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function bootstrapCatalog() {
      try {
        const nextRides = await fetchPublicRideCatalog(supabase, locale, {});

        if (!isMounted) {
          return;
        }

        setRides(nextRides);
        setShowFallback(nextRides.length === 0);
        setError(null);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setRides([]);
        setShowFallback(true);
        setError(loadError instanceof Error ? loadError.message : content.trips.catalogError);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void bootstrapCatalog();

    return () => {
      isMounted = false;
    };
  }, [content.trips.catalogError, locale, supabase]);

  const displayedRides = showFallback ? fallbackRides : rides;

  return (
    <section className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
      <aside className="h-fit rounded-[32px] border border-[var(--uy-line)] bg-[color:rgba(255,255,255,0.88)] p-7 shadow-[0_20px_60px_-45px_rgba(19,89,135,0.35)]">
        <SectionTitle eyebrow={content.trips.eyebrow} title={content.trips.title} description={content.trips.description} />
        <form
          className="mt-8 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();

            startTransition(() => {
              void loadCatalog({
                origin,
                destination,
                departureDate: departureDate || undefined,
                maxPriceUyu: maxPrice ? Number(maxPrice) : undefined,
              });
            });
          }}
        >
          <label className="block rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
            {content.trips.origin}
            <RouteAutocomplete locale={locale} value={origin} onValueChange={setOrigin} placeholder={content.trips.origin} />
          </label>
          <label className="block rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
            {content.trips.destination}
            <RouteAutocomplete locale={locale} value={destination} onValueChange={setDestination} placeholder={content.trips.destination} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
              {content.trips.date}
              <input
                type="date"
                value={departureDate}
                onChange={(event) => setDepartureDate(event.target.value)}
                className="mt-3 w-full bg-transparent text-base font-semibold text-slate-900 outline-none"
              />
            </label>
            <label className="block rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
              {content.trips.maxPrice}
              <input
                type="number"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
                placeholder="400"
                className="mt-3 w-full bg-transparent text-base font-semibold text-slate-900 outline-none"
              />
            </label>
          </div>
          <label className="block rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
            {content.trips.preferences}
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {content.trips.preferenceOptions.map((item) => (
                <span key={item} className="rounded-full border border-[color:rgba(19,89,135,0.18)] px-3 py-2 text-slate-600">
                  {item}
                </span>
              ))}
            </div>
          </label>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-[var(--uy-deep)] px-5 py-4 text-sm font-semibold text-[var(--uy-paper)] disabled:cursor-wait disabled:opacity-80"
          >
            {content.trips.apply}
          </button>
        </form>
      </aside>

      <div className="space-y-6">
        <UserRideOffers locale={locale} />

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--uy-deep)]">{content.trips.resultsEyebrow}</p>
            <h1 className="mt-2 font-serif text-3xl text-slate-900 sm:text-4xl">{content.trips.resultsTitle}</h1>
          </div>
          <div className="rounded-full border border-black/5 bg-white/80 px-4 py-2 text-sm text-slate-500">{content.trips.sortLabel}</div>
        </div>

        {isLoading ? <p className="text-sm text-slate-500">{content.trips.catalogLoading}</p> : null}
        {!isLoading && error ? <p className="rounded-[24px] bg-red-50 px-5 py-4 text-sm text-red-600">{content.trips.catalogError}</p> : null}
        {!isLoading && showFallback ? <p className="rounded-[24px] bg-[var(--uy-sky-pale)] px-5 py-4 text-sm text-slate-600">{content.trips.catalogFallback}</p> : null}
        {!isLoading && !showFallback && displayedRides.length === 0 ? <p className="rounded-[24px] bg-[var(--uy-sky-pale)] px-5 py-4 text-sm text-slate-600">{content.trips.catalogEmpty}</p> : null}

        {displayedRides.length > 0 ? (
          <div className="grid gap-6 xl:grid-cols-2">
            {displayedRides.map((ride) => (
              <RideCard key={ride.id} ride={ride} locale={locale} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}