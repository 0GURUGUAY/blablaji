import type { SupabaseClient, User } from "@supabase/supabase-js";
import { isAdminEmail } from "@/lib/admin";

export type UserProfileRecord = {
  id: string;
  fullName: string;
  avatarUrl: string;
  phone: string;
  homeCity: string;
  role: "rider" | "driver" | "admin";
};

export type UserProfileDraft = Omit<UserProfileRecord, "id" | "role">;

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
}): UserProfileRecord {
  return {
    id: row.id,
    fullName: row.full_name,
    avatarUrl: row.avatar_url ?? "",
    phone: row.phone ?? "",
    homeCity: row.home_city,
    role: row.role,
  };
}

export async function fetchOwnProfile(client: SupabaseClient, userId: string) {
  const { data, error } = await client
    .from("profiles")
    .select("id, full_name, avatar_url, phone, home_city, role")
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
    home_city: draft.homeCity.trim() || "Jose Ignacio",
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
  } satisfies UserProfileRecord;
}

export function getProfileFallback(user: User): UserProfileDraft {
  return {
    fullName: getFallbackName(user),
    avatarUrl: getFallbackAvatar(user),
    phone: typeof user.phone === "string" ? user.phone : "",
    homeCity: "Jose Ignacio",
  };
}