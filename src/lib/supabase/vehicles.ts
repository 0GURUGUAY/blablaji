import type { SupabaseClient, User } from "@supabase/supabase-js";
import { fetchOwnProfile, getProfileFallback, saveOwnProfile } from "@/lib/supabase/profiles";

export type DriverVehicleRecord = {
  id: string;
  brand: string;
  model: string;
  color: string;
  plateNumber: string;
  seats: number;
  luggagePolicy: string;
  insuranceProvider: string;
  policyNumber: string;
  insuranceExpiry: string;
  insuranceDocumentPath: string;
};

export type DriverVehicleDraft = Omit<DriverVehicleRecord, "id">;

function toTimestamp(date: string) {
  return date ? `${date}T00:00:00.000Z` : null;
}

function mapVehicleRow(row: {
  id: string;
  brand: string;
  model: string;
  color: string | null;
  plate_number: string;
  seats: number;
  luggage_policy: string | null;
  insurance_provider: string | null;
  insurance_policy_number: string | null;
  insurance_expires_at: string | null;
  insurance_document_path: string | null;
}): DriverVehicleRecord {
  return {
    id: row.id,
    brand: row.brand,
    model: row.model,
    color: row.color ?? "",
    plateNumber: row.plate_number,
    seats: row.seats,
    luggagePolicy: row.luggage_policy ?? "",
    insuranceProvider: row.insurance_provider ?? "",
    policyNumber: row.insurance_policy_number ?? "",
    insuranceExpiry: row.insurance_expires_at ? row.insurance_expires_at.slice(0, 10) : "",
    insuranceDocumentPath: row.insurance_document_path ?? "",
  };
}

export async function ensureDriverProfile(client: SupabaseClient, user: User) {
  const existingProfile = await fetchOwnProfile(client, user.id);

  if (existingProfile) {
    return existingProfile;
  }

  return saveOwnProfile(client, user, getProfileFallback(user));
}

export async function fetchDriverVehicle(client: SupabaseClient, userId: string) {
  const { data, error } = await client
    .from("vehicles")
    .select("id, brand, model, color, plate_number, seats, luggage_policy, insurance_provider, insurance_policy_number, insurance_expires_at, insurance_document_path")
    .eq("driver_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    throw error;
  }

  const vehicle = data?.[0];

  return vehicle ? mapVehicleRow(vehicle) : null;
}

export async function saveDriverVehicle(
  client: SupabaseClient,
  user: User,
  draft: DriverVehicleDraft,
  existingVehicleId?: string | null,
) {
  await ensureDriverProfile(client, user);

  const payload = {
    driver_id: user.id,
    brand: draft.brand.trim(),
    model: draft.model.trim(),
    color: draft.color.trim() || null,
    plate_number: draft.plateNumber.trim().toUpperCase(),
    seats: draft.seats,
    luggage_policy: draft.luggagePolicy.trim() || null,
    insurance_provider: draft.insuranceProvider.trim() || null,
    insurance_policy_number: draft.policyNumber.trim() || null,
    insurance_expires_at: toTimestamp(draft.insuranceExpiry),
    insurance_document_path: draft.insuranceDocumentPath.trim() || null,
  };

  if (existingVehicleId) {
    const { error } = await client.from("vehicles").update(payload).eq("id", existingVehicleId);

    if (error) {
      throw error;
    }

    return existingVehicleId;
  }

  const { data, error } = await client.from("vehicles").insert(payload).select("id").single();

  if (error) {
    throw error;
  }

  return data.id;
}