"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { AccountForm } from "@/components/account-form";
import { routeOptions } from "@/lib/data";
import { getLocalePath, type Locale } from "@/lib/locale";
import { isEmailVerified } from "@/lib/supabase/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { getAuthEmailRedirectUrl } from "@/lib/supabase/redirect-url";
import { fetchOwnProfile, saveOwnProfile, type UserProfileDraft } from "@/lib/supabase/profiles";

type WelcomeFlowProps = {
  locale: Locale;
  redirectPath: "/account" | "/publish" | "/vehicle" | "/messages" | "/admin";
};

function getStoredPendingDraft() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedDraft = window.sessionStorage.getItem("blablaji-pending-signup-profile");

  if (!storedDraft) {
    return null;
  }

  try {
    return JSON.parse(storedDraft) as UserProfileDraft;
  } catch {
    window.sessionStorage.removeItem("blablaji-pending-signup-profile");
    return null;
  }
}

function getStoredPendingEmail() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.sessionStorage.getItem("blablaji-pending-signup-email") ?? "";
}

const copy = {
  es: {
    badge: "Acceso seguro",
    title: "Crea tu cuenta con una presencia clara, sobria y confiable.",
    description: "Empieza con una identidad visible y profesional para reservar, publicar y conversar con tranquilidad dentro de la app.",
    trustTitle: "Por que esta pagina inspira confianza",
    trustItems: [
      "Tu cuenta se crea antes de completar tu perfil visible.",
      "Tus datos principales quedan claros desde el primer uso.",
      "La experiencia prioriza confianza, coordinacion y seriedad.",
    ],
    sideTitle: "Un acceso pensado para una comunidad local",
    sideDescription: "La primera impresion importa. Por eso la creacion de cuenta y el perfil se presentan como un recorrido unico, limpio y facil de completar.",
    metrics: ["Perfil visible", "Acceso por email", "Preparado para publicar y reservar"],
    formTitle: "Crea tu cuenta en un solo paso",
    formDescription: "Email, contrasena y perfil visible en el mismo formulario para que tu cuenta quede lista desde el principio.",
    email: "Email",
    password: "Contrasena",
    fullName: "Nombre completo",
    phone: "Telefono",
    homeCity: "Ciudad de referencia",
    avatarUrl: "Foto de perfil (URL)",
    avatarHint: "Opcional, pero una foto clara aumenta la confianza.",
    homeCityHint: "Elige una ciudad ya disponible en la app.",
    passwordHint: "Minimo 6 caracteres.",
    submitIdle: "Crear mi cuenta completa",
    submitLoading: "Creando cuenta...",
    success: "Cuenta creada y perfil guardado correctamente.",
    checkEmail: "Cuenta creada. Confirma tu email y vuelve para activar tu perfil completo.",
    autoSaveError: "La cuenta existe, pero no pudimos completar el perfil automaticamente.",
    verifyTitle: "Confirma tu email para activar la cuenta",
    verifyDescription: "Antes de completar tu perfil o entrar en la app, necesitamos que valides tu direccion de email desde el enlace enviado.",
    verifyPending: "Tu cuenta esta creada, pero sigue pendiente la validacion del email.",
    resendIdle: "Reenviar email de verificacion",
    resendLoading: "Reenviando...",
    resendSuccess: "Hemos reenviado el email de verificacion.",
    resendErrorMissing: "Necesitamos un email para reenviar la verificacion.",
    signOut: "Usar otra direccion",
  },
  fr: {
    badge: "Acces securise",
    title: "Cree ton compte avec une presence claire, sobre et rassurante.",
    description: "Commence avec une identite visible et professionnelle pour reserver, publier et echanger en toute confiance dans l'application.",
    trustTitle: "Pourquoi cette page inspire confiance",
    trustItems: [
      "Ton compte est cree avant de completer ton profil visible.",
      "Tes informations principales sont claires des le premier usage.",
      "L'experience privilegie confiance, coordination et serieux.",
    ],
    sideTitle: "Un acces pense pour une communaute locale",
    sideDescription: "La premiere impression compte. C'est pour cela que la creation de compte et le profil sont presentes comme un parcours unique, propre et simple a completer.",
    metrics: ["Profil visible", "Acces email", "Pret a publier et reserver"],
    formTitle: "Cree ton compte en une seule etape",
    formDescription: "Email, mot de passe et profil visible dans le meme formulaire pour que ton compte soit pret des le depart.",
    email: "Email",
    password: "Mot de passe",
    fullName: "Nom complet",
    phone: "Telephone",
    homeCity: "Ville de reference",
    avatarUrl: "Photo de profil (URL)",
    avatarHint: "Optionnel, mais une photo claire augmente la confiance.",
    homeCityHint: "Choisis une ville deja disponible dans l'application.",
    passwordHint: "6 caracteres minimum.",
    submitIdle: "Creer mon compte complet",
    submitLoading: "Creation du compte...",
    success: "Compte cree et profil enregistre avec succes.",
    checkEmail: "Compte cree. Confirme ton email puis reviens pour activer ton profil complet.",
    autoSaveError: "Le compte existe, mais le profil n'a pas pu etre complete automatiquement.",
    verifyTitle: "Confirme ton email pour activer le compte",
    verifyDescription: "Avant de completer ton profil ou d'entrer dans l'application, nous avons besoin que tu valides ton adresse email via le lien envoye.",
    verifyPending: "Ton compte est cree, mais la validation de l'email est encore en attente.",
    resendIdle: "Renvoyer l'email de verification",
    resendLoading: "Renvoi...",
    resendSuccess: "L'email de verification a ete renvoye.",
    resendErrorMissing: "Nous avons besoin d'un email pour renvoyer la verification.",
    signOut: "Utiliser une autre adresse",
  },
} as const;

export function WelcomeFlow({ locale, redirectPath }: WelcomeFlowProps) {
  const ui = copy[locale];
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingDraft, setPendingDraft] = useState<UserProfileDraft | null>(() => getStoredPendingDraft());
  const [email, setEmail] = useState(() => getStoredPendingEmail());
  const [password, setPassword] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [profileDraft, setProfileDraft] = useState<UserProfileDraft>({
    fullName: "",
    phone: "",
    homeCity: "Jose Ignacio",
    avatarUrl: "",
  });
  const verificationEmail = session?.user?.email ?? email;
  const isVerifiedSession = isEmailVerified(session?.user);

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

  useEffect(() => {
    let cancelled = false;

    async function finalizePendingProfile() {
      if (!session?.user || !pendingDraft || !isEmailVerified(session.user)) {
        return;
      }

      try {
        const existing = await fetchOwnProfile(supabase, session.user.id);

        if (existing || cancelled) {
          window.sessionStorage.removeItem("blablaji-pending-signup-profile");
          setPendingDraft(null);
          return;
        }

        await saveOwnProfile(supabase, session.user, pendingDraft);

        if (cancelled) {
          return;
        }

        window.sessionStorage.removeItem("blablaji-pending-signup-profile");
        setPendingDraft(null);
        router.replace(getLocalePath(locale, redirectPath));
      } catch {
        if (!cancelled) {
          setError(ui.autoSaveError);
        }
      }
    }

    void finalizePendingProfile();

    return () => {
      cancelled = true;
    };
  }, [locale, pendingDraft, redirectPath, router, session, supabase, ui.autoSaveError]);

  async function handleResendVerification() {
    if (!verificationEmail) {
      setError(ui.resendErrorMissing);
      return;
    }

    setIsResending(true);
    setFeedback(null);
    setError(null);

    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: verificationEmail,
      options: {
        emailRedirectTo: getAuthEmailRedirectUrl(locale),
      },
    });

    if (resendError) {
      setError(resendError.message);
      setIsResending(false);
      return;
    }

    setFeedback(ui.resendSuccess);
    setIsResending(false);
  }

  async function handleUseAnotherAddress() {
    setFeedback(null);
    setError(null);
    setPendingDraft(null);
    window.sessionStorage.removeItem("blablaji-pending-signup-profile");
    window.sessionStorage.removeItem("blablaji-pending-signup-email");
    setEmail("");
    setPassword("");

    if (session?.user) {
      await supabase.auth.signOut();
    }
  }

  async function handleSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    setError(null);

    const draft = {
      fullName: profileDraft.fullName.trim(),
      phone: profileDraft.phone.trim(),
      homeCity: profileDraft.homeCity.trim(),
      avatarUrl: profileDraft.avatarUrl.trim(),
    } satisfies UserProfileDraft;

    window.sessionStorage.setItem("blablaji-pending-signup-profile", JSON.stringify(draft));
  window.sessionStorage.setItem("blablaji-pending-signup-email", email);
    setPendingDraft(draft);

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAuthEmailRedirectUrl(locale),
        data: {
          full_name: draft.fullName,
          avatar_url: draft.avatarUrl || null,
          phone: draft.phone,
          home_city: draft.homeCity,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setIsSubmitting(false);
      return;
    }

    if (data.session?.user) {
      try {
        await saveOwnProfile(supabase, data.session.user, draft);
        window.sessionStorage.removeItem("blablaji-pending-signup-profile");
        window.sessionStorage.removeItem("blablaji-pending-signup-email");
        setPendingDraft(null);
        setFeedback(ui.success);
        router.replace(getLocalePath(locale, redirectPath));
        return;
      } catch (profileError) {
        setError(profileError instanceof Error ? profileError.message : ui.autoSaveError);
        setIsSubmitting(false);
        return;
      }
    }

    setFeedback(ui.checkEmail);
    setIsSubmitting(false);
  }

  if (isLoading) {
    return (
      <section className="rounded-[32px] border border-[var(--uy-line)] bg-[color:rgba(255,255,255,0.9)] p-8 text-sm text-slate-600 shadow-[0_20px_60px_-45px_rgba(19,89,135,0.35)]">
        Cargando acceso...
      </section>
    );
  }

  if (session?.user) {
    if (!isVerifiedSession) {
      return (
        <section className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
          <article className="overflow-hidden rounded-[36px] bg-[linear-gradient(145deg,var(--uy-deep),#0d6fb7_55%,#f6c64d_180%)] p-8 text-[var(--uy-paper)] shadow-[0_32px_80px_-48px_rgba(0,91,187,0.62)] sm:p-10">
            <div className="inline-flex rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs uppercase tracking-[0.28em] text-[var(--uy-sky)]">
              {ui.badge}
            </div>
            <h1 className="mt-6 max-w-3xl font-serif text-3xl leading-tight sm:text-5xl">{ui.verifyTitle}</h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[color:rgba(236,247,255,0.92)] sm:text-base">{ui.verifyDescription}</p>
          </article>

          <article className="rounded-[32px] border border-[var(--uy-line)] bg-[color:rgba(255,255,255,0.94)] p-8 shadow-[0_24px_70px_-48px_rgba(31,77,107,0.32)]">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--uy-deep)]">{ui.badge}</p>
            <h2 className="mt-4 font-serif text-2xl text-slate-900 sm:text-3xl">{ui.verifyPending}</h2>
            <p className="mt-3 break-all text-sm leading-7 text-slate-600">{verificationEmail || "-"}</p>

            {feedback ? <p className="mt-6 text-sm text-[var(--uy-deep)]">{feedback}</p> : null}
            {error ? <p className="mt-6 text-sm text-red-600">{error}</p> : null}

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={isResending}
                className="rounded-full bg-[var(--uy-deep)] px-5 py-3 text-sm font-semibold text-[var(--uy-paper)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isResending ? ui.resendLoading : ui.resendIdle}
              </button>
              <button
                type="button"
                onClick={handleUseAnotherAddress}
                className="rounded-full border border-[color:rgba(19,89,135,0.18)] px-5 py-3 text-sm font-semibold text-[var(--uy-deep)]"
              >
                {ui.signOut}
              </button>
            </div>
          </article>
        </section>
      );
    }

    window.sessionStorage.removeItem("blablaji-pending-signup-email");
    return <AccountForm locale={locale} mode="onboarding" redirectPath={redirectPath} />;
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
      <article className="overflow-hidden rounded-[36px] bg-[linear-gradient(145deg,var(--uy-deep),#0d6fb7_55%,#f6c64d_180%)] p-8 text-[var(--uy-paper)] shadow-[0_32px_80px_-48px_rgba(0,91,187,0.62)] sm:p-10">
        <div className="inline-flex rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs uppercase tracking-[0.28em] text-[var(--uy-sky)]">
          {ui.badge}
        </div>
        <h1 className="mt-6 max-w-3xl font-serif text-3xl leading-tight sm:text-5xl">{ui.title}</h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-[color:rgba(236,247,255,0.92)] sm:text-base">{ui.description}</p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {ui.metrics.map((metric) => (
            <div key={metric} className="rounded-[24px] border border-white/10 bg-white/8 px-4 py-4 text-sm font-semibold text-[color:rgba(246,251,255,0.96)]">
              {metric}
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.06))] p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--uy-sky)]">{ui.trustTitle}</p>
          <div className="mt-5 grid gap-3">
            {ui.trustItems.map((item, index) => (
              <div key={item} className="flex items-start gap-3 rounded-[22px] bg-white/8 px-4 py-4">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--uy-sun)] text-xs font-semibold text-[var(--uy-deep-strong)]">
                  0{index + 1}
                </div>
                <p className="text-sm leading-6 text-[color:rgba(244,250,255,0.94)]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </article>

      <div className="space-y-6">
        <article className="rounded-[32px] border border-[var(--uy-line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,251,253,0.88))] p-6 shadow-[0_24px_70px_-48px_rgba(31,77,107,0.32)] sm:p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--uy-deep)]">BlablaJI</p>
          <h2 className="mt-4 font-serif text-2xl text-slate-900 sm:text-3xl">{ui.sideTitle}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">{ui.sideDescription}</p>
        </article>

        <article className="rounded-[32px] border border-[var(--uy-line)] bg-[color:rgba(255,255,255,0.94)] p-8 shadow-[0_24px_70px_-48px_rgba(31,77,107,0.32)]">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--uy-deep)]">{ui.badge}</p>
          <h3 className="mt-4 font-serif text-2xl text-slate-900 sm:text-3xl">{ui.formTitle}</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">{ui.formDescription}</p>

          <form className="mt-6 space-y-4" onSubmit={handleSignup}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
                {ui.email}
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full bg-transparent text-base font-semibold text-slate-900 outline-none"
                  placeholder="nombre@ejemplo.uy"
                />
              </label>
              <label className="block rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
                {ui.password}
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 w-full bg-transparent text-base font-semibold text-slate-900 outline-none"
                  placeholder="••••••••"
                />
                <p className="mt-2 text-xs leading-5 text-slate-500">{ui.passwordHint}</p>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
                {ui.fullName}
                <input
                  type="text"
                  required
                  value={profileDraft.fullName}
                  onChange={(event) => setProfileDraft((current) => ({ ...current, fullName: event.target.value }))}
                  className="mt-2 w-full bg-transparent text-base font-semibold text-slate-900 outline-none"
                  placeholder={locale === "es" ? "Nombre y apellido" : "Nom et prenom"}
                />
              </label>
              <label className="block rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
                {ui.phone}
                <input
                  type="tel"
                  required
                  value={profileDraft.phone}
                  onChange={(event) => setProfileDraft((current) => ({ ...current, phone: event.target.value }))}
                  className="mt-2 w-full bg-transparent text-base font-semibold text-slate-900 outline-none"
                  placeholder="+598 ..."
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
                {ui.homeCity}
                <select
                  required
                  value={profileDraft.homeCity}
                  onChange={(event) => setProfileDraft((current) => ({ ...current, homeCity: event.target.value }))}
                  className="mt-2 w-full bg-transparent text-base font-semibold text-slate-900 outline-none"
                >
                  {routeOptions.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs leading-5 text-slate-500">{ui.homeCityHint}</p>
              </label>
              <label className="block rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
                {ui.avatarUrl}
                <input
                  type="url"
                  value={profileDraft.avatarUrl}
                  onChange={(event) => setProfileDraft((current) => ({ ...current, avatarUrl: event.target.value }))}
                  className="mt-2 w-full bg-transparent text-base font-semibold text-slate-900 outline-none"
                  placeholder="https://..."
                />
                <p className="mt-2 text-xs leading-5 text-slate-500">{ui.avatarHint}</p>
              </label>
            </div>

            {feedback ? <p className="text-sm text-[var(--uy-deep)]">{feedback}</p> : null}
            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-[var(--uy-deep)] px-5 py-3 text-sm font-semibold text-[var(--uy-paper)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? ui.submitLoading : ui.submitIdle}
            </button>
          </form>
        </article>
      </div>
    </section>
  );
}