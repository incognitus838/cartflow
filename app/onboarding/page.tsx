import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { requireAuth } from "@/lib/auth-server";

export default async function OnboardingPage() {
  const { business } = await requireAuth();
  if (business) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <OnboardingWizard />
    </main>
  );
}