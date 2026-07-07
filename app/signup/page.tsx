import { redirect } from "next/navigation";
import { SignupForm } from "@/components/auth/signup-form";
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
    redirect(ctx.business ? "/dashboard" : "/onboarding");
  }

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