"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2, LifeBuoy, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

const demoAccounts = [
  { label: "Administrator", email: "admin@helpdesk.local" },
  { label: "Support agent", email: "agent@helpdesk.local" },
  { label: "Requester", email: "requester@helpdesk.local" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("requester@helpdesk.local");
  const [password, setPassword] = useState("DemoPass123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Unable to sign in.");
      setLoading(false);
      return;
    }
    localStorage.setItem("helpdesk-user", JSON.stringify(data.user));
    router.push("/");
  }

  return (
    <main className="grid min-h-screen bg-[#f5f7fb] lg:grid-cols-[1.05fr_0.95fr]">
      <section className="hidden bg-[#101a31] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-400 text-[#101a31]">
              <LifeBuoy size={22} />
            </div>
            <span className="text-lg font-bold">
              HelpDesk <span className="text-indigo-300">Pro</span>
            </span>
          </div>
          <div className="mt-24 max-w-lg">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">
              Support operations
            </p>
            <h1 className="mt-5 text-5xl font-bold leading-[1.05] tracking-tight">
              Make every support moment count.
            </h1>
            <p className="mt-6 max-w-md text-sm leading-6 text-slate-400">
              A focused workspace for resolving requests, measuring quality, and
              keeping your team in sync.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck size={16} className="text-emerald-400" /> Role-based
          access with an auditable ticket history
        </div>
      </section>
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white">
                <LifeBuoy size={22} />
              </div>
              <span className="text-lg font-bold">HelpDesk Pro</span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_14px_40px_rgba(23,42,77,0.07)]">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
              Welcome back
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              Sign in to your workspace
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Choose a demo role or enter your account details.
            </p>
            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <label className="block">
                <span className="text-xs font-bold text-slate-600">
                  Email address
                </span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold text-slate-600">
                  Password
                </span>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                />
              </label>
              {error && (
                <p
                  role="alert"
                  className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600"
                >
                  {error}
                </p>
              )}
              <button
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5368d9] py-3 text-sm font-bold text-white transition hover:bg-[#455acb] disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
                <ArrowRight size={16} />
              </button>
            </form>
            <div className="mt-7 border-t border-slate-100 pt-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Demo accounts
              </p>
              <div className="mt-3 space-y-2">
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    onClick={() => {
                      setEmail(account.email);
                      setPassword("DemoPass123!");
                    }}
                    className="flex w-full items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-left hover:border-indigo-200 hover:bg-indigo-50/50"
                  >
                    <span className="text-xs font-semibold text-slate-700">
                      {account.label}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {account.email}
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-400">
                <CheckCircle2 size={13} className="text-emerald-500" /> Password
                for all demo accounts: DemoPass123!
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
