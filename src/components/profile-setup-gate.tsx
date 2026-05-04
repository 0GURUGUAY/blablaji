"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getLocalePath, type Locale } from "@/lib/locale";
import { isEmailVerified } from "@/lib/supabase/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { fetchOwnProfile } from "@/lib/supabase/profiles";

type ProfileSetupGateProps = {
  locale: Locale;
  currentPath: "/account" | "/publish" | "/vehicle" | "/messages" | "/admin";
  children: React.ReactNode;
};

const copy = {
  es: {
    checking: "Verificando tu perfil...",
    redirecting: "Te llevamos a la creacion de tu cuenta para completar tu perfil y validar tu email antes de continuar.",
  },
  fr: {
    checking: "Verification de ton profil...",
    redirecting: "Redirection vers la creation de compte pour completer ton profil et valider ton email avant de continuer.",
  },
} as const;

export function ProfileSetupGate({ locale, currentPath, children }: ProfileSetupGateProps) {
  const ui = copy[locale];
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [status, setStatus] = useState<"loading" | "redirecting" | "ready">("loading");

  useEffect(() => {
    let isMounted = true;

    async function validateProfile(nextSession: Session | null) {
      if (!isMounted) {
        return;
      }

      if (!nextSession?.user) {
        setStatus("ready");
        return;
      }

      if (!isEmailVerified(nextSession.user)) {
        setStatus("redirecting");
        router.replace(`${getLocalePath(locale, "/welcome")}?next=${encodeURIComponent(currentPath)}`);
        return;
      }

      try {
        const profile = await fetchOwnProfile(supabase, nextSession.user.id);

        if (!isMounted) {
          return;
        }

        if (!profile) {
          setStatus("redirecting");
          router.replace(`${getLocalePath(locale, "/welcome")}?next=${encodeURIComponent(currentPath)}`);
          return;
        }

        setStatus("ready");
      } catch {
        if (isMounted) {
          setStatus("ready");
        }
      }
    }

    void supabase.auth.getSession().then(({ data }) => {
      void validateProfile(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setStatus("loading");
      void validateProfile(nextSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [currentPath, locale, router, supabase]);

  if (status !== "ready") {
    return (
      <section className="rounded-[32px] border border-[var(--uy-line)] bg-[color:rgba(255,255,255,0.92)] p-8 shadow-[0_20px_60px_-45px_rgba(19,89,135,0.35)]">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--uy-deep)]">BlablaJI</p>
        <h1 className="mt-4 font-serif text-2xl text-slate-900 sm:text-3xl">{ui.checking}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{ui.redirecting}</p>
      </section>
    );
  }

  return <>{children}</>;
}