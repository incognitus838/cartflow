import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { requireAuth } from "@/lib/auth-server";
import { canUserCreateStore } from "@/lib/team/stores";

type PageProps = {
  searchParams: Promise<{ new?: string }>;
};

export default async function OnboardingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const isAddStore = params.new === "1";

  if (!isAddStore) {
    redirect("/signup");
  }

  const { user } = await requireAuth();
  const { allowed } = await canUserCreateStore(user.id);
  if (!allowed) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <OnboardingWizard mode="add" />
    </main>
  );
}