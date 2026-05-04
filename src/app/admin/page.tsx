import { redirect } from "next/navigation";
import { defaultLocale, getLocalePath } from "@/lib/locale";

export default function AdminPage() {
  redirect(getLocalePath(defaultLocale, "/admin"));
}