import { redirect } from "next/navigation";
import { defaultLocale, getLocalePath } from "@/lib/locale";

export default function PublishPage() {
  redirect(getLocalePath(defaultLocale, "/publish"));
}