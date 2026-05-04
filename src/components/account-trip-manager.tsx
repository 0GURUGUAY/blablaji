"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { RouteAutocomplete } from "@/components/route-autocomplete";
import { getLocalePath, type Locale } from "@/lib/locale";
import { formatRouteEstimate, getRouteEstimate } from "@/lib/route-estimate";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  deleteOwnRide,
  fetchDriverRideBookings,
  fetchOwnManagedRides,
  updateOwnRide,
  type ManagedRideBookingRecord,
  type ManagedRideDraft,
  type ManagedRideRecord,
  type RideLifecycleStatus,
} from "@/lib/supabase/rides";

type AccountTripManagerProps = {
  locale: Locale;
};

const copy = {
  es: {
    eyebrow: "Mis viajes",
    title: "Gestionar mis rides",
    description: "Edita, cancela o elimina tus viajes publicados y accede rapido a las conversaciones de reserva.",
    loading: "Cargando tus rides...",
    authRequired: "Inicia sesion para gestionar tus rides.",
    empty: "Todavia no publicaste rides. Crea tu primer viaje para gestionarlo desde aqui.",
    loadError: "No se pudo cargar tus rides.",
    saveError: "No se pudo actualizar el ride.",
    deleteError: "No se pudo eliminar el ride.",
    saveSuccess: "Ride actualizado correctamente.",
    deleteSuccess: "Ride eliminado correctamente.",
    publishCta: "Publicar un nuevo ride",
    reservationsCta: "Reservas y mensajes",
    edit: "Editar",
    delete: "Eliminar",
    cancelEdit: "Cancelar",
    submitEdit: "Guardar cambios",
    saving: "Guardando...",
    deleting: "Eliminando...",
    origin: "Salida",
    destination: "Destino",
    date: "Fecha",
    time: "Hora",
    seats: "Plazas",
    price: "Precio",
    notes: "Detalles",
    vehicle: "Vehiculo",
    status: "Estado",
    freeSeats: "plazas libres",
    confirmDelete: "Quieres eliminar este ride?",
    passengersTitle: "Inscritos",
    passengersEmpty: "Todavia no hay usuarios inscritos en este ride.",
    passengersLoadError: "No se pudo cargar los inscritos.",
    passengerPhoneMissing: "Sin telefono",
    passengerEmailMissing: "Sin email",
    seatsReserved: "Plazas reservadas",
    pickupNote: "Punto o nota",
    contactByPhone: "Llamar",
    contactByMail: "Email",
    contactByMessage: "Mensaje",
    statusOptions: {
      draft: "Borrador",
      published: "Publicado",
      full: "Completo",
      completed: "Realizado",
      cancelled: "Cancelado",
    },
    bookingStatusOptions: {
      pending: "Pendiente",
      confirmed: "Confirmada",
      cancelled: "Cancelada",
      completed: "Completada",
    },
  },
  fr: {
    eyebrow: "Mes voyages",
    title: "Gerer mes rides",
    description: "Edite, annule ou supprime tes trajets publies et accede vite aux conversations de reservation.",
    loading: "Chargement de tes rides...",
    authRequired: "Connecte-toi pour gerer tes rides.",
    empty: "Tu n'as pas encore publie de ride. Cree ton premier trajet pour le gerer ici.",
    loadError: "Impossible de charger tes rides.",
    saveError: "Impossible de mettre a jour le ride.",
    deleteError: "Impossible de supprimer le ride.",
    saveSuccess: "Ride mis a jour avec succes.",
    deleteSuccess: "Ride supprime avec succes.",
    publishCta: "Publier un nouveau ride",
    reservationsCta: "Reservations et messages",
    edit: "Editer",
    delete: "Supprimer",
    cancelEdit: "Annuler",
    submitEdit: "Enregistrer",
    saving: "Enregistrement...",
    deleting: "Suppression...",
    origin: "Depart",
    destination: "Destination",
    date: "Date",
    time: "Heure",
    seats: "Places",
    price: "Prix",
    notes: "Details",
    vehicle: "Vehicule",
    status: "Etat",
    freeSeats: "places libres",
    confirmDelete: "Veux-tu supprimer ce ride ?",
    passengersTitle: "Inscrits",
    passengersEmpty: "Aucun utilisateur inscrit pour ce ride pour l'instant.",
    passengersLoadError: "Impossible de charger les inscrits.",
    passengerPhoneMissing: "Sans telephone",
    passengerEmailMissing: "Sans email",
    seatsReserved: "Places reservees",
    pickupNote: "Point ou note",
    contactByPhone: "Appeler",
    contactByMail: "Email",
    contactByMessage: "Message",
    statusOptions: {
      draft: "Brouillon",
      published: "Publie",
      full: "Complet",
      completed: "Effectue",
      cancelled: "Annule",
    },
    bookingStatusOptions: {
      pending: "En attente",
      confirmed: "Confirmee",
      cancelled: "Annulee",
      completed: "Terminee",
    },
  },
} as const;

function toDraft(ride: ManagedRideRecord): ManagedRideDraft {
  return {
    origin: ride.origin,
    destination: ride.destination,
    departureDate: ride.departureDate,
    departureTime: ride.departureTime,
    seatsTotal: ride.seatsTotal,
    seatPriceUyu: ride.seatPriceUyu,
    notes: ride.notes,
    status: ride.status,
  };
}

async function loadDriverDataSnapshot(
  supabase: ReturnType<typeof getSupabaseBrowserClient>,
  userId: string,
) {
  const rides = await fetchOwnManagedRides(supabase, userId);

  try {
    const bookings = await fetchDriverRideBookings(supabase);

    return { rides, bookings, bookingsError: null };
  } catch (error) {
    return {
      rides,
      bookings: [],
      bookingsError: error instanceof Error ? error.message : "",
    };
  }
}

export function AccountTripManager({ locale }: AccountTripManagerProps) {
  const ui = copy[locale];
  const supabase = getSupabaseBrowserClient();
  const [session, setSession] = useState<Session | null>(null);
  const [rides, setRides] = useState<ManagedRideRecord[]>([]);
  const [bookings, setBookings] = useState<ManagedRideBookingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [editingRideId, setEditingRideId] = useState<string | null>(null);
  const [form, setForm] = useState<ManagedRideDraft | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function hydrate(nextSession: Session | null) {
      if (!isMounted) {
        return;
      }

      setSession(nextSession);
      setFeedback(null);
      setError(null);
      setBookingsError(null);

      if (!nextSession?.user) {
        setRides([]);
        setBookings([]);
        setEditingRideId(null);
        setForm(null);
        setIsLoading(false);
        return;
      }

      try {
        const snapshot = await loadDriverDataSnapshot(supabase, nextSession.user.id);

        if (!isMounted) {
          return;
        }

        setRides(snapshot.rides);
        setBookings(snapshot.bookings);
        setBookingsError(snapshot.bookingsError ? `${ui.passengersLoadError} ${snapshot.bookingsError}`.trim() : null);
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
  }, [supabase, ui.loadError, ui.passengersLoadError]);

  async function reloadRides(userId: string) {
    const snapshot = await loadDriverDataSnapshot(supabase, userId);
    setRides(snapshot.rides);
    setBookings(snapshot.bookings);
    setBookingsError(snapshot.bookingsError ? `${ui.passengersLoadError} ${snapshot.bookingsError}`.trim() : null);
  }

  function startEditing(ride: ManagedRideRecord) {
    setEditingRideId(ride.id);
    setForm(toDraft(ride));
    setFeedback(null);
    setError(null);
  }

  function stopEditing() {
    setEditingRideId(null);
    setForm(null);
  }

  async function handleUpdate(ride: ManagedRideRecord) {
    if (!session?.user || !form) {
      setError(ui.authRequired);
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    setError(null);

    try {
      await updateOwnRide(supabase, session.user.id, ride.id, ride, form);
      await reloadRides(session.user.id);
      setFeedback(ui.saveSuccess);
      stopEditing();
    } catch (saveError) {
      setError(`${ui.saveError} ${saveError instanceof Error ? saveError.message : ""}`.trim());
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(rideId: string) {
    if (!session?.user) {
      setError(ui.authRequired);
      return;
    }

    if (!window.confirm(ui.confirmDelete)) {
      return;
    }

    setIsDeletingId(rideId);
    setFeedback(null);
    setError(null);

    try {
      await deleteOwnRide(supabase, session.user.id, rideId);
      await reloadRides(session.user.id);
      if (editingRideId === rideId) {
        stopEditing();
      }
      setFeedback(ui.deleteSuccess);
    } catch (deleteError) {
      setError(`${ui.deleteError} ${deleteError instanceof Error ? deleteError.message : ""}`.trim());
    } finally {
      setIsDeletingId(null);
    }
  }

  return (
    <section className="space-y-6 rounded-[32px] border border-[var(--uy-line)] bg-[color:rgba(255,255,255,0.9)] p-8 shadow-[0_20px_60px_-45px_rgba(19,89,135,0.35)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--uy-deep)]">{ui.eyebrow}</p>
          <h2 className="mt-3 font-serif text-3xl text-slate-900">{ui.title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{ui.description}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={getLocalePath(locale, "/publish")} className="rounded-full bg-[var(--uy-deep)] px-4 py-3 text-sm font-semibold text-[var(--uy-paper)]">
            {ui.publishCta}
          </Link>
          <Link href={getLocalePath(locale, "/messages")} className="rounded-full border border-[var(--uy-line)] bg-white px-4 py-3 text-sm font-semibold text-[var(--uy-deep)]">
            {ui.reservationsCta}
          </Link>
        </div>
      </div>

      {isLoading ? <p className="text-sm text-slate-600">{ui.loading}</p> : null}
      {!isLoading && !session?.user ? <p className="rounded-2xl bg-[var(--uy-sky-pale)] px-4 py-3 text-sm text-slate-600">{ui.authRequired}</p> : null}
      {feedback ? <p className="text-sm text-[var(--uy-deep)]">{feedback}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {bookingsError ? <p className="text-sm text-amber-700">{bookingsError}</p> : null}
      {!isLoading && session?.user && rides.length === 0 ? <p className="rounded-2xl bg-[var(--uy-sky-pale)] px-4 py-3 text-sm text-slate-600">{ui.empty}</p> : null}

      {rides.length > 0 ? (
        <div className="grid gap-5">
          {rides.map((ride) => {
            const isEditing = editingRideId === ride.id && form;
            const routeEstimate = formatRouteEstimate(locale, getRouteEstimate(ride.origin, ride.destination));
            const rideBookings = bookings.filter((booking) => booking.rideId === ride.id);

            return (
              <article key={ride.id} className="rounded-[28px] border border-[var(--uy-line)] bg-white/80 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{ride.departureDate}</p>
                    <h3 className="mt-2 font-serif text-2xl text-slate-900">{ride.origin} <span className="text-slate-400">→</span> {ride.destination}</h3>
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      <p><span className="font-semibold text-slate-900">{ui.time}:</span> {ride.departureTime}</p>
                      <p><span className="font-semibold text-slate-900">{ui.vehicle}:</span> {ride.carModel}</p>
                      <p><span className="font-semibold text-slate-900">{ui.seats}:</span> {ride.seatsAvailable} {ui.freeSeats} / {ride.seatsTotal}</p>
                      <p><span className="font-semibold text-slate-900">{ui.price}:</span> UYU {ride.seatPriceUyu}</p>
                      <p><span className="font-semibold text-slate-900">{ui.status}:</span> {ui.statusOptions[ride.status]}</p>
                      {routeEstimate ? <p>{routeEstimate}</p> : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button type="button" onClick={() => startEditing(ride)} className="rounded-full border border-[var(--uy-line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--uy-deep)]">
                      {ui.edit}
                    </button>
                    <button type="button" onClick={() => void handleDelete(ride.id)} disabled={isDeletingId === ride.id} className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-70">
                      {isDeletingId === ride.id ? ui.deleting : ui.delete}
                    </button>
                  </div>
                </div>

                {ride.notes ? <p className="mt-4 rounded-2xl bg-[var(--uy-sky-pale)] px-4 py-3 text-sm text-slate-600">{ride.notes}</p> : null}

                <section className="mt-5 space-y-3 border-t border-black/5 pt-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--uy-deep)]">{ui.passengersTitle}</h4>
                    <span className="rounded-full bg-[var(--uy-sky-pale)] px-3 py-1 text-xs font-semibold text-[var(--uy-deep)]">{rideBookings.length}</span>
                  </div>

                  {bookingsError ? <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">{bookingsError}</p> : null}
                  {rideBookings.length === 0 ? <p className="rounded-2xl bg-[var(--uy-sky-pale)] px-4 py-3 text-sm text-slate-600">{ui.passengersEmpty}</p> : null}

                  {rideBookings.length > 0 ? (
                    <div className="grid gap-3">
                      {rideBookings.map((booking) => (
                        <article key={booking.id} className="rounded-[24px] bg-[var(--uy-sky-pale)] p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-900">{booking.passengerName}</p>
                              <p className="mt-1 text-sm text-slate-600">{ui.status}: {ui.bookingStatusOptions[booking.status]}</p>
                            </div>
                            <span className="rounded-full border border-[var(--uy-line)] bg-white px-3 py-1 text-xs font-semibold text-slate-600">{ui.seatsReserved}: {booking.seatsReserved}</span>
                          </div>

                          <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                            <p>
                              <span className="font-semibold text-slate-900">Tel:</span> {booking.passengerPhone || ui.passengerPhoneMissing}
                            </p>
                            <p>
                              <span className="font-semibold text-slate-900">Email:</span> {booking.passengerEmail || ui.passengerEmailMissing}
                            </p>
                          </div>

                          {booking.pickupNote ? (
                            <p className="mt-3 text-sm text-slate-600"><span className="font-semibold text-slate-900">{ui.pickupNote}:</span> {booking.pickupNote}</p>
                          ) : null}

                          <div className="mt-4 flex flex-wrap gap-3">
                            {booking.passengerPhone ? (
                              <a href={`tel:${booking.passengerPhone}`} className="rounded-full border border-[var(--uy-line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--uy-deep)]">
                                {ui.contactByPhone}
                              </a>
                            ) : null}
                            {booking.passengerEmail ? (
                              <a href={`mailto:${booking.passengerEmail}`} className="rounded-full border border-[var(--uy-line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--uy-deep)]">
                                {ui.contactByMail}
                              </a>
                            ) : null}
                            <Link href={`${getLocalePath(locale, "/messages")}?ride=${ride.id}&passenger=${booking.passengerId}`} className="rounded-full bg-[var(--uy-deep)] px-4 py-2 text-sm font-semibold text-[var(--uy-paper)]">
                              {ui.contactByMessage}
                            </Link>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : null}
                </section>

                {isEditing ? (
                  <div className="mt-5 grid gap-4 border-t border-black/5 pt-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
                        {ui.origin}
                        <RouteAutocomplete locale={locale} value={form.origin} onValueChange={(value) => setForm((current) => current ? { ...current, origin: value } : current)} placeholder={ui.origin} />
                      </label>
                      <label className="rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
                        {ui.destination}
                        <RouteAutocomplete locale={locale} value={form.destination} onValueChange={(value) => setForm((current) => current ? { ...current, destination: value } : current)} placeholder={ui.destination} />
                      </label>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <label className="rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
                        {ui.date}
                        <input type="date" value={form.departureDate} onChange={(event) => setForm((current) => current ? { ...current, departureDate: event.target.value } : current)} className="mt-3 w-full bg-transparent text-base font-semibold text-slate-900 outline-none" />
                      </label>
                      <label className="rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
                        {ui.time}
                        <input type="time" value={form.departureTime} onChange={(event) => setForm((current) => current ? { ...current, departureTime: event.target.value } : current)} className="mt-3 w-full bg-transparent text-base font-semibold text-slate-900 outline-none" />
                      </label>
                      <label className="rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
                        {ui.seats}
                        <input type="number" min="1" value={form.seatsTotal} onChange={(event) => setForm((current) => current ? { ...current, seatsTotal: Number(event.target.value) || 1 } : current)} className="mt-3 w-full bg-transparent text-base font-semibold text-slate-900 outline-none" />
                      </label>
                      <label className="rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
                        {ui.price}
                        <input type="number" min="1" value={form.seatPriceUyu} onChange={(event) => setForm((current) => current ? { ...current, seatPriceUyu: Number(event.target.value) || 1 } : current)} className="mt-3 w-full bg-transparent text-base font-semibold text-slate-900 outline-none" />
                      </label>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-[1fr_240px]">
                      <label className="rounded-[28px] bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
                        {ui.notes}
                        <textarea rows={4} value={form.notes} onChange={(event) => setForm((current) => current ? { ...current, notes: event.target.value } : current)} className="mt-3 w-full resize-none bg-transparent text-base font-semibold text-slate-900 outline-none" />
                      </label>
                      <label className="rounded-3xl bg-[var(--uy-sky-pale)] p-4 text-sm text-slate-500">
                        {ui.status}
                        <select value={form.status} onChange={(event) => setForm((current) => current ? { ...current, status: event.target.value as RideLifecycleStatus } : current)} className="mt-3 w-full bg-transparent text-base font-semibold text-slate-900 outline-none">
                          {Object.entries(ui.statusOptions).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button type="button" onClick={() => void handleUpdate(ride)} disabled={isSubmitting} className="rounded-full bg-[var(--uy-deep)] px-4 py-3 text-sm font-semibold text-[var(--uy-paper)] disabled:opacity-70">
                        {isSubmitting ? ui.saving : ui.submitEdit}
                      </button>
                      <button type="button" onClick={stopEditing} className="rounded-full border border-[var(--uy-line)] bg-white px-4 py-3 text-sm font-semibold text-slate-600">
                        {ui.cancelEdit}
                      </button>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}