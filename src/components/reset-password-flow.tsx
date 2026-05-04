"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { getLocalePath, type Locale } from "@/lib/locale";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type ResetPasswordFlowProps = {
  locale: Locale;
};

const copy = {
  es: {
    badge: "Recuperacion",
    title: "Define una nueva contrasena",
    description: "Usa el enlace recibido por email para crear una nueva contrasena segura y volver a entrar en la app.",
    waiting: "Esperando un enlace valido de recuperacion...",
    invalid: "Este enlace ya no es valido o ha expirado. Solicita uno nuevo desde la pagina de acceso.",
    password: "Nueva contrasena",
    confirmPassword: "Confirmar contrasena",
    hint: "Minimo 6 caracteres.",
    mismatch: "Las contrasenas no coinciden.",
    submitIdle: "Guardar nueva contrasena",
    submitLoading: "Actualizando...",
    success: "Contrasena actualizada correctamente. Ya puedes iniciar sesion.",
    back: "Volver al acceso",
  },
  fr: {
    badge: "Recuperation",
    title: "Definis un nouveau mot de passe",
    description: "Utilise le lien recu par email pour creer un nouveau mot de passe securise et revenir dans l'application.",
    waiting: "En attente d'un lien de recuperation valide...",
    invalid: "Ce lien n'est plus valide ou a expire. Demande-en un nouveau depuis la page d'acces.",
    password: "Nouveau mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    hint: "6 caracteres minimum.",
    mismatch: "Les mots de passe ne correspondent pas.",
    submitIdle: "Enregistrer le nouveau mot de passe",
    submitLoading: "Mise a jour...",
    success: "Mot de passe mis a jour avec succes. Tu peux te connecter.",
    back: "Retour a l'acces",
  },
} as const;

export function ResetPasswordFlow({ locale }: ResetPasswordFlowProps) {
  const ui = copy[locale];
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [session, setSession] = useState<Session | null>(null);
  const [event, setEvent] = useState<AuthChangeEvent | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((nextEvent, nextSession) => {
      if (!isMounted) {
        return;
      }

      setEvent(nextEvent);
      setSession(nextSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSubmit(eventForm: React.FormEvent<HTMLFormElement>) {
    eventForm.preventDefault();
    setFeedback(null);
    setError(null);

    if (password !== confirmPassword) {
      setError(ui.mismatch);
      return;
    }

    setIsSubmitting(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setIsSubmitting(false);
      return;
    }

    setFeedback(ui.success);
    setPassword("");
    setConfirmPassword("");
    setIsSubmitting(false);
    router.replace(getLocalePath(locale, "/welcome"));
  }

  const hasRecoverySession = Boolean(session?.user);

  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_0.92fr] lg:items-start">
      <article className="overflow-hidden rounded-[36px] bg-[linear-gradient(145deg,var(--uy-deep),#0d6fb7_55%,#f6c64d_180%)] p-8 text-[var(--uy-paper)] shadow-[0_32px_80px_-48px_rgba(0,91,187,0.62)] sm:p-10">
        <div className="inline-flex rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs uppercase tracking-[0.28em] text-[var(--uy-sky)]">
          {ui.badge}
        </div>
        <h1 className="mt-6 max-w-3xl font-serif text-3xl leading-tight sm:text-5xl">{ui.title}</h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-[color:rgba(236,247,255,0.92)] sm:text-base">{ui.description}</p>
      </article>

      <article className="rounded-[32px] border border-[var(--uy-line)] bg-[color:rgba(255,255,255,0.94)] p-8 shadow-[0_24px_70px_-48px_rgba(31,77,107,0.32)]">
        {!hasRecoverySession ? (
          <div className="space-y-5">
            <p className="text-sm text-slate-500">{event === "PASSWORD_RECOVERY" ? ui.waiting : ui.invalid}</p>
            <Link href={getLocalePath(locale, "/welcome")} className="inline-flex rounded-full bg-[var(--uy-deep)] px-5 py-3 text-sm font-semibold text-[var(--uy-paper)]">
              {ui.back}
            </Link>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
              {ui.password}
              <input
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
                value={password}
                onChange={(eventInput) => setPassword(eventInput.target.value)}
                className="mt-2 w-full bg-transparent text-base font-semibold text-slate-900 outline-none"
                placeholder="••••••••"
              />
              <p className="mt-2 text-xs leading-5 text-slate-500">{ui.hint}</p>
            </label>

            <label className="block rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
              {ui.confirmPassword}
              <input
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
                value={confirmPassword}
                onChange={(eventInput) => setConfirmPassword(eventInput.target.value)}
                className="mt-2 w-full bg-transparent text-base font-semibold text-slate-900 outline-none"
                placeholder="••••••••"
              />
            </label>

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
        )}
      </article>
    </section>
  );
}