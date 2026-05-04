"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { AccountTripManager } from "@/components/account-trip-manager";
import { routeOptions } from "@/lib/data";
import { getLocalePath, type Locale } from "@/lib/locale";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { fetchOwnProfile, getProfileFallback, saveOwnProfile, type UserProfileDraft } from "@/lib/supabase/profiles";

type AccountFormProps = {
  locale: Locale;
  mode?: "account" | "onboarding";
  redirectPath?: "/account" | "/publish" | "/vehicle" | "/messages" | "/admin";
};

const copy = {
  es: {
    accountEyebrow: "Cuenta",
    accountTitle: "Mi cuenta",
    accountDescription: "Gestiona tu identidad visible en la app: foto, nombre, telefono y ciudad de referencia.",
    onboardingEyebrow: "Bienvenido",
    onboardingTitle: "Crea tu perfil",
    onboardingDescription: "Completa tu cuenta para aparecer correctamente en la app y empezar a publicar o reservar viajes.",
    loading: "Cargando tu perfil...",
    authRequired: "Inicia sesion para editar tu cuenta.",
    saveError: "No se pudo guardar tu perfil.",
    loadError: "No se pudo cargar tu perfil.",
    success: "Perfil actualizado correctamente.",
    onboardingSuccess: "Perfil creado correctamente.",
    photo: "Foto de perfil (URL)",
    photoHint: "Puedes usar una foto clara de rostro, LinkedIn o una imagen profesional.",
    fullName: "Nombre completo",
    phone: "Telefono",
    phoneHint: "Ayuda a generar confianza y facilita la coordinacion antes del viaje.",
    homeCity: "Ciudad de referencia",
    homeCityHint: "Debes elegir una ciudad ya disponible en la app.",
    email: "Email",
    submitIdle: "Guardar perfil",
    submitLoading: "Guardando...",
    onboardingSubmitIdle: "Crear mi cuenta",
    onboardingSubmitLoading: "Creando tu cuenta...",
    previewTitle: "Asi se vera tu perfil",
    previewTrust: "Perfil visible y confiable",
    onboardingPanelTitle: "Un perfil serio inspira confianza",
    onboardingPanelDescription: "Cuanto mas claro sea tu perfil, mas facil sera que otros usuarios acepten compartir un viaje contigo.",
    onboardingPoints: [
      "Tu nombre, foto y ciudad ayudan a generar confianza desde el primer vistazo.",
      "Podras modificar estos datos en cualquier momento desde tu cuenta.",
      "Un telefono completo facilita la coordinacion cuando un viaje ya esta confirmado.",
    ],
    onboardingAssurancesTitle: "Lo que haces hoy",
    onboardingAssurances: ["Crear tu identidad visible", "Preparar tu cuenta para reservar o publicar", "Entrar con una presencia mas profesional"],
  },
  fr: {
    accountEyebrow: "Compte",
    accountTitle: "Mon compte",
    accountDescription: "Gere ton identite visible dans l'application: photo, nom, telephone et ville de reference.",
    onboardingEyebrow: "Bienvenue",
    onboardingTitle: "Cree ton profil",
    onboardingDescription: "Complete ton compte pour apparaitre correctement dans l'application et commencer a publier ou reserver des trajets.",
    loading: "Chargement de ton profil...",
    authRequired: "Connecte-toi pour modifier ton compte.",
    saveError: "Impossible d'enregistrer ton profil.",
    loadError: "Impossible de charger ton profil.",
    success: "Profil mis a jour avec succes.",
    onboardingSuccess: "Profil cree avec succes.",
    photo: "Photo de profil (URL)",
    photoHint: "Tu peux utiliser une photo nette de visage, LinkedIn ou une image professionnelle.",
    fullName: "Nom complet",
    phone: "Telephone",
    phoneHint: "Cela aide a inspirer confiance et facilite la coordination avant le trajet.",
    homeCity: "Ville de reference",
    homeCityHint: "Tu dois choisir une ville deja disponible dans l'application.",
    email: "Email",
    submitIdle: "Enregistrer le profil",
    submitLoading: "Enregistrement...",
    onboardingSubmitIdle: "Creer mon compte",
    onboardingSubmitLoading: "Creation du compte...",
    previewTitle: "Apercu de ton profil",
    previewTrust: "Profil visible et rassurant",
    onboardingPanelTitle: "Un profil serieux inspire confiance",
    onboardingPanelDescription: "Plus ton profil est clair, plus il sera simple pour les autres utilisateurs d'accepter un trajet partage avec toi.",
    onboardingPoints: [
      "Ton nom, ta photo et ta ville rassurent des le premier regard.",
      "Tu pourras modifier ces donnees a tout moment depuis ton compte.",
      "Un numero complet facilite la coordination quand un trajet est confirme.",
    ],
    onboardingAssurancesTitle: "Ce que tu mets en place maintenant",
    onboardingAssurances: ["Une identite visible dans l'application", "Un compte pret a reserver ou publier", "Une presence plus professionnelle des le depart"],
  },
} as const;

export function AccountForm({ locale, mode = "account", redirectPath = "/account" }: AccountFormProps) {
  const ui = copy[locale];
  const router = useRouter();
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
  const isOnboarding = mode === "onboarding";
  const eyebrow = isOnboarding ? ui.onboardingEyebrow : ui.accountEyebrow;
  const title = isOnboarding ? ui.onboardingTitle : ui.accountTitle;
  const description = isOnboarding ? ui.onboardingDescription : ui.accountDescription;

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
      setFeedback(isOnboarding ? ui.onboardingSuccess : ui.success);

      if (isOnboarding) {
        router.replace(getLocalePath(locale, redirectPath));
      }
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
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--uy-sky)]">{eyebrow}</p>
          <h1 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl">{title}</h1>
          <p className="mt-4 text-sm leading-6 text-[color:rgba(231,246,255,0.92)] sm:text-base">{description}</p>

          {isOnboarding ? (
            <div className="mt-8 space-y-5">
              <div className="rounded-[28px] border border-white/10 bg-white/8 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--uy-sky)]">{ui.onboardingPanelTitle}</p>
                <p className="mt-3 text-sm leading-6 text-[color:rgba(231,246,255,0.92)]">{ui.onboardingPanelDescription}</p>
                <div className="mt-5 grid gap-3">
                  {ui.onboardingPoints.map((item, index) => (
                    <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--uy-sun)] text-xs font-semibold text-[var(--uy-deep-strong)]">
                        0{index + 1}
                      </div>
                      <p className="text-sm leading-6 text-[color:rgba(244,250,255,0.94)]">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.06))] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--uy-sky)]">{ui.onboardingAssurancesTitle}</p>
                <div className="mt-4 grid gap-3">
                  {ui.onboardingAssurances.map((item) => (
                    <div key={item} className="rounded-2xl bg-white/8 px-4 py-3 text-sm leading-6 text-[color:rgba(244,250,255,0.94)]">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </aside>

        <form className="grid gap-4 rounded-[32px] border border-[var(--uy-line)] bg-[color:rgba(255,255,255,0.9)] p-8 shadow-[0_20px_60px_-45px_rgba(19,89,135,0.35)]" onSubmit={handleSubmit}>
          {isLoading ? <p className="text-sm text-slate-600">{ui.loading}</p> : null}
          {!isLoading && !session?.user ? <p className="rounded-2xl bg-[var(--uy-sky-pale)] px-4 py-3 text-sm text-slate-600">{ui.authRequired}</p> : null}

          {isOnboarding ? (
            <div className="rounded-[28px] border border-[color:rgba(19,89,135,0.12)] bg-[linear-gradient(180deg,rgba(247,251,253,0.94),rgba(239,247,252,0.78))] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--uy-deep)]">{ui.previewTitle}</p>
              <div className="mt-4 flex items-center gap-4 rounded-[24px] bg-white px-4 py-4 shadow-[0_18px_40px_-34px_rgba(31,77,107,0.32)]">
                <div
                  className={["flex h-16 w-16 items-center justify-center rounded-full text-lg font-semibold uppercase", form.avatarUrl ? "bg-cover bg-center text-transparent" : "bg-[var(--uy-deep)] text-[var(--uy-paper)]"].join(" ")}
                  style={form.avatarUrl ? { backgroundImage: `url(${form.avatarUrl})` } : undefined}
                >
                  {form.avatarUrl ? "avatar" : (form.fullName.trim()[0] ?? "U")}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-slate-900">{form.fullName || "Tu nombre"}</p>
                  <p className="truncate text-sm text-slate-500">{session?.user?.email ?? "-"}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--uy-deep)]">{form.homeCity || "Jose Ignacio"} · {ui.previewTrust}</p>
                </div>
              </div>
            </div>
          ) : form.avatarUrl ? (
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
            <input type="url" value={form.avatarUrl} onChange={(event) => setForm((current) => ({ ...current, avatarUrl: event.target.value }))} className="mt-3 w-full bg-transparent text-base font-semibold text-slate-900 outline-none" placeholder="https://..." />
            <p className="mt-2 text-xs leading-5 text-slate-500">{ui.photoHint}</p>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
              {ui.fullName}
              <input type="text" required value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} className="mt-3 w-full bg-transparent text-base font-semibold text-slate-900 outline-none" placeholder={locale === "es" ? "Nombre y apellido" : "Nom et prenom"} />
            </label>
            <label className="rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
              {ui.phone}
              <input type="tel" required={isOnboarding} value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} className="mt-3 w-full bg-transparent text-base font-semibold text-slate-900 outline-none" placeholder={locale === "es" ? "+598 ..." : "+598 ..."} />
              <p className="mt-2 text-xs leading-5 text-slate-500">{ui.phoneHint}</p>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
              {ui.homeCity}
              <select value={form.homeCity} onChange={(event) => setForm((current) => ({ ...current, homeCity: event.target.value }))} className="mt-3 w-full bg-transparent text-base font-semibold text-slate-900 outline-none" required>
                {routeOptions.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs leading-5 text-slate-500">{ui.homeCityHint}</p>
            </label>
            <div className="rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
              {ui.email}
              <div className="mt-3 break-all text-base font-semibold text-slate-900">{session?.user?.email ?? "-"}</div>
            </div>
          </div>

          {feedback ? <p className="text-sm text-[var(--uy-deep)]">{feedback}</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button disabled={isLoading || isSubmitting || !session?.user} className="mt-2 rounded-full bg-[var(--uy-deep)] px-5 py-4 text-sm font-semibold text-[var(--uy-paper)] disabled:cursor-not-allowed disabled:opacity-70">
            {isSubmitting ? (isOnboarding ? ui.onboardingSubmitLoading : ui.submitLoading) : (isOnboarding ? ui.onboardingSubmitIdle : ui.submitIdle)}
          </button>
        </form>
      </section>

      {!isOnboarding ? <AccountTripManager locale={locale} /> : null}
    </div>
  );
}