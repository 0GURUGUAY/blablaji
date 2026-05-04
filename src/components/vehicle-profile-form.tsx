"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getLocalizedContent } from "@/lib/content";
import type { Locale } from "@/lib/locale";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  fetchDriverVehicle,
  saveDriverVehicle,
  type DriverVehicleDraft,
} from "@/lib/supabase/vehicles";

type VehicleProfileFormProps = {
  locale: Locale;
};

export function VehicleProfileForm({ locale }: VehicleProfileFormProps) {
  const content = getLocalizedContent(locale).vehicleProfile;
  const supabase = getSupabaseBrowserClient();
  const [session, setSession] = useState<Session | null>(null);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [form, setForm] = useState<DriverVehicleDraft>({
    brand: "",
    model: "",
    color: "",
    plateNumber: "",
    seats: 4,
    luggagePolicy: "",
    insuranceProvider: "",
    policyNumber: "",
    insuranceExpiry: "",
    insuranceDocumentPath: "",
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function hydrate(nextSession: Session | null) {
      if (!isMounted) {
        return;
      }

      setSession(nextSession);
      setError(null);
      setFeedback(null);

      if (!nextSession?.user) {
        setVehicleId(null);
        setForm({
          brand: "",
          model: "",
          color: "",
          plateNumber: "",
          seats: 4,
          luggagePolicy: "",
          insuranceProvider: "",
          policyNumber: "",
          insuranceExpiry: "",
          insuranceDocumentPath: "",
        });
        setIsLoading(false);
        return;
      }

      try {
        const vehicle = await fetchDriverVehicle(supabase, nextSession.user.id);

        if (!isMounted) {
          return;
        }

        if (vehicle) {
          setVehicleId(vehicle.id);
          setForm({
            brand: vehicle.brand,
            model: vehicle.model,
            color: vehicle.color,
            plateNumber: vehicle.plateNumber,
            seats: vehicle.seats,
            luggagePolicy: vehicle.luggagePolicy,
            insuranceProvider: vehicle.insuranceProvider,
            policyNumber: vehicle.policyNumber,
            insuranceExpiry: vehicle.insuranceExpiry,
            insuranceDocumentPath: vehicle.insuranceDocumentPath,
          });
        } else {
          setVehicleId(null);
        }
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(`${content.loadError} ${loadError instanceof Error ? loadError.message : ""}`.trim());
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
  }, [content.loadError, supabase]);

  function updateField<Key extends keyof DriverVehicleDraft>(key: Key, value: DriverVehicleDraft[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session?.user) {
      setError(content.authRequired);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setFeedback(null);

    try {
      const savedVehicleId = await saveDriverVehicle(supabase, session.user, form, vehicleId);
      setVehicleId(savedVehicleId);
      setFeedback(content.success);
    } catch (saveError) {
      setError(`${content.saveError} ${saveError instanceof Error ? saveError.message : ""}`.trim());
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
      <aside className="rounded-[32px] bg-[linear-gradient(160deg,var(--uy-deep),#0a78d1)] p-8 text-[var(--uy-paper)]">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--uy-sky)]">{content.eyebrow}</p>
        <h1 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl">{content.title}</h1>
        <p className="mt-4 text-sm leading-6 text-[color:rgba(231,246,255,0.92)] sm:text-base">{content.description}</p>

        <div className="mt-8 rounded-[28px] border border-white/10 bg-white/8 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--uy-sky)]">{content.helperTitle}</p>
          <p className="mt-3 text-sm leading-6 text-[color:rgba(231,246,255,0.92)]">{content.helperDescription}</p>
          <div className="mt-5 grid gap-3">
            {content.checklist.map((item, index) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--uy-sun)] text-xs font-semibold text-[var(--uy-deep-strong)]">
                  0{index + 1}
                </div>
                <p className="text-sm leading-6 text-[color:rgba(244,250,255,0.94)]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <form className="grid gap-4 rounded-[32px] border border-[var(--uy-line)] bg-[color:rgba(255,255,255,0.9)] p-8 shadow-[0_20px_60px_-45px_rgba(19,89,135,0.35)]" onSubmit={handleSubmit}>
        {isLoading ? <p className="text-sm text-slate-600">{content.loading}</p> : null}
        {!isLoading && !session?.user ? <p className="rounded-2xl bg-[var(--uy-sky-pale)] px-4 py-3 text-sm text-slate-600">{content.authRequired}</p> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
            {content.brand}
            <input
              type="text"
              required
              value={form.brand}
              onChange={(event) => updateField("brand", event.target.value)}
              className="mt-3 w-full bg-transparent text-base font-semibold text-slate-900 outline-none"
            />
          </label>
          <label className="rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
            {content.model}
            <input
              type="text"
              required
              value={form.model}
              onChange={(event) => updateField("model", event.target.value)}
              className="mt-3 w-full bg-transparent text-base font-semibold text-slate-900 outline-none"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
            {content.color}
            <input type="text" value={form.color} onChange={(event) => updateField("color", event.target.value)} className="mt-3 w-full bg-transparent text-base font-semibold text-slate-900 outline-none" />
          </label>
          <label className="rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
            {content.plateNumber}
            <input
              type="text"
              required
              value={form.plateNumber}
              onChange={(event) => updateField("plateNumber", event.target.value.toUpperCase())}
              className="mt-3 w-full bg-transparent text-base font-semibold uppercase text-slate-900 outline-none"
            />
          </label>
          <label className="rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
            {content.seats}
            <input
              type="number"
              min="1"
              max="8"
              required
              value={form.seats}
              onChange={(event) => updateField("seats", Number(event.target.value) || 1)}
              className="mt-3 w-full bg-transparent text-base font-semibold text-slate-900 outline-none"
            />
          </label>
        </div>

        <label className="rounded-[28px] bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
          {content.luggagePolicy}
          <textarea
            rows={4}
            value={form.luggagePolicy}
            onChange={(event) => updateField("luggagePolicy", event.target.value)}
            className="mt-3 w-full resize-none bg-transparent text-base font-semibold text-slate-900 outline-none"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
            {content.insuranceProvider}
            <input
              type="text"
              value={form.insuranceProvider}
              onChange={(event) => updateField("insuranceProvider", event.target.value)}
              className="mt-3 w-full bg-transparent text-base font-semibold text-slate-900 outline-none"
            />
          </label>
          <label className="rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
            {content.policyNumber}
            <input
              type="text"
              value={form.policyNumber}
              onChange={(event) => updateField("policyNumber", event.target.value)}
              className="mt-3 w-full bg-transparent text-base font-semibold text-slate-900 outline-none"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-[0.95fr_1.05fr]">
          <label className="rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
            {content.insuranceExpiry}
            <input
              type="date"
              value={form.insuranceExpiry}
              onChange={(event) => updateField("insuranceExpiry", event.target.value)}
              className="mt-3 w-full bg-transparent text-base font-semibold text-slate-900 outline-none"
            />
          </label>
          <label className="rounded-[28px] bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
            {content.insuranceDocument}
            <input
              type="file"
              accept=".pdf,image/*"
              className="mt-3 block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-[var(--uy-deep)] file:px-4 file:py-2 file:font-semibold file:text-[var(--uy-paper)]"
              onChange={(event) => {
                const file = event.target.files?.[0];
                updateField("insuranceDocumentPath", file?.name ?? form.insuranceDocumentPath);
              }}
            />
            <p className="mt-3 text-xs leading-5 text-slate-500">{form.insuranceDocumentPath || content.insuranceDocumentHint}</p>
          </label>
        </div>

        {feedback ? <p className="text-sm text-[var(--uy-deep)]">{feedback}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          disabled={isLoading || isSubmitting || !session?.user}
          className="mt-2 rounded-full bg-[var(--uy-deep)] px-5 py-4 text-sm font-semibold text-[var(--uy-paper)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {content.submit}
        </button>
      </form>
    </section>
  );
}