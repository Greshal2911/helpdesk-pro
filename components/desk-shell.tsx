"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  FormEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Bell,
  BookOpenCheck,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  Plus,
  Search,
  Users,
  X,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { initials, roleLabel, timeAgo } from "@/lib/labels";
import type { DeskNotification, Person } from "@/lib/types";

const STORAGE_KEY = "helpdesk-actor-id";

type ActorContextValue = {
  users: Person[];
  actor: Person | null;
  setActorId: (id: string) => void;
  ready: boolean;
  notifications: DeskNotification[];
  refreshNotifications: () => Promise<void>;
  markNotificationsRead: () => Promise<void>;
};

const ActorContext = createContext<ActorContextValue | null>(null);

export function useActor() {
  const value = useContext(ActorContext);
  if (!value) throw new Error("useActor must be used inside the desk");
  return value;
}

export function canRunQueue(role: Person["role"] | undefined) {
  return role === "ADMIN" || role === "AGENT";
}

const nav = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/tickets", label: "Queue", icon: Inbox },
  { href: "/tickets/new", label: "New ticket", icon: Plus },
  { href: "/team", label: "Team", icon: Users },
  { href: "/replies", label: "Saved replies", icon: BookOpenCheck },
];

export function DeskShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [users, setUsers] = useState<Person[]>([]);
  const [actorId, setActorIdState] = useState("");
  const [ready, setReady] = useState(false);
  const [notifications, setNotifications] = useState<DeskNotification[]>([]);
  const [showNav, setShowNav] = useState(false);
  const [showBell, setShowBell] = useState(false);
  const [search, setSearch] = useState("");

  const actor = users.find((user) => user.id === actorId) ?? null;

  const refreshNotifications = useCallback(async () => {
    if (!actorId) return;
    const result = await api<{ notifications: DeskNotification[] }>(
      `/api/notifications?userId=${encodeURIComponent(actorId)}`,
    );
    setNotifications(result.notifications);
  }, [actorId]);

  useEffect(() => {
    let active = true;
    api<{ users: Person[] }>("/api/users")
      .then((result) => {
        if (!active) return;
        setUsers(result.users);
        const stored = window.localStorage.getItem(STORAGE_KEY);
        const match = result.users.find((user) => user.id === stored);
        const fallback =
          result.users.find((user) => user.role === "ADMIN") ?? result.users[0];
        setActorIdState(match?.id ?? fallback?.id ?? "");
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!actorId) return;
    window.localStorage.setItem(STORAGE_KEY, actorId);
    void refreshNotifications();
  }, [actorId, refreshNotifications]);

  useEffect(() => {
    const onChange = () => void refreshNotifications();
    window.addEventListener("desk-changed", onChange);
    window.addEventListener("focus", onChange);
    return () => {
      window.removeEventListener("desk-changed", onChange);
      window.removeEventListener("focus", onChange);
    };
  }, [refreshNotifications]);

  const unread = notifications.filter((item) => !item.readAt).length;

  async function markNotificationsRead() {
    if (!actorId || unread === 0) return;
    await api("/api/notifications", {
      method: "PATCH",
      body: JSON.stringify({ userId: actorId }),
    });
    setNotifications((current) =>
      current.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })),
    );
  }

  function setActorId(id: string) {
    setActorIdState(id);
    setShowBell(false);
  }

  function onSearch(event: FormEvent) {
    event.preventDefault();
    const value = search.trim();
    router.push(value ? `/tickets?search=${encodeURIComponent(value)}` : "/tickets");
    setShowNav(false);
  }

  const value = useMemo<ActorContextValue>(
    () => ({
      users,
      actor,
      setActorId,
      ready,
      notifications,
      refreshNotifications,
      markNotificationsRead,
    }),
    [users, actor, ready, notifications, refreshNotifications],
  );

  return (
    <ActorContext.Provider value={value}>
      <div className="min-h-screen bg-[#f4f6fb] text-slate-900">
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#101a31] text-white transition-transform ${showNav ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
        >
          <div className="flex items-center gap-3 px-5 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-400 text-[#101a31]">
              <LifeBuoy size={20} />
            </div>
            <div>
              <p className="text-sm font-bold">HelpDesk Pro</p>
              <p className="text-[11px] text-slate-400">Support desk</p>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-3">
            {nav.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : item.href === "/tickets"
                    ? pathname === "/tickets"
                    : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowNav(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5"}`}
                >
                  <Icon size={17} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-white/10 p-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Working as
            </label>
            <select
              value={actorId}
              onChange={(event) => setActorId(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
            >
              {users.map((user) => (
                <option key={user.id} value={user.id} className="text-slate-900">
                  {user.name} · {roleLabel(user.role)}
                </option>
              ))}
            </select>
            <p className="mt-2 text-[11px] leading-4 text-slate-400">
              Replies and updates are recorded under this person. No sign-in step.
            </p>
          </div>
        </aside>
        {showNav && (
          <button
            aria-label="Close menu"
            className="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
            onClick={() => setShowNav(false)}
          />
        )}
        <div className="md:pl-64">
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-[#f4f6fb]/95 px-4 py-3 backdrop-blur md:px-8">
            <button
              className="rounded-lg border border-slate-200 bg-white p-2 md:hidden"
              onClick={() => setShowNav(true)}
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <form onSubmit={onSearch} className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tickets, people, or HD- numbers"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
              />
            </form>
            <div className="relative">
              <button
                aria-label="Notifications"
                onClick={() => {
                  setShowBell((open) => !open);
                  void markNotificationsRead();
                }}
                className="relative rounded-xl border border-slate-200 bg-white p-2.5"
              >
                <Bell size={18} />
                {unread > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </button>
              {showBell && (
                <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-bold">Updates for {actor?.name ?? "you"}</p>
                    <button onClick={() => setShowBell(false)} aria-label="Close notifications">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="max-h-80 overflow-auto">
                    {notifications.length === 0 && (
                      <p className="px-4 py-6 text-sm text-slate-500">You are caught up.</p>
                    )}
                    {notifications.map((item) => (
                      <div key={item.id} className="border-b border-slate-50 px-4 py-3">
                        <p className="text-sm font-semibold">{item.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.body}</p>
                        <p className="mt-1 text-[11px] text-slate-400">{timeAgo(item.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                {actor ? initials(actor.name) : "—"}
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold">{actor?.name ?? "Loading"}</p>
                <p className="text-[11px] text-slate-500">
                  {actor ? roleLabel(actor.role) : ""}
                </p>
              </div>
            </div>
          </header>
          <main>{ready ? children : <p className="p-8 text-sm text-slate-500">Loading the desk…</p>}</main>
        </div>
      </div>
    </ActorContext.Provider>
  );
}
