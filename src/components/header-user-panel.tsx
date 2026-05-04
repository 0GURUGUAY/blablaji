"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { isAdminEmail } from "@/lib/admin";
import { getLocalePath, type Locale } from "@/lib/locale";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { fetchOwnProfile, getProfileFallback } from "@/lib/supabase/profiles";

type HeaderUserPanelProps = {
  locale: Locale;
};

const copy = {
  es: {
    guest: "Invitado",
    guestHint: "Conectate para ver tu espacio",
    account: "Cuenta",
    guestAccountCta: "Sea parte",
    vehicle: "Vehiculo",
    messages: "Mensajes",
    admin: "Admin",
    signOut: "Salir",
  },
  fr: {
    guest: "Invite",
    guestHint: "Connecte-toi pour voir ton espace",
    account: "Compte",
    guestAccountCta: "Sea parte",
    vehicle: "Vehicule",
    messages: "Messages",
    admin: "Admin",
    signOut: "Sortir",
  },
} as const;

function getInitials(label: string) {
  const parts = label.split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "U";
}

function WelcomeArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M4.166 10h11.667" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="m10.833 5 5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HeaderUserPanel({ locale }: HeaderUserPanelProps) {
  const supabase = getSupabaseBrowserClient();
  const ui = copy[locale];
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<{ fullName: string; avatarUrl: string; homeCity: string } | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function hydrate(nextSession: Session | null) {
      if (!isMounted) {
        return;
      }

      setSession(nextSession);

      if (!nextSession?.user) {
        setProfile(null);
        return;
      }

      try {
        const existing = await fetchOwnProfile(supabase, nextSession.user.id);

        if (!isMounted) {
          return;
        }

        if (existing) {
          setProfile({ fullName: existing.fullName, avatarUrl: existing.avatarUrl, homeCity: existing.homeCity });
        } else {
          const fallback = getProfileFallback(nextSession.user);
          setProfile({ fullName: fallback.fullName, avatarUrl: fallback.avatarUrl, homeCity: fallback.homeCity });
        }
      } catch {
        const fallback = getProfileFallback(nextSession.user);
        if (isMounted) {
          setProfile({ fullName: fallback.fullName, avatarUrl: fallback.avatarUrl, homeCity: fallback.homeCity });
        }
      }
    }

    void supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        void hydrate(data.session);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (isMounted) {
        void hydrate(nextSession);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  const user = session?.user ?? null;
  const label = user ? profile?.fullName ?? getProfileFallback(user).fullName : ui.guest;
  const avatarUrl = user ? profile?.avatarUrl || null : null;
  const userEmail = user?.email ?? ui.guestHint;
  const isAdmin = isAdminEmail(user?.email);
  const accountHref = getLocalePath(locale, user ? "/account" : "/welcome");

  return (
    <div className="flex items-center gap-3 rounded-full border border-[var(--uy-line)] bg-[color:rgba(255,255,255,0.9)] px-2 py-2 shadow-[0_12px_30px_-24px_rgba(31,77,107,0.45)]">
      <div
        className={[
          "flex h-11 w-11 items-center justify-center rounded-full text-xs font-semibold uppercase tracking-[0.16em]",
          avatarUrl ? "bg-cover bg-center text-transparent" : "bg-[var(--uy-deep)] text-[var(--uy-paper)]",
        ].join(" ")}
        style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}
        aria-hidden="true"
      >
        {avatarUrl ? "avatar" : getInitials(label)}
      </div>

      <div className="min-w-0 pr-2">
        <div className="flex items-center gap-2">
          <p className="max-w-[9rem] truncate text-sm font-semibold text-slate-900">{label}</p>
          {isAdmin ? (
            <span className="rounded-full bg-[var(--uy-sun-soft)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--uy-deep-strong)]">
              Admin
            </span>
          ) : null}
        </div>
        <p className="max-w-[11rem] truncate text-xs text-slate-500">{userEmail}</p>
        {profile?.homeCity ? <p className="max-w-[11rem] truncate text-[11px] text-slate-400">{profile.homeCity}</p> : null}
      </div>

      <div className="flex items-center gap-1 border-l border-[var(--uy-line)] pl-2 text-xs font-semibold">
        <Link
          href={accountHref}
          className={[
            "inline-flex items-center gap-1.5 rounded-full px-3 py-2 transition",
            user
              ? "text-slate-600 hover:bg-[var(--uy-sky-soft)] hover:text-[var(--uy-deep)]"
              : "animate-pulse bg-[#e7ff3f] text-[#1f2a00] shadow-[0_0_18px_rgba(231,255,63,0.75)] hover:bg-[#ddff14]",
          ].join(" ")}
        >
          {user ? ui.account : ui.guestAccountCta}
          {!user ? <WelcomeArrowIcon /> : null}
        </Link>
        {user ? (
          <Link href={getLocalePath(locale, "/vehicle")} className="rounded-full px-3 py-2 text-slate-600 transition hover:bg-[var(--uy-sky-soft)] hover:text-[var(--uy-deep)]">
            {ui.vehicle}
          </Link>
        ) : (
          <span aria-disabled="true" className="cursor-not-allowed rounded-full px-3 py-2 text-slate-300">
            {ui.vehicle}
          </span>
        )}
        {user ? (
          <Link href={getLocalePath(locale, "/messages")} className="rounded-full px-3 py-2 text-slate-600 transition hover:bg-[var(--uy-sky-soft)] hover:text-[var(--uy-deep)]">
            {ui.messages}
          </Link>
        ) : (
          <span aria-disabled="true" className="cursor-not-allowed rounded-full px-3 py-2 text-slate-300">
            {ui.messages}
          </span>
        )}
        {isAdmin ? (
          <Link href={getLocalePath(locale, "/admin")} className="rounded-full px-3 py-2 text-slate-600 transition hover:bg-[var(--uy-sky-soft)] hover:text-[var(--uy-deep)]">
            {ui.admin}
          </Link>
        ) : null}
        {user ? (
          <button type="button" onClick={handleSignOut} className="rounded-full px-3 py-2 text-slate-600 transition hover:bg-[var(--uy-sky-soft)] hover:text-[var(--uy-deep)]">
            {ui.signOut}
          </button>
        ) : null}
      </div>
    </div>
  );
}