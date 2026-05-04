function getConfiguredAdminEmails() {
  const value = process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "";

  return value
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null) {
  if (!email) {
    return false;
  }

  return getConfiguredAdminEmails().includes(email.trim().toLowerCase());
}