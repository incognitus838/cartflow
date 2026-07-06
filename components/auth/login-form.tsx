"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/auth-card";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Login failed");
        return;
      }

      toast.success("Welcome back!");
      router.push(data.redirectTo || "/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Log in"
      subtitle="Sellers and platform admins use the same login page"
      footer={
        <>
          No account?{" "}
          <Link href="/signup" className="font-medium text-emerald-700 hover:underline">
            Create your store
          </Link>
          <p className="mt-4 rounded-lg bg-slate-100 px-3 py-2.5 text-xs text-slate-600">
            <span className="font-medium text-slate-800">Platform admin?</span> Log in at{" "}
            <span className="font-mono text-slate-800">/login</span> with your admin email — you
            will be sent to <span className="font-mono text-slate-800">/admin</span> automatically.
            Demo admin: <span className="font-mono">admin@cartflow.app</span> /{" "}
            <span className="font-mono">demo12345</span>
            <br />
            Demo seller: <span className="font-mono">demo@cartflow.app</span> /{" "}
            <span className="font-mono">demo12345</span>
            <br />
            If those fail, run <span className="font-mono">npm run db:ensure-users</span> in the
            project folder.
          </p>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            placeholder="••••••••"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
          {loading ? "Signing in…" : "Log in"}
        </button>
      </form>
    </AuthCard>
  );
}