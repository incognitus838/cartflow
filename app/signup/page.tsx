import { redirect } from "next/navigation";
import { SignupForm } from "@/components/auth/signup-form";
import { getAuthContext } from "@/lib/auth-server";

export default async function SignupPage() {
  const ctx = await getAuthContext();
  if (ctx.session) {
    redirect(ctx.business ? "/dashboard" : "/onboarding");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <SignupForm />
    </main>
  );
}