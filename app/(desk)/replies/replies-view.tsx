"use client";

import { FormEvent, useEffect, useState } from "react";
import { canRunQueue, useActor } from "@/components/desk-shell";
import { api } from "@/lib/api-client";
import { CATEGORIES } from "@/lib/constants";
import type { SavedReply } from "@/lib/types";

export default function RepliesPage() {
  const { actor } = useActor();
  const [replies, setReplies] = useState<SavedReply[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const staff = canRunQueue(actor?.role);

  async function load() {
    const result = await api<{ replies: SavedReply[] }>("/api/replies");
    setReplies(result.replies);
  }

  useEffect(() => {
    load().catch((reason: Error) => setError(reason.message));
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await api("/api/replies", {
        method: "POST",
        body: JSON.stringify({ title, body, category }),
      });
      setTitle("");
      setBody("");
      setCategory("");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save that reply.");
    }
  }

  async function remove(id: string) {
    await api(`/api/replies/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-7 md:px-8">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Speed</p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight">Saved replies</h1>
      <p className="mt-1 text-sm text-slate-500">
        Store the answers you send often. On a ticket, insert one and edit it before sending.
      </p>

      {staff && (
        <form onSubmit={onSubmit} className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <input value={title} onChange={(event) => setTitle(event.target.value)} required placeholder="Title, such as Password reset" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
          <textarea value={body} onChange={(event) => setBody(event.target.value)} required rows={4} placeholder="The reply text" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
            <option value="">Any category</option>
            {CATEGORIES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button className="rounded-xl bg-[#5368d9] px-4 py-2.5 text-sm font-semibold text-white">Save reply</button>
        </form>
      )}

      <div className="mt-5 space-y-3">
        {replies.map((reply) => (
          <article key={reply.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold">{reply.title}</h2>
                {reply.category && <p className="mt-1 text-xs font-semibold text-indigo-600">{reply.category}</p>}
              </div>
              {staff && (
                <button onClick={() => void remove(reply.id)} className="text-xs font-bold text-rose-600">
                  Delete
                </button>
              )}
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{reply.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
