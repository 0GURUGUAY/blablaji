import { redirect } from "next/navigation";
import { defaultLocale, getLocalePath } from "@/lib/locale";

export default function MessagesPage() {
  redirect(getLocalePath(defaultLocale, "/messages"));
}