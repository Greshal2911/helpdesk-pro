"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { PriorityBadge, StatusBadge } from "@/components/badges";
import { canRunQueue, useActor } from "@/components/desk-shell";
import { api } from "@/lib/api-client";
import { CATEGORIES, PRIORITIES, STATUSES, type Priority, type TicketStatus } from "@/lib/constants";
import { dueLabel, formatWhen, isOverdue, priorityLabel, statusLabel, timeAgo, toLocalInput } from "@/lib/labels";
import type { SavedReply, TicketDetail } from "@/lib/types";

export default function TicketPage() {
  const params = useParams<{ number: string }>();
  const number = params.number;
  const { actor, users, refreshNotifications } = useActor();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [replies, setReplies] = useState<SavedReply[]>([]);
  const [error, setError] = useState("");
  const [body, setBody] = useState("");
  const [internal, setInternal] = useState(false);
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [escalateReason, setEscalateReason] = useState("Still blocked and needs a faster response.");
  const [busy, setBusy] = useState(false);
  const staff = canRunQueue(actor?.role);
  const agents = users.filter((user) => user.role !== "REQUESTER");

  const load = useCallback(async () => {
    if (!actor) return;
    const result = await api<{ ticket: TicketDetail }>(
      `/api/tickets/${number}?viewerId=${encodeURIComponent(actor.id)}`,
    );
    setTicket(result.ticket);
    setNotes(result.ticket.resolutionNotes ?? "");
  }, [actor, number]);

  useEffect(() => {
    if (!actor) return;
    load().catch((reason: Error) => setError(reason.message));
    if (staff) {
      api<{ replies: SavedReply[] }>("/api/replies")
        .then((result) => setReplies(result.replies))
        .catch(() => setReplies([]));
    }
  }, [actor, load, staff]);

  async function save(patch: Record<string, unknown>) {
    if (!actor) return;
    setBusy(true);
    setError("");
    try {
      const result = await api<{ ticket: TicketDetail }>(`/api/tickets/${number}`, {
        method: "PATCH",
        body: JSON.stringify({ actorId: actor.id, ...patch }),
      });
      setTicket(result.ticket);
      window.dispatchEvent(new Event("desk-changed"));
      await refreshNotifications();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update the ticket.");
    } finally {
      setBusy(false);
    }
  }

  async function sendReply(event: FormEvent) {
    event.preventDefault();
    if (!actor) return;
    setBusy(true);
    setError("");
    try {
      const result = await api<{ ticket: TicketDetail }>(`/api/tickets/${number}/comments`, {
        method: "POST",
        body: JSON.stringify({ actorId: actor.id, body, internal }),
      });
      setTicket(result.ticket);
      setBody("");
      setInternal(false);
      window.dispatchEvent(new Event("desk-changed"));
      await refreshNotifications();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not send the reply.");
    } finally {
      setBusy(false);
    }
  }

  async function escalate() {
    if (!actor) return;
    const reason = escalateReason.trim();
    if (!reason) return;
    setBusy(true);
    try {
      const result = await api<{ ticket: TicketDetail }>(`/api/tickets/${number}/escalate`, {
        method: "POST",
        body: JSON.stringify({ actorId: actor.id, reason }),
      });
      setTicket(result.ticket);
      window.dispatchEvent(new Event("desk-changed"));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not escalate.");
    } finally {
      setBusy(false);
    }
  }

  async function sendFeedback(event: FormEvent) {
    event.preventDefault();
    if (!actor) return;
    setBusy(true);
    try {
      const result = await api<{ ticket: TicketDetail }>(`/api/tickets/${number}/feedback`, {
        method: "POST",
        body: JSON.stringify({ actorId: actor.id, rating, comment: feedback }),
      });
      setTicket(result.ticket);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save feedback.");
    } finally {
      setBusy(false);
    }
  }

  if (error && !ticket) return <p className="p-8 text-sm text-rose-600">{error}</p>;
  if (!ticket) return <p className="p-8 text-sm text-slate-500">Loading ticket…</p>;

  const closed = ticket.status === "RESOLVED" || ticket.status === "CLOSED";

  return (
    <div className="mx-auto max-w-6xl px-4 py-7 md:px-8">
      <Link href="/tickets" className="text-xs font-bold text-indigo-600">
        Back to queue
      </Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-indigo-600">{ticket.number}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">{ticket.subject}</h1>
          <p className={`mt-2 text-sm ${isOverdue(ticket.dueDate, ticket.status) ? "font-semibold text-rose-600" : "text-slate-500"}`}>
            {ticket.requester.name} · {ticket.category} · {dueLabel(ticket.dueDate, ticket.status)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
        </div>
      </div>

      {error && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Request</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{ticket.description}</p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-bold">Conversation</h2>
            </div>
            <div className="space-y-4 px-5 py-4">
              {ticket.comments.length === 0 && (
                <p className="text-sm text-slate-500">No replies yet. The first response should say what you are doing next.</p>
              )}
              {ticket.comments.map((comment) => (
                <article key={comment.id} className={`rounded-xl px-4 py-3 ${comment.internal ? "bg-amber-50" : "bg-slate-50"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">
                      {comment.author.name}
                      {comment.internal ? " · Internal note" : ""}
                    </p>
                    <p className="text-[11px] text-slate-400">{formatWhen(comment.createdAt)}</p>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{comment.body}</p>
                </article>
              ))}
            </div>
            <form onSubmit={sendReply} className="border-t border-slate-100 p-5">
              {staff && replies.length > 0 && (
                <select
                  defaultValue=""
                  onChange={(event) => {
                    const reply = replies.find((item) => item.id === event.target.value);
                    if (!reply) return;
                    setBody((current) => (current ? `${current}\n\n${reply.body}` : reply.body));
                    event.target.value = "";
                  }}
                  className="mb-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">Insert a saved reply…</option>
                  {replies.map((reply) => (
                    <option key={reply.id} value={reply.id}>
                      {reply.title}
                    </option>
                  ))}
                </select>
              )}
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                onKeyDown={(event) => {
                  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                rows={4}
                placeholder={internal ? "Only the desk can see this note." : "Reply to the requester."}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                {staff ? (
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <input type="checkbox" checked={internal} onChange={(event) => setInternal(event.target.checked)} />
                    Internal note
                  </label>
                ) : (
                  <span />
                )}
                <button disabled={busy || !body.trim()} className="rounded-xl bg-[#5368d9] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                  {internal ? "Save note" : "Send reply"}
                </button>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">Ctrl+Enter sends. A reply while the ticket is waiting moves it back into progress.</p>
            </form>
          </section>
        </div>

        <aside className="space-y-4">
          {staff && (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Next step</h2>
              <div className="mt-3 flex flex-col gap-2">
                {ticket.status === "OPEN" && (
                  <button disabled={busy} onClick={() => save({ status: "IN_PROGRESS", assigneeId: ticket.assignee?.id ?? actor?.id })} className="rounded-xl bg-[#101a31] px-3 py-2 text-sm font-semibold text-white">
                    Take this ticket
                  </button>
                )}
                {ticket.status === "IN_PROGRESS" && (
                  <button disabled={busy} onClick={() => save({ status: "PENDING" })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold">
                    Waiting on requester
                  </button>
                )}
                {!closed && (
                  <button disabled={busy} onClick={() => save({ status: "RESOLVED", resolutionNotes: notes })} className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">
                    Mark resolved
                  </button>
                )}
                {ticket.status === "RESOLVED" && (
                  <button disabled={busy} onClick={() => save({ status: "CLOSED" })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold">
                    Close
                  </button>
                )}
                {closed && (
                  <button disabled={busy} onClick={() => save({ status: "OPEN" })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold">
                    Reopen
                  </button>
                )}
                {!closed && (
                  <>
                    <input
                      value={escalateReason}
                      onChange={(event) => setEscalateReason(event.target.value)}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    />
                    <button disabled={busy} onClick={() => void escalate()} className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700">
                      Escalate
                    </button>
                  </>
                )}
              </div>
            </section>
          )}

          <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Details</h2>
            <label className="block text-xs font-bold text-slate-600">
              Status
              <select
                disabled={!staff || busy}
                value={ticket.status}
                onChange={(event) => save({ status: event.target.value as TicketStatus })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>{statusLabel(status)}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-bold text-slate-600">
              Priority
              <select
                disabled={!staff || busy}
                value={ticket.priority}
                onChange={(event) => save({ priority: event.target.value as Priority })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium"
              >
                {PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>{priorityLabel(priority)}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-bold text-slate-600">
              Category
              <select
                disabled={!staff || busy}
                value={ticket.category}
                onChange={(event) => save({ category: event.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium"
              >
                {CATEGORIES.map((category) => (
                  <option key={category}>{category}</option>
                ))}
                {!CATEGORIES.includes(ticket.category as (typeof CATEGORIES)[number]) && (
                  <option>{ticket.category}</option>
                )}
              </select>
            </label>
            <label className="block text-xs font-bold text-slate-600">
              Assignee
              <select
                disabled={!staff || busy}
                value={ticket.assignee?.id ?? ""}
                onChange={(event) => save({ assigneeId: event.target.value || null })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium"
              >
                <option value="">Unassigned</option>
                {agents.map((user) => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-bold text-slate-600">
              Due
              <input
                disabled={!staff || busy}
                type="datetime-local"
                defaultValue={toLocalInput(ticket.dueDate)}
                key={ticket.dueDate ?? "none"}
                onBlur={(event) => {
                  const value = event.target.value;
                  save({ dueDate: value ? new Date(value).toISOString() : null });
                }}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium"
              />
            </label>
            <label className="block text-xs font-bold text-slate-600">
              Resolution notes
              <textarea
                disabled={!staff || busy}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                onBlur={() => {
                  if (notes !== (ticket.resolutionNotes ?? "")) save({ resolutionNotes: notes });
                }}
                rows={4}
                placeholder="What fixed it, or what the requester should do."
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium"
              />
            </label>
            <p className="text-[11px] text-slate-400">Opened {timeAgo(ticket.createdAt)} · Updated {timeAgo(ticket.updatedAt)}</p>
          </section>

          {closed && (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Requester feedback</h2>
              {ticket.feedback ? (
                <p className="mt-3 text-sm">
                  <span className="font-bold">{ticket.feedback.rating}/5</span>
                  {ticket.feedback.comment ? ` · ${ticket.feedback.comment}` : ""}
                </p>
              ) : (
                <form onSubmit={sendFeedback} className="mt-3 space-y-2">
                  <select value={rating} onChange={(event) => setRating(Number(event.target.value))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                    {[5, 4, 3, 2, 1].map((value) => (
                      <option key={value} value={value}>{value} / 5</option>
                    ))}
                  </select>
                  <textarea value={feedback} onChange={(event) => setFeedback(event.target.value)} rows={3} placeholder="Was this resolved the way you needed?" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                  <button disabled={busy} className="rounded-xl bg-[#5368d9] px-3 py-2 text-sm font-semibold text-white">
                    Save feedback
                  </button>
                </form>
              )}
            </section>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">History</h2>
            <div className="mt-3 space-y-3">
              {ticket.activities.map((item) => (
                <div key={item.id}>
                  <p className="text-sm font-semibold">{item.action}</p>
                  <p className="text-xs text-slate-500">{item.actor.name} · {formatWhen(item.createdAt)}</p>
                  {item.details && <p className="mt-1 text-xs text-slate-600">{item.details}</p>}
                </div>
              ))}
              {ticket.escalations.length > 0 && (
                <p className="text-xs text-rose-600">{ticket.escalations.length} escalation{ticket.escalations.length === 1 ? "" : "s"} on this ticket.</p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
