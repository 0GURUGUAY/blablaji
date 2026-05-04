import type { User } from "@supabase/supabase-js";

export function isEmailVerified(user: User | null | undefined) {
  return Boolean(user?.email_confirmed_at);
}