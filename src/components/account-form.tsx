"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { AccountTripManager } from "@/components/account-trip-manager";
import type { Locale } from "@/lib/locale";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { fetchOwnProfile, getProfileFallback, saveOwnProfile, type UserProfileDraft } from "@/lib/supabase/profiles";

type AccountFormProps = {
  locale: Locale;
};

const copy = {
  es: {
    eyebrow: "Cuenta",
    title: "Mi cuenta",
    description: "Gestiona tu identidad visible en la app: foto, nombre, telefono y ciudad de referencia.",
    loading: "Cargando tu perfil...",
    authRequired: "Inicia sesion para editar tu cuenta.",
    saveError: "No se pudo guardar tu perfil.",
    loadError: "No se pudo cargar tu perfil.",
    success: "Perfil actualizado correctamente.",
    photo: "Foto de perfil (URL)",
    fullName: "Nombre completo",
    phone: "Telefono",
    homeCity: "Ciudad de referencia",
    email: "Email",
    submitIdle: "Guardar perfil",
    submitLoading: "Guardando...",
  },
  fr: {
    eyebrow: "Compte",
    title: "Mon compte",
    description: "Gere ton identite visible dans l'application: photo, nom, telephone et ville de reference.",
    loading: "Chargement de ton profil...",
    authRequired: "Connecte-toi pour modifier ton compte.",
    saveError: "Impossible d'enregistrer ton profil.",
    loadError: "Impossible de charger ton profil.",
    success: "Profil mis a jour avec succes.",
    photo: "Photo de profil (URL)",
    fullName: "Nom complet",
    phone: "Telephone",
    homeCity: "Ville de reference",
    email: "Email",
    submitIdle: "Enregistrer le profil",
    submitLoading: "Enregistrement...",
  },
} as const;

export function AccountForm({ locale }: AccountFormProps) {
  const ui = copy[locale];
  const supabase = getSupabaseBrowserClient();
  const [session, setSession] = useState<Session | null>(null);
  const [form, setForm] = useState<UserProfileDraft>({
    fullName: "",
    avatarUrl: "",
    phone: "",
    homeCity: "Jose Ignacio",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function hydrate(nextSession: Session | null) {
      if (!isMounted) {
        return;
      }

      setSession(nextSession);
      setFeedback(null);
      setError(null);

      if (!nextSession?.user) {
        setIsLoading(false);
        return;
      }

      try {
        const existing = await fetchOwnProfile(supabase, nextSession.user.id);

        if (!isMounted) {
          return;
        }

        setForm(existing ? {
          fullName: existing.fullName,
          avatarUrl: existing.avatarUrl,
          phone: existing.phone,
          homeCity: existing.homeCity,
        } : getProfileFallback(nextSession.user));
      } catch (loadError) {
        if (isMounted) {
          setError(`${ui.loadError} ${loadError instanceof Error ? loadError.message : ""}`.trim());
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
  }, [supabase, ui.loadError]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session?.user) {
      setError(ui.authRequired);
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    setError(null);

    try {
      const saved = await saveOwnProfile(supabase, session.user, form);
      setForm({
        fullName: saved.fullName,
        avatarUrl: saved.avatarUrl,
        phone: saved.phone,
        homeCity: saved.homeCity,
      });
      setFeedback(ui.success);
    } catch (saveError) {
      setError(`${ui.saveError} ${saveError instanceof Error ? saveError.message : ""}`.trim());
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
        <aside className="rounded-[32px] bg-[linear-gradient(160deg,var(--uy-deep),#0a78d1)] p-8 text-[var(--uy-paper)]">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--uy-sky)]">{ui.eyebrow}</p>
          <h1 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl">{ui.title}</h1>
          <p className="mt-4 text-sm leading-6 text-[color:rgba(231,246,255,0.92)] sm:text-base">{ui.description}</p>
        </aside>

        <form className="grid gap-4 rounded-[32px] border border-[var(--uy-line)] bg-[color:rgba(255,255,255,0.9)] p-8 shadow-[0_20px_60px_-45px_rgba(19,89,135,0.35)]" onSubmit={handleSubmit}>
          {isLoading ? <p className="text-sm text-slate-600">{ui.loading}</p> : null}
          {!isLoading && !session?.user ? <p className="rounded-2xl bg-[var(--uy-sky-pale)] px-4 py-3 text-sm text-slate-600">{ui.authRequired}</p> : null}

          {form.avatarUrl ? (
            <div className="flex items-center gap-4 rounded-[28px] bg-[var(--uy-sky-pale)] p-4">
              <div className="h-16 w-16 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${form.avatarUrl})` }} />
              <div>
                <p className="text-sm font-semibold text-slate-900">{form.fullName || "-"}</p>
                <p className="text-xs text-slate-500">{session?.user?.email ?? ""}</p>
              </div>
            </div>
          ) : null}

          <label className="rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
            {ui.photo}
            <input type="url" value={form.avatarUrl} onChange={(event) => setForm((current) => ({ ...current, avatarUrl: event.target.value }))} className="mt-3 w-full bg-transparent text-base font-semibold text-slate-900 outline-none" />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
              {ui.fullName}
              <input type="text" required value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} className="mt-3 w-full bg-transparent text-base font-semibold text-slate-900 outline-none" />
            </label>
            <label className="rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
              {ui.phone}
              <input type="tel" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} className="mt-3 w-full bg-transparent text-base font-semibold text-slate-900 outline-none" />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
              {ui.homeCity}
              <input type="text" value={form.homeCity} onChange={(event) => setForm((current) => ({ ...current, homeCity: event.target.value }))} className="mt-3 w-full bg-transparent text-base font-semibold text-slate-900 outline-none" />
            </label>
            <div className="rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
              {ui.email}
              <div className="mt-3 break-all text-base font-semibold text-slate-900">{session?.user?.email ?? "-"}</div>
            </div>
          </div>

          {feedback ? <p className="text-sm text-[var(--uy-deep)]">{feedback}</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button disabled={isLoading || isSubmitting || !session?.user} className="mt-2 rounded-full bg-[var(--uy-deep)] px-5 py-4 text-sm font-semibold text-[var(--uy-paper)] disabled:cursor-not-allowed disabled:opacity-70">
            {isSubmitting ? ui.submitLoading : ui.submitIdle}
          </button>
        </form>
      </section>

      <AccountTripManager locale={locale} />
    </div>
  );
}