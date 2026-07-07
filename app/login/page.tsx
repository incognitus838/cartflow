import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { clearSession } from "@/lib/auth";
import { getAuthContext } from "@/lib/auth-server";

type PageProps = {
  searchParams: Promise<{ next?: string; reason?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const nextPath = typeof params.next === "string" ? params.next : undefined;
  const reason = typeof params.reason === "string" ? params.reason : undefined;
  const ctx = await getAuthContext();

  if (ctx.session && ctx.user) {
    if (nextPath?.startsWith("/")) {
      redirect(nextPath);
    } else if (ctx.user.role === "ADMIN") {
      redirect("/admin");
    } else if (ctx.business) {
      redirect("/dashboard");
    } else {
      await clearSession();
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <LoginForm nextPath={nextPath} reason={reason} />
    </main>
  );
}