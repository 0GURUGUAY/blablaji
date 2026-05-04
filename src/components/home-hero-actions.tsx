"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getLocalizedContent } from "@/lib/content";
import { getLocalePath, type Locale } from "@/lib/locale";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type HomeHeroActionsProps = {
  locale: Locale;
};

export function HomeHeroActions({ locale }: HomeHeroActionsProps) {
  const content = getLocalizedContent(locale);
  const supabase = getSupabaseBrowserClient();
  const [session, setSession] = useState<Session | null>(null);

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
    <div className="flex flex-wrap gap-3">
      <Link href={getLocalePath(locale, "/trips")} className="rounded-full bg-[var(--uy-sun)] px-6 py-3 text-sm font-semibold text-[var(--uy-deep-strong)] transition hover:bg-[var(--uy-sun-soft)]">
        {content.home.searchCta}
      </Link>
      {session?.user ? (
        <Link href={getLocalePath(locale, "/publish")} className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-[var(--uy-paper)] transition hover:bg-white/10">
          {content.home.publishCta}
        </Link>
      ) : (
        <span aria-disabled="true" className="cursor-not-allowed rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-white/45">
          {content.home.publishCta}
        </span>
      )}
    </div>
  );
}