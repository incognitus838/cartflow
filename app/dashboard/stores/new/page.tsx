import { redirect } from "next/navigation";

export default function NewStorePage() {
  redirect("/onboarding?new=1");
}