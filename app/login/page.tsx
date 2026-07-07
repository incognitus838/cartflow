import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getAuthContext } from "@/lib/auth-server";

type PageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const nextPath = typeof params.next === "string" ? params.next : undefined;
  const ctx = await getAuthContext();
  if (ctx.session && ctx.user) {
    if (nextPath?.startsWith("/")) {
      redirect(nextPath);
    }
    if (ctx.user.role === "ADMIN") {
      redirect("/admin");
    }
    redirect(ctx.business ? "/dashboard" : "/onboarding");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <LoginForm nextPath={nextPath} />
    </main>
  );
}