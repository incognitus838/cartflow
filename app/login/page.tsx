import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getAuthContext } from "@/lib/auth-server";

export default async function LoginPage() {
  const ctx = await getAuthContext();
  if (ctx.session && ctx.user) {
    if (ctx.user.role === "ADMIN") {
      redirect("/admin");
    }
    redirect(ctx.business ? "/dashboard" : "/onboarding");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <LoginForm />
    </main>
  );
}