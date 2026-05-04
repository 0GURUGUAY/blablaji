"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { RideCard } from "@/components/ride-card";
import { SectionTitle } from "@/components/section-title";
import { getLocalizedContent } from "@/lib/content";
import type { Locale } from "@/lib/locale";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { fetchOwnRideOffers } from "@/lib/supabase/rides";
import type { Ride } from "@/lib/types";

type UserRideOffersProps = {
  locale: Locale;
};

export function UserRideOffers({ locale }: UserRideOffersProps) {
  const content = getLocalizedContent(locale).trips;
  const supabase = getSupabaseBrowserClient();
  const [session, setSession] = useState<Session | null>(null);
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function hydrate(nextSession: Session | null) {
      if (!isMounted) {
        return;
      }

      setSession(nextSession);
      setError(null);

      if (!nextSession?.user) {
        setRides([]);
        setIsLoading(false);
        return;
      }

      try {
        const nextRides = await fetchOwnRideOffers(supabase, nextSession.user.id, locale);

        if (!isMounted) {
          return;
        }

        setRides(nextRides);
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Error");
        }
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
  }, [locale, supabase]);

  return (
    <section className="space-y-6">
      <SectionTitle eyebrow={content.offersEyebrow} title={content.offersTitle} description={content.offersDescription} />

      {isLoading ? <p className="text-sm text-slate-500">{content.offersLoading}</p> : null}
      {!isLoading && !session?.user ? <p className="rounded-[24px] bg-[var(--uy-sky-pale)] px-5 py-4 text-sm text-slate-600">{content.offersAuth}</p> : null}
      {!isLoading && session?.user && !error && rides.length === 0 ? <p className="rounded-[24px] bg-[var(--uy-sky-pale)] px-5 py-4 text-sm text-slate-600">{content.offersEmpty}</p> : null}
      {error ? <p className="rounded-[24px] bg-red-50 px-5 py-4 text-sm text-red-600">{error}</p> : null}

      {rides.length > 0 ? (
        <div className="grid gap-6 xl:grid-cols-2">
          {rides.map((ride) => (
            <RideCard key={ride.id} ride={ride} locale={locale} />
          ))}
        </div>
      ) : null}
    </section>
  );
}