"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { isAdminEmail } from "@/lib/admin";
import { getLocalizedContent } from "@/lib/content";
import type { Locale } from "@/lib/locale";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthCardProps = {
  locale: Locale;
};

export function AuthCard({ locale }: AuthCardProps) {
  const content = getLocalizedContent(locale).home;
  const supabase = getSupabaseBrowserClient();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!isMounted) {
        return;
      }

      if (sessionError) {
        setError(sessionError.message);
        return;
      }

      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) {
        return;
      }

      setSession(nextSession);
      setPassword("");
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    setError(null);

    const action = mode === "sign-in"
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password });

    const { data, error: authError } = await action;

    if (authError) {
      setError(authError.message);
      setIsSubmitting(false);
      return;
    }

    setSession(data.session ?? null);
    setFeedback(data.session ? content.authSuccess : content.authCheckEmail);
    setIsSubmitting(false);
  }

  async function handleSignOut() {
    setFeedback(null);
    setError(null);
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      setError(signOutError.message);
      return;
    }

    setSession(null);
  }

  return (
    <article className="rounded-[32px] bg-[color:rgba(255,255,255,0.88)] p-8 shadow-[0_20px_70px_-45px_rgba(19,89,135,0.4)]">
      <p className="text-xs uppercase tracking-[0.28em] text-[var(--uy-deep)]">{content.authEyebrow}</p>
      <h3 className="mt-4 font-serif text-2xl text-slate-900 sm:text-3xl">{content.authTitle}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{content.authDescription}</p>

      {session?.user.email ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
            {content.signedInAs}
            <div className="mt-2 break-all text-base font-semibold text-slate-900">{session.user.email}</div>
          </div>
          {isAdminEmail(session.user.email) ? (
            <div className="inline-flex rounded-full bg-[var(--uy-sun-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--uy-deep-strong)]">
              Admin
            </div>
          ) : null}
          {feedback ? <p className="text-sm text-[var(--uy-deep)]">{feedback}</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-full border border-[color:rgba(19,89,135,0.18)] px-5 py-3 text-sm font-semibold text-[var(--uy-deep)]"
          >
            {content.authSignOut}
          </button>
        </div>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="inline-flex rounded-full border border-[var(--uy-line)] bg-[var(--uy-sky-pale)] p-1 text-sm">
            <button
              type="button"
              onClick={() => setMode("sign-in")}
              className={[
                "rounded-full px-4 py-2 transition",
                mode === "sign-in" ? "bg-[var(--uy-deep)] text-[var(--uy-paper)]" : "text-slate-600",
              ].join(" ")}
            >
              {content.signIn}
            </button>
            <button
              type="button"
              onClick={() => setMode("sign-up")}
              className={[
                "rounded-full px-4 py-2 transition",
                mode === "sign-up" ? "bg-[var(--uy-deep)] text-[var(--uy-paper)]" : "text-slate-600",
              ].join(" ")}
            >
              {content.signUp}
            </button>
          </div>

          <label className="block rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
            {content.email}
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full bg-transparent text-base font-semibold text-slate-900 outline-none"
              placeholder="nom@exemple.uy"
            />
          </label>

          <label className="block rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
            {content.password}
            <input
              type="password"
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
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
            {isSubmitting ? content.authSubmitLoading : content.authSubmitIdle}
          </button>
        </form>
      )}
    </article>
  );
}