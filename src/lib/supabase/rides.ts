import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Locale } from "@/lib/locale";
import type { Ride, RideStatus } from "@/lib/types";
import { fetchOwnProfile } from "@/lib/supabase/profiles";
import { ensureDriverProfile } from "@/lib/supabase/vehicles";

export type RideDraft = {
  vehicleId: string;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  seatsTotal: number;
  seatPriceUyu: number;
  notes: string;
};

export type RideLifecycleStatus = "draft" | "published" | "full" | "completed" | "cancelled";

export type ManagedRideRecord = {
  id: string;
  vehicleId: string;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  seatsTotal: number;
  seatsAvailable: number;
  seatPriceUyu: number;
  notes: string;
  status: RideLifecycleStatus;
  carModel: string;
};

export type ManagedRideDraft = {
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  seatsTotal: number;
  seatPriceUyu: number;
  notes: string;
  status: RideLifecycleStatus;
};

export type BookingLifecycleStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type ManagedRideBookingRecord = {
  id: string;
  rideId: string;
  passengerId: string;
  passengerName: string;
  passengerPhone: string;
  passengerEmail: string;
  seatsReserved: number;
  pickupNote: string;
  status: BookingLifecycleStatus;
  createdAt: string;
};

export type RideFilters = {
  origin?: string;
  destination?: string;
  departureDate?: string;
  maxPriceUyu?: number;
};

type PublicRideCatalogRow = {
  id: string;
  origin: string;
  destination: string;
  departure_at: string;
  seat_price_uyu: number;
  seats_available: number;
  status: string;
  notes: string | null;
  driver_name: string | null;
  driver_rating: number | string | null;
  driver_trips: number | null;
  car_model: string | null;
};

type DriverRideBookingRow = {
  id: string;
  ride_id: string;
  passenger_id: string;
  passenger_name: string | null;
  passenger_phone: string | null;
  passenger_email: string | null;
  seats_reserved: number;
  pickup_note: string | null;
  booking_status: BookingLifecycleStatus;
  created_at: string;
};

const MONTEVIDEO_TIME_ZONE = "America/Montevideo";
const MONTEVIDEO_OFFSET = "-03:00";

function getDateTimeParts(value: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: MONTEVIDEO_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(new Date(value));
  const lookup = new Map(parts.map((part) => [part.type, part.value]));

  return {
    date: `${lookup.get("year")}-${lookup.get("month")}-${lookup.get("day")}`,
    time: `${lookup.get("hour")}:${lookup.get("minute")}`,
  };
}

function formatDateLabel(locale: Locale, value: string) {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "es-UY", {
    timeZone: MONTEVIDEO_TIME_ZONE,
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

function formatTimeLabel(locale: Locale, value: string) {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "es-UY", {
    timeZone: MONTEVIDEO_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function mapRideStatus(status: string, seatsAvailable: number): RideStatus {
  if (status === "full" || seatsAvailable === 0) {
    return "full";
  }

  if (seatsAvailable <= 1) {
    return "lastSeats";
  }

  return "available";
}

function toRideTags(locale: Locale, notes: string | null) {
  if (!notes) {
    return [locale === "fr" ? "Ride publie" : "Ride publicado"];
  }

  const tags = notes
    .split(/[|·]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 3);

  return tags.length > 0 ? tags : [notes.slice(0, 48)];
}

function mapCatalogRide(locale: Locale, ride: PublicRideCatalogRow): Ride {
  return {
    id: ride.id,
    origin: ride.origin,
    destination: ride.destination,
    dateLabel: formatDateLabel(locale, ride.departure_at),
    departureTime: formatTimeLabel(locale, ride.departure_at),
    seatsLeft: ride.seats_available,
    priceUyu: ride.seat_price_uyu,
    driverName: ride.driver_name ?? (locale === "fr" ? "Conducteur local" : "Conductor local"),
    driverRating: Number(ride.driver_rating ?? 5),
    driverTrips: ride.driver_trips ?? 0,
    carModel: ride.car_model ?? (locale === "fr" ? "Vehicule" : "Vehiculo"),
    status: mapRideStatus(ride.status, ride.seats_available),
    tags: toRideTags(locale, ride.notes),
  };
}

function normalizeFilterValue(value?: string) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function toDepartureAt(date: string, time: string) {
  return `${date}T${time}:00${MONTEVIDEO_OFFSET}`;
}

function mapManagedRideRow(
  row: {
    id: string;
    vehicle_id: string;
    origin: string;
    destination: string;
    departure_at: string;
    seat_price_uyu: number;
    seats_total: number;
    seats_available: number;
    notes: string | null;
    status: RideLifecycleStatus;
  },
  carModel: string,
): ManagedRideRecord {
  const departureParts = getDateTimeParts(row.departure_at);

  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    origin: row.origin,
    destination: row.destination,
    departureDate: departureParts.date,
    departureTime: departureParts.time,
    seatsTotal: row.seats_total,
    seatsAvailable: row.seats_available,
    seatPriceUyu: row.seat_price_uyu,
    notes: row.notes ?? "",
    status: row.status,
    carModel,
  };
}

function mapManagedRideBookingRow(row: DriverRideBookingRow): ManagedRideBookingRecord {
  return {
    id: row.id,
    rideId: row.ride_id,
    passengerId: row.passenger_id,
    passengerName: row.passenger_name ?? "Passenger",
    passengerPhone: row.passenger_phone ?? "",
    passengerEmail: row.passenger_email ?? "",
    seatsReserved: row.seats_reserved,
    pickupNote: row.pickup_note ?? "",
    status: row.booking_status,
    createdAt: row.created_at,
  };
}

export async function createRide(client: SupabaseClient, user: User, draft: RideDraft) {
  await ensureDriverProfile(client, user);

  const payload = {
    driver_id: user.id,
    vehicle_id: draft.vehicleId,
    origin: draft.origin,
    destination: draft.destination,
    departure_at: toDepartureAt(draft.departureDate, draft.departureTime),
    arrival_estimate_at: null,
    seat_price_uyu: draft.seatPriceUyu,
    seats_total: draft.seatsTotal,
    seats_available: draft.seatsTotal,
    notes: draft.notes.trim() || null,
    status: "published",
  };

  const { data, error } = await client.from("rides").insert(payload).select("id").single();

  if (error) {
    throw error;
  }

  return data.id;
}

export async function fetchOwnRideOffers(client: SupabaseClient, userId: string, locale: Locale): Promise<Ride[]> {
  const [{ data: rides, error: ridesError }, profile] = await Promise.all([
    client
      .from("rides")
      .select("id, origin, destination, departure_at, seat_price_uyu, seats_available, status, notes, vehicle_id")
      .eq("driver_id", userId)
      .in("status", ["published", "full"])
      .order("departure_at", { ascending: true }),
    fetchOwnProfile(client, userId),
  ]);

  if (ridesError) {
    throw ridesError;
  }

  const vehicleIds = Array.from(new Set((rides ?? []).map((ride) => ride.vehicle_id)));
  const { data: vehicles, error: vehiclesError } = vehicleIds.length
    ? await client.from("vehicles").select("id, brand, model").in("id", vehicleIds)
    : { data: [], error: null };

  if (vehiclesError) {
    throw vehiclesError;
  }

  const vehicleById = new Map((vehicles ?? []).map((vehicle) => [vehicle.id, `${vehicle.brand} ${vehicle.model}`]));
  const driverName = profile?.fullName ?? "Driver";
  const driverRating = 5;
  const driverTrips = 0;

  return (rides ?? []).map((ride) => ({
    id: ride.id,
    origin: ride.origin,
    destination: ride.destination,
    dateLabel: formatDateLabel(locale, ride.departure_at),
    departureTime: formatTimeLabel(locale, ride.departure_at),
    seatsLeft: ride.seats_available,
    priceUyu: ride.seat_price_uyu,
    driverName,
    driverRating,
    driverTrips,
    carModel: vehicleById.get(ride.vehicle_id) ?? "Vehiculo",
    status: mapRideStatus(ride.status, ride.seats_available),
    tags: toRideTags(locale, ride.notes),
  }));
}

export async function fetchOwnManagedRides(client: SupabaseClient, userId: string): Promise<ManagedRideRecord[]> {
  const { data: rides, error: ridesError } = await client
    .from("rides")
    .select("id, vehicle_id, origin, destination, departure_at, seat_price_uyu, seats_total, seats_available, notes, status")
    .eq("driver_id", userId)
    .order("departure_at", { ascending: true });

  if (ridesError) {
    throw ridesError;
  }

  const vehicleIds = Array.from(new Set((rides ?? []).map((ride) => ride.vehicle_id)));
  const { data: vehicles, error: vehiclesError } = vehicleIds.length
    ? await client.from("vehicles").select("id, brand, model").in("id", vehicleIds)
    : { data: [], error: null };

  if (vehiclesError) {
    throw vehiclesError;
  }

  const vehicleById = new Map((vehicles ?? []).map((vehicle) => [vehicle.id, `${vehicle.brand} ${vehicle.model}`]));

  return (rides ?? []).map((ride) => mapManagedRideRow(ride, vehicleById.get(ride.vehicle_id) ?? "Vehiculo"));
}

export async function fetchDriverRideBookings(client: SupabaseClient): Promise<ManagedRideBookingRecord[]> {
  const { data, error } = await client.rpc("get_driver_ride_bookings");

  if (error) {
    throw error;
  }

  return ((data ?? []) as DriverRideBookingRow[]).map((row) => mapManagedRideBookingRow(row));
}

export async function updateOwnRide(
  client: SupabaseClient,
  userId: string,
  rideId: string,
  currentRide: ManagedRideRecord,
  draft: ManagedRideDraft,
) {
  const reservedSeats = Math.max(currentRide.seatsTotal - currentRide.seatsAvailable, 0);
  const nextSeatsTotal = Math.max(draft.seatsTotal, reservedSeats, 1);
  const nextSeatsAvailable = Math.max(nextSeatsTotal - reservedSeats, 0);

  const payload = {
    origin: draft.origin,
    destination: draft.destination,
    departure_at: toDepartureAt(draft.departureDate, draft.departureTime),
    seat_price_uyu: draft.seatPriceUyu,
    seats_total: nextSeatsTotal,
    seats_available: nextSeatsAvailable,
    notes: draft.notes.trim() || null,
    status: draft.status,
  };

  const { error } = await client.from("rides").update(payload).eq("id", rideId).eq("driver_id", userId);

  if (error) {
    throw error;
  }
}

export async function deleteOwnRide(client: SupabaseClient, userId: string, rideId: string) {
  const { error } = await client.from("rides").delete().eq("id", rideId).eq("driver_id", userId);

  if (error) {
    throw error;
  }
}

export async function fetchPublicRideCatalog(client: SupabaseClient, locale: Locale, filters: RideFilters = {}): Promise<Ride[]> {
  const { data, error } = await client.rpc("get_public_ride_catalog", {
    filter_origin: normalizeFilterValue(filters.origin),
    filter_destination: normalizeFilterValue(filters.destination),
    filter_max_price: filters.maxPriceUyu ?? null,
    filter_date: filters.departureDate ?? null,
  });

  if (error) {
    throw error;
  }

  return ((data ?? []) as PublicRideCatalogRow[]).map((ride) => mapCatalogRide(locale, ride));
}