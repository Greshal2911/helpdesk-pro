"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useActor } from "@/components/desk-shell";
import { api } from "@/lib/api-client";
import { CATEGORIES, PRIORITIES, type Priority } from "@/lib/constants";
import { priorityLabel } from "@/lib/labels";
import type { TicketSummary } from "@/lib/types";

export default function NewTicketPage() {
  const router = useRouter();
  const { actor, users } = useActor();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [requesterId, setRequesterId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const staff = users.filter((user) => user.role !== "REQUESTER");
  const selectedRequester = actor?.role === "REQUESTER" ? actor.id : requesterId;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!actor) return;
    setSaving(true);
    setError("");
    try {
      const result = await api<{ ticket: TicketSummary }>("/api/tickets", {
        method: "POST",
        body: JSON.stringify({
          subject,
          description,
          category,
          priority,
          requesterId: selectedRequester || undefined,
          assigneeId: assigneeId || null,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
          actorId: actor.id,
        }),
      });
      window.dispatchEvent(new Event("desk-changed"));
      router.push(`/tickets/${result.ticket.number}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not create the ticket.");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-7 md:px-8">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">New request</p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight">File a ticket</h1>
      <p className="mt-1 text-sm text-slate-500">
        Write what is broken, who it affects, and how urgent it is. Leave the due date empty to use the priority target.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="block">
          <span className="text-xs font-bold text-slate-600">Subject</span>
          <input
            required
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="VPN drops every few minutes"
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-slate-600">What happened</span>
          <textarea
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={6}
            placeholder="What were you doing, what did you expect, and what happened instead?"
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-bold text-slate-600">Category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
              {CATEGORIES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-bold text-slate-600">Priority</span>
            <select value={priority} onChange={(event) => setPriority(event.target.value as Priority)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
              {PRIORITIES.map((item) => (
                <option key={item} value={item}>{priorityLabel(item)}</option>
              ))}
            </select>
          </label>
          {actor?.role !== "REQUESTER" && (
            <label className="block">
              <span className="text-xs font-bold text-slate-600">Requester</span>
              <select value={requesterId} onChange={(event) => setRequesterId(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
                <option value="">First available requester</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </label>
          )}
          {actor?.role !== "REQUESTER" && (
            <label className="block">
              <span className="text-xs font-bold text-slate-600">Assign to</span>
              <select value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
                <option value="">Leave unassigned</option>
                {staff.map((user) => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </label>
          )}
          <label className="block sm:col-span-2">
            <span className="text-xs font-bold text-slate-600">Due date</span>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </label>
        </div>
        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <button disabled={saving} className="rounded-xl bg-[#5368d9] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
          {saving ? "Creating…" : "Create ticket"}
        </button>
      </form>
    </div>
  );
}
