"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getLocalizedContent } from "@/lib/content";
import { getLocalePath, type Locale } from "@/lib/locale";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type HeaderNavigationProps = {
  locale: Locale;
};

export function HeaderNavigation({ locale }: HeaderNavigationProps) {
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

  const user = session?.user ?? null;
  const navigation = [
    { href: "/", label: content.navigation.home, requiresAuth: false },
    { href: "/trips", label: content.navigation.trips, requiresAuth: false },
    { href: "/publish", label: content.navigation.publish, requiresAuth: true },
    { href: "/messages", label: content.navigation.messages, requiresAuth: true },
  ];

  return (
    <nav className="items-center gap-2 rounded-full border border-[var(--uy-line)] bg-[color:rgba(255,255,255,0.84)] p-1 text-sm md:flex shadow-[0_12px_30px_-24px_rgba(31,77,107,0.45)]">
      {navigation.map((item) => {
        if (item.requiresAuth && !user) {
          return (
            <span
              key={item.href}
              aria-disabled="true"
              className="cursor-not-allowed rounded-full px-4 py-2 text-slate-300"
              title="Disponible apres connexion"
            >
              {item.label}
            </span>
          );
        }

        return (
          <Link
            key={item.href}
            href={getLocalePath(locale, item.href)}
            className="rounded-full px-4 py-2 text-slate-600 transition hover:bg-[var(--uy-deep)] hover:text-[var(--uy-paper)]"
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}