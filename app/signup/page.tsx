import { redirect } from "next/navigation";
import { SignupForm } from "@/components/auth/signup-form";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { clearSession } from "@/lib/auth";
import { getAuthContext } from "@/lib/auth-server";

type PageProps = {
  searchParams: Promise<{ invite?: string; email?: string; name?: string }>;
};

export default async function SignupPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const ctx = await getAuthContext();
  if (ctx.session) {
    if (params.invite) {
      redirect(`/invite/${params.invite}`);
    }
    if (ctx.business) {
      redirect("/dashboard");
    }
    await clearSession();
    redirect("/login?reason=access_revoked");
  }

  if (params.invite) {
    return (
      <main className="min-h-screen bg-slate-50">
        <SignupForm
          inviteToken={params.invite}
          initialEmail={params.email}
          initialName={params.name}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <OnboardingWizard mode="register" />
    </main>
  );
}