"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { roleLabel } from "@/lib/labels";
import type { DashboardData } from "@/lib/types";

export default function TeamPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<DashboardData>("/api/dashboard")
      .then(setData)
      .catch((reason: Error) => setError(reason.message));
  }, []);

  if (error) return <p className="p-8 text-sm text-rose-600">{error}</p>;
  if (!data) return <p className="p-8 text-sm text-slate-500">Loading the team…</p>;

  const max = Math.max(1, ...data.workload.map((agent) => agent.open));

  return (
    <div className="mx-auto max-w-5xl px-4 py-7 md:px-8">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">People</p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight">Team workload</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-500">
        See who already has a full queue before you assign the next ticket. Open a person to filter the queue to their tickets.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {data.workload.map((agent) => (
          <Link
            key={agent.id}
            href={`/tickets?assignee=${agent.id}`}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-indigo-200"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-bold">{agent.name}</p>
                <p className="text-xs text-slate-500">{roleLabel(agent.role)}</p>
              </div>
              <p className="text-sm font-bold text-indigo-700">{agent.open} active</p>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-indigo-500" style={{ width: `${(agent.open / max) * 100}%` }} />
            </div>
            <p className="mt-3 text-xs text-slate-500">
              {agent.waiting} waiting on a requester
              {agent.overdue > 0 ? ` · ${agent.overdue} overdue` : " · none overdue"}
            </p>
          </Link>
        ))}
      </div>
      <Link href="/tickets?assignee=unassigned" className="mt-4 inline-flex text-sm font-bold text-indigo-600">
        View unassigned tickets
      </Link>
    </div>
  );
}
