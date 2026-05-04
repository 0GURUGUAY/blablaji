import type { SupabaseClient, User } from "@supabase/supabase-js";
import { isAdminEmail } from "@/lib/admin";
import { routeOptions } from "@/lib/data";

export type UserProfileRecord = {
  id: string;
  fullName: string;
  avatarUrl: string;
  phone: string;
  homeCity: string;
  role: "rider" | "driver" | "admin";
  passengerScore: number;
  passengerScoreBand: "trusted" | "watch" | "blocked";
  completedPassengerTrips: number;
  passengerCancellationCount: number;
  passengerNoShowCount: number;
  passengerReportsCount: number;
};

export type UserProfileDraft = Pick<UserProfileRecord, "fullName" | "avatarUrl" | "phone" | "homeCity">;

const defaultHomeCity = "Jose Ignacio";

function getValidatedHomeCity(homeCity: string) {
  const normalizedHomeCity = homeCity.trim();

  if (!normalizedHomeCity) {
    return defaultHomeCity;
  }

  if (!routeOptions.includes(normalizedHomeCity)) {
    throw new Error("Home city must match a pre-registered city.");
  }

  return normalizedHomeCity;
}

function getFallbackName(user: User) {
  const metadataName = user.user_metadata.full_name ?? user.user_metadata.name;

  if (typeof metadataName === "string" && metadataName.trim()) {
    return metadataName.trim();
  }

  return user.email?.split("@")[0]?.replace(/[._-]+/g, " ") ?? "User";
}

function getFallbackAvatar(user: User) {
  const avatar = user.user_metadata.avatar_url ?? user.user_metadata.picture;
  return typeof avatar === "string" ? avatar : "";
}

function mapProfileRow(row: {
  id: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  home_city: string;
  role: "rider" | "driver" | "admin";
  passenger_score: number | null;
  passenger_score_band: "trusted" | "watch" | "blocked" | null;
  completed_passenger_trips: number | null;
  passenger_cancellation_count: number | null;
  passenger_no_show_count: number | null;
  passenger_reports_count: number | null;
}): UserProfileRecord {
  return {
    id: row.id,
    fullName: row.full_name,
    avatarUrl: row.avatar_url ?? "",
    phone: row.phone ?? "",
    homeCity: routeOptions.includes(row.home_city) ? row.home_city : defaultHomeCity,
    role: row.role,
    passengerScore: row.passenger_score ?? 100,
    passengerScoreBand: row.passenger_score_band ?? "trusted",
    completedPassengerTrips: row.completed_passenger_trips ?? 0,
    passengerCancellationCount: row.passenger_cancellation_count ?? 0,
    passengerNoShowCount: row.passenger_no_show_count ?? 0,
    passengerReportsCount: row.passenger_reports_count ?? 0,
  };
}

export async function fetchOwnProfile(client: SupabaseClient, userId: string) {
  const { data, error } = await client
    .from("profiles")
    .select("id, full_name, avatar_url, phone, home_city, role, passenger_score, passenger_score_band, completed_passenger_trips, passenger_cancellation_count, passenger_no_show_count, passenger_reports_count")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapProfileRow(data) : null;
}

export async function saveOwnProfile(client: SupabaseClient, user: User, draft: UserProfileDraft) {
  const payload = {
    id: user.id,
    full_name: draft.fullName.trim() || getFallbackName(user),
    avatar_url: draft.avatarUrl.trim() || null,
    phone: draft.phone.trim() || null,
    home_city: getValidatedHomeCity(draft.homeCity),
    role: (isAdminEmail(user.email) ? "admin" : "driver") as UserProfileRecord["role"],
  };

  const { error } = await client.from("profiles").upsert(payload, { onConflict: "id" });

  if (error) {
    throw error;
  }

  const { error: updateUserError } = await client.auth.updateUser({
    data: {
      full_name: payload.full_name,
      avatar_url: payload.avatar_url,
    },
  });

  if (updateUserError) {
    throw updateUserError;
  }

  return {
    id: user.id,
    fullName: payload.full_name,
    avatarUrl: payload.avatar_url ?? "",
    phone: payload.phone ?? "",
    homeCity: payload.home_city,
    role: payload.role,
    passengerScore: 100,
    passengerScoreBand: "trusted",
    completedPassengerTrips: 0,
    passengerCancellationCount: 0,
    passengerNoShowCount: 0,
    passengerReportsCount: 0,
  } satisfies UserProfileRecord;
}

export function getProfileFallback(user: User): UserProfileDraft {
  return {
    fullName: getFallbackName(user),
    avatarUrl: getFallbackAvatar(user),
    phone: typeof user.phone === "string" ? user.phone : "",
    homeCity: defaultHomeCity,
  };
}