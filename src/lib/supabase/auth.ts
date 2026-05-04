import type { User } from "@supabase/supabase-js";

export function areSupabaseEmailFeaturesDisabled() {
  return process.env.NEXT_PUBLIC_DISABLE_SUPABASE_EMAIL_FEATURES === "true";
}

export function isEmailVerified(user: User | null | undefined) {
  if (areSupabaseEmailFeaturesDisabled()) {
    return true;
  }

  return Boolean(user?.email_confirmed_at);
}