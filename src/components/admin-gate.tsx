"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { isAdminEmail } from "@/lib/admin";
import { getLocalizedContent } from "@/lib/content";
import type { Locale } from "@/lib/locale";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type AdminGateProps = {
  locale: Locale;
  children: React.ReactNode;
};

export function AdminGate({ locale, children }: AdminGateProps) {
  const content = getLocalizedContent(locale).admin;
  const supabase = getSupabaseBrowserClient();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return;
      }

      setSession(data.session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) {
        return;
      }

      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  if (isLoading) {
    return (
      <section className="rounded-[32px] border border-[var(--uy-line)] bg-[color:rgba(255,255,255,0.88)] p-8 text-sm text-slate-600 shadow-[0_20px_60px_-45px_rgba(19,89,135,0.35)]">
        {content.accessLoading}
      </section>
    );
  }

  if (!isAdminEmail(session?.user.email)) {
    return (
      <section className="rounded-[32px] border border-[var(--uy-line)] bg-[color:rgba(255,255,255,0.9)] p-8 shadow-[0_20px_60px_-45px_rgba(19,89,135,0.35)]">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--uy-deep)]">{content.eyebrow}</p>
        <h1 className="mt-4 font-serif text-2xl text-slate-900 sm:text-3xl">{content.accessDeniedTitle}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{content.accessDeniedDescription}</p>
        <p className="mt-4 rounded-2xl bg-[var(--uy-sky-pale)] px-4 py-3 text-sm text-slate-600">{content.accessDeniedHint}</p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-full bg-[var(--uy-sky-pale)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--uy-deep)]">
        {content.accessGranted}
      </div>
      {children}
    </div>
  );
}