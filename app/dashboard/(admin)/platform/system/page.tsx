import { redirect } from "next/navigation";

// The old "System Configuration" screen was an unfinished stub that crashed on render.
// Store settings live on the Store page.
export default function SystemPage() {
  redirect("/dashboard/platform/store");
}
