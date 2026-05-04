import { redirect } from "next/navigation";
import { defaultLocale, getLocalePath } from "@/lib/locale";

export default function AccountPage() {
  redirect(getLocalePath(defaultLocale, "/account"));
}