"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { priorityLabel, timeAgo } from "@/lib/labels";
import type { DashboardData } from "@/lib/types";
import { PriorityBadge, StatusBadge } from "@/components/badges";

const cards = [
  { key: "open", label: "Open", href: "/tickets?status=OPEN", hint: "Not started" },
  { key: "inProgress", label: "In progress", href: "/tickets?status=IN_PROGRESS", hint: "Someone is on it" },
  { key: "waiting", label: "Waiting", href: "/tickets?status=PENDING", hint: "Blocked on the requester" },
  { key: "overdue", label: "Overdue", href: "/tickets?overdue=1", hint: "Past the response target" },
  { key: "unassigned", label: "Unassigned", href: "/tickets?assignee=unassigned", hint: "Needs an owner" },
  { key: "resolvedThisWeek", label: "Closed this week", href: "/tickets?status=RESOLVED", hint: "Resolved or closed" },
] as const;

export default function OverviewPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<DashboardData>("/api/dashboard")
      .then(setData)
      .catch((reason: Error) => setError(reason.message));
  }, []);

  if (error) return <p className="p-8 text-sm text-rose-600">{error}</p>;
  if (!data) return <p className="p-8 text-sm text-slate-500">Loading the queue summary…</p>;

  const maxDay = Math.max(1, ...data.createdByDay.map((day) => day.count));

  return (
    <div className="mx-auto max-w-6xl px-4 py-7 md:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Today</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">What needs attention</h1>
          <p className="mt-1 text-sm text-slate-500">
            Start with overdue and unassigned tickets, then work the rest of the queue.
          </p>
        </div>
        <Link
          href="/tickets/new"
          className="rounded-xl bg-[#5368d9] px-4 py-2.5 text-center text-sm font-semibold text-white"
        >
          New ticket
        </Link>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-indigo-200"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{card.label}</p>
            <p className="mt-2 text-3xl font-bold">{data.counts[card.key]}</p>
            <p className="mt-1 text-xs text-slate-500">{card.hint}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-bold">Work these first</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {data.attention.length === 0 && (
              <p className="px-5 py-8 text-sm text-slate-500">Nothing is overdue or unassigned.</p>
            )}
            {data.attention.map((ticket) => (
              <Link
                key={`${ticket.number}-${ticket.reason}`}
                href={`/tickets/${ticket.number}`}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50"
              >
                <div>
                  <p className="text-xs font-bold text-indigo-600">{ticket.number}</p>
                  <p className="mt-1 text-sm font-semibold">{ticket.subject}</p>
                  <p className="mt-1 text-xs text-slate-500">{ticket.reason}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <PriorityBadge priority={ticket.priority} />
                  <StatusBadge status={ticket.status} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold">Opened in the last 7 days</h2>
          <div className="mt-4 flex h-36 items-end gap-2">
            {data.createdByDay.map((day) => (
              <div key={day.label} className="flex h-full flex-1 flex-col justify-end">
                <div
                  className="rounded-t-md bg-indigo-400"
                  style={{ height: `${Math.max(8, (day.count / maxDay) * 100)}%` }}
                  title={`${day.count} tickets`}
                />
                <p className="mt-2 text-center text-[10px] font-semibold text-slate-400">{day.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-2">
            {data.byPriority.map((item) => (
              <div key={item.priority} className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{priorityLabel(item.priority)} still open</span>
                <span className="font-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-bold">Agent workload</h2>
            <Link href="/team" className="text-xs font-bold text-indigo-600">
              Open team
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {data.workload.map((agent) => (
              <Link
                key={agent.id}
                href={`/tickets?assignee=${agent.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-slate-50"
              >
                <span className="text-sm font-semibold">{agent.name}</span>
                <span className="text-xs text-slate-500">
                  {agent.open} active
                  {agent.overdue > 0 ? ` · ${agent.overdue} overdue` : ""}
                </span>
              </Link>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-bold">Latest changes</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {data.activity.map((item) => (
              <Link
                key={item.id}
                href={`/tickets/${item.ticketNumber}`}
                className="block px-5 py-3 hover:bg-slate-50"
              >
                <p className="text-sm">
                  <span className="font-semibold">{item.actorName}</span> {item.action.toLowerCase()}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {item.ticketNumber} · {item.ticketSubject}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">{timeAgo(item.createdAt)}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
