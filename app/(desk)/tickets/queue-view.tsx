"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { PriorityBadge, StatusBadge } from "@/components/badges";
import { useActor } from "@/components/desk-shell";
import { api } from "@/lib/api-client";
import { CATEGORIES, PRIORITIES, STATUSES } from "@/lib/constants";
import { dueLabel, isOverdue, priorityLabel, statusLabel, timeAgo } from "@/lib/labels";
import type { TicketSummary } from "@/lib/types";

function Queue() {
  const router = useRouter();
  const params = useSearchParams();
  const { actor } = useActor();
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const queryString = params.toString();

  useEffect(() => {
    if (!actor) return;
    const next = new URLSearchParams(queryString);
    next.set("actorId", actor.id);
    setLoading(true);
    api<{ tickets: TicketSummary[] }>(`/api/tickets?${next.toString()}`)
      .then((result) => {
        setTickets(result.tickets);
        setError("");
      })
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, [actor, queryString]);

  function update(key: string, value: string) {
    const next = new URLSearchParams(queryString);
    if (!value || value === "ALL") next.delete(key);
    else next.set(key, value);
    if (key !== "scope") next.delete("scope");
    const query = next.toString();
    router.replace(query ? `/tickets?${query}` : "/tickets");
  }

  function setScope(scope: string) {
    const next = new URLSearchParams(queryString);
    ["status", "assignee", "overdue", "scope"].forEach((key) => next.delete(key));
    if (scope === "mine") next.set("scope", "mine");
    if (scope === "unassigned") next.set("assignee", "unassigned");
    if (scope === "overdue") next.set("overdue", "1");
    if (scope === "open") next.set("status", "OPEN");
    const query = next.toString();
    router.replace(query ? `/tickets?${query}` : "/tickets");
  }

  const scope = params.get("scope");
  const activeChip = scope === "mine"
    ? "mine"
    : params.get("overdue") === "1"
      ? "overdue"
      : params.get("assignee") === "unassigned"
        ? "unassigned"
        : params.get("status") === "OPEN"
          ? "open"
          : !params.get("status") && !params.get("assignee") && !params.get("overdue") && !scope
            ? "all"
            : "";

  return (
    <div className="mx-auto max-w-6xl px-4 py-7 md:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Queue</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Tickets</h1>
          <p className="mt-1 text-sm text-slate-500">
            {loading ? "Loading…" : `${tickets.length} matching tickets`}
          </p>
        </div>
        <Link href="/tickets/new" className="rounded-xl bg-[#5368d9] px-4 py-2.5 text-center text-sm font-semibold text-white">
          New ticket
        </Link>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {[
          ["all", "All"],
          ["open", "Open"],
          ["mine", actor?.role === "REQUESTER" ? "My requests" : "Assigned to me"],
          ["unassigned", "Unassigned"],
          ["overdue", "Overdue"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setScope(id)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${activeChip === id ? "bg-[#101a31] text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-4">
        <select value={params.get("status") ?? "ALL"} onChange={(event) => update("status", event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
          <option value="ALL">Any status</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>{statusLabel(status)}</option>
          ))}
        </select>
        <select value={params.get("priority") ?? "ALL"} onChange={(event) => update("priority", event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
          <option value="ALL">Any priority</option>
          {PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>{priorityLabel(priority)}</option>
          ))}
        </select>
        <select value={params.get("category") ?? "ALL"} onChange={(event) => update("category", event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
          <option value="ALL">Any category</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <select value={params.get("sort") ?? "newest"} onChange={(event) => update("sort", event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
          <option value="newest">Newest first</option>
          <option value="due">Soonest due date</option>
          <option value="priority">Highest priority</option>
        </select>
      </div>

      {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {tickets.length === 0 && !loading && (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-semibold">No tickets match these filters.</p>
            <p className="mt-1 text-sm text-slate-500">Clear a filter or file a new request.</p>
          </div>
        )}
        <div className="divide-y divide-slate-100">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/tickets/${ticket.number}`}
              className="grid gap-3 px-5 py-4 hover:bg-slate-50 md:grid-cols-[140px_1fr_auto] md:items-center"
            >
              <div>
                <p className="text-xs font-bold text-indigo-600">{ticket.number}</p>
                <p className={`mt-1 text-xs font-semibold ${isOverdue(ticket.dueDate, ticket.status) ? "text-rose-600" : "text-slate-400"}`}>
                  {dueLabel(ticket.dueDate, ticket.status)}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold">{ticket.subject}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {ticket.requester.name} · {ticket.category} · {ticket.assignee?.name ?? "Unassigned"} · {ticket._count.comments} replies · updated {timeAgo(ticket.updatedAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <PriorityBadge priority={ticket.priority} />
                <StatusBadge status={ticket.status} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TicketsPage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-slate-500">Loading the queue…</p>}>
      <Queue />
    </Suspense>
  );
}
