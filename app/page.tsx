"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpenCheck,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  Command,
  FileText,
  Filter,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
  Ticket,
  Users,
  X,
} from "lucide-react";

type Status = "Open" | "In progress" | "Pending" | "Resolved";
type Priority = "Critical" | "High" | "Medium" | "Low";
type TicketRecord = {
  id: string;
  subject: string;
  requester: string;
  initials: string;
  agent: string;
  priority: Priority;
  status: Status;
  due: string;
  time: string;
  escalated?: boolean;
};
type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "AGENT" | "REQUESTER";
};

const initialTickets: TicketRecord[] = [
  {
    id: "HD-1042",
    subject: "Cannot access analytics workspace",
    requester: "Maya Patel",
    initials: "MP",
    agent: "Jordan Lee",
    priority: "Critical",
    status: "Open",
    due: "Today, 4:30 PM",
    time: "18 min ago",
    escalated: true,
  },
  {
    id: "HD-1041",
    subject: "SSO login loops after password reset",
    requester: "Noah Williams",
    initials: "NW",
    agent: "Ava Thompson",
    priority: "High",
    status: "In progress",
    due: "Today, 6:00 PM",
    time: "43 min ago",
  },
  {
    id: "HD-1039",
    subject: "Exported report has missing rows",
    requester: "Sofia Garcia",
    initials: "SG",
    agent: "Jordan Lee",
    priority: "High",
    status: "Pending",
    due: "Tomorrow",
    time: "2 hr ago",
  },
  {
    id: "HD-1038",
    subject: "Add a new member to the design team",
    requester: "Ethan Chen",
    initials: "EC",
    agent: "Ava Thompson",
    priority: "Medium",
    status: "Resolved",
    due: "Resolved",
    time: "3 hr ago",
  },
  {
    id: "HD-1037",
    subject: "Webhook delivery is delayed",
    requester: "Olivia Brown",
    initials: "OB",
    agent: "Sam Rivera",
    priority: "High",
    status: "In progress",
    due: "Tomorrow",
    time: "5 hr ago",
  },
];

const navItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "All tickets", icon: Ticket, count: "24" },
  { label: "My tickets", icon: FileText, count: "8" },
  { label: "Create ticket", icon: Plus },
  { label: "Team management", icon: Users },
  { label: "Reports & analytics", icon: BarChart3 },
  { label: "STQA test center", icon: BookOpenCheck },
  { label: "Settings", icon: Settings },
];

const priorityStyles: Record<Priority, string> = {
  Critical: "bg-rose-50 text-rose-600 ring-rose-100",
  High: "bg-orange-50 text-orange-600 ring-orange-100",
  Medium: "bg-amber-50 text-amber-700 ring-amber-100",
  Low: "bg-slate-100 text-slate-600 ring-slate-200",
};
const statusStyles: Record<Status, string> = {
  Open: "bg-blue-50 text-blue-700",
  "In progress": "bg-indigo-50 text-indigo-700",
  Pending: "bg-amber-50 text-amber-700",
  Resolved: "bg-emerald-50 text-emerald-700",
};

function MetricCard({
  label,
  value,
  change,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  change: string;
  icon: typeof Ticket;
  tone: string;
}) {
  return (
    <div className="rise-in rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(23,42,77,0.03)]">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}
        >
          <Icon size={17} />
        </div>
        <span className="text-xs font-semibold text-emerald-600">{change}</span>
      </div>
      <p className="mt-5 text-[13px] font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  );
}

function MiniChart() {
  const heights = [
    35, 50, 42, 63, 48, 76, 57, 72, 68, 88, 65, 94, 81, 100, 92, 110, 102, 118,
  ];
  return (
    <div className="flex h-44 items-end gap-2 px-1 pt-8">
      {heights.map((height, index) => (
        <div key={index} className="group flex h-full flex-1 items-end">
          <div
            style={{ height: `${height}px` }}
            className={`w-full rounded-t-md transition-all group-hover:bg-indigo-500 ${index > 13 ? "bg-indigo-400" : "bg-indigo-100"}`}
          />
        </div>
      ))}
    </div>
  );
}

function WorkspaceView({
  activeNav,
  tickets,
  onCreate,
}: {
  activeNav: string;
  tickets: TicketRecord[];
  onCreate: () => void;
}) {
  const viewCopy: Record<
    string,
    { eyebrow: string; title: string; description: string }
  > = {
    "All tickets": {
      eyebrow: "Ticket queue",
      title: "All tickets",
      description:
        "Search, filter, and manage every request in your workspace.",
    },
    "My tickets": {
      eyebrow: "Assigned to you",
      title: "My tickets",
      description: "Your active workload and tickets that need a response.",
    },
    "Team management": {
      eyebrow: "People and workload",
      title: "Team management",
      description: "Review agent availability and current ticket assignments.",
    },
    "Reports & analytics": {
      eyebrow: "Operations intelligence",
      title: "Reports & analytics",
      description: "Understand volume, resolution speed, and queue health.",
    },
    "STQA test center": {
      eyebrow: "Quality assurance",
      title: "STQA test center",
      description:
        "Execute manual test cases and track the health of this project.",
    },
    Settings: {
      eyebrow: "Workspace preferences",
      title: "Settings",
      description:
        "Manage profile, notifications, categories, and escalation rules.",
    },
  };
  const copy = viewCopy[activeNav] ?? viewCopy["All tickets"];

  return (
    <div className="mx-auto max-w-[1480px] px-5 py-7 md:px-9">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
            {copy.eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {copy.title}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{copy.description}</p>
        </div>
        {(activeNav === "All tickets" || activeNav === "My tickets") && (
          <button
            onClick={onCreate}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#5368d9] px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Plus size={17} /> Create ticket
          </button>
        )}
      </div>
      {activeNav === "All tickets" || activeNav === "My tickets" ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <h3 className="text-sm font-bold">
              {tickets.length} tickets in this view
            </h3>
            <span className="text-xs text-slate-400">Live workspace queue</span>
          </div>
          <div className="divide-y divide-slate-100">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex flex-wrap items-center justify-between gap-4 p-5 hover:bg-slate-50"
              >
                <div>
                  <p className="text-xs font-bold text-indigo-600">
                    {ticket.id}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {ticket.subject}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Requested by {ticket.requester} · Assigned to {ticket.agent}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-md px-2 py-1 text-[10px] font-bold ring-1 ${priorityStyles[ticket.priority]}`}
                  >
                    {ticket.priority}
                  </span>
                  <span
                    className={`rounded-md px-2 py-1 text-[10px] font-bold ${statusStyles[ticket.status]}`}
                  >
                    {ticket.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Current view
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-900">
              {activeNav === "STQA test center"
                ? "25"
                : activeNav === "Team management"
                  ? "8"
                  : "92%"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {activeNav === "STQA test center"
                ? "documented test cases"
                : activeNav === "Team management"
                  ? "active team members"
                  : "workspace health score"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Next action
            </p>
            <p className="mt-3 text-sm font-semibold text-slate-800">
              {activeNav === "STQA test center"
                ? "Execute pending regression cases"
                : activeNav === "Settings"
                  ? "Review escalation thresholds"
                  : "Review this week&apos;s activity"}
            </p>
            <button className="mt-5 text-xs font-bold text-indigo-600">
              Open workspace details{" "}
              <ArrowUpRight size={13} className="inline" />
            </button>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Status
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-[72%] rounded-full bg-indigo-500" />
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Updated a few moments ago
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [tickets, setTickets] = useState(initialTickets);
  const [activeNav, setActiveNav] = useState("Overview");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
  const [showCreate, setShowCreate] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState<SessionUser>({
    id: "",
    name: "Jordan Davis",
    email: "admin@helpdesk.local",
    role: "ADMIN",
  });
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const storedUser = window.localStorage.getItem("helpdesk-user");
    if (storedUser) setCurrentUser(JSON.parse(storedUser) as SessionUser);
  }, []);
  const userInitials = currentUser.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const roleLabel =
    currentUser.role === "ADMIN"
      ? "Administrator"
      : currentUser.role === "AGENT"
        ? "Support agent"
        : "Requester";
  const visibleTickets = useMemo(
    () =>
      tickets.filter(
        (ticket) =>
          (statusFilter === "All" || ticket.status === statusFilter) &&
          `${ticket.id} ${ticket.subject} ${ticket.requester}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [tickets, query, statusFilter],
  );
  const notify = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  };
  const updateStatus = (id: string, status: Status) => {
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === id ? { ...ticket, status } : ticket,
      ),
    );
    notify(`Ticket ${id} moved to ${status}.`);
  };
  const addTicket = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = String(data.get("subject") || "New support request");
    const description = String(data.get("description") || "");
    const category = String(data.get("category") || "General");
    const priority = String(data.get("priority") || "Medium").toUpperCase();
    const storedUser = window.localStorage.getItem("helpdesk-user");
    const requesterId = storedUser
      ? JSON.parse(storedUser).id
      : "cmv9o8yu5000284ty9rmenaf8";
    const response = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject,
        description,
        category,
        priority,
        requesterId,
      }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      notify(error?.error ?? "Ticket could not be saved.");
      return;
    }
    const result = await response.json();
    setTickets((current) => [
      {
        id: result.ticket.number,
        subject: result.ticket.subject,
        requester: result.ticket.requester.name,
        initials: "YO",
        agent: "Unassigned",
        priority:
          result.ticket.priority === "CRITICAL"
            ? "Critical"
            : result.ticket.priority === "HIGH"
              ? "High"
              : result.ticket.priority === "LOW"
                ? "Low"
                : "Medium",
        status: "Open",
        due: "Tomorrow",
        time: "Just now",
      },
      ...current,
    ]);
    setShowCreate(false);
    notify("Ticket created and added to the queue.");
  };

  return (
    <div className="flex min-h-screen bg-[#f5f7fb] text-slate-900">
      <aside
        className={`${showMobileNav ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} fixed inset-y-0 left-0 z-30 flex w-[248px] flex-col border-r border-white/10 bg-[#101a31] text-slate-300 transition-transform lg:static`}
      >
        <div className="flex h-[76px] items-center gap-3 border-b border-white/10 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-400 text-[#101a31]">
            <LifeBuoy size={21} />
          </div>
          <div>
            <p className="text-[15px] font-bold tracking-tight text-white">
              HelpDesk <span className="text-indigo-300">Pro</span>
            </p>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
              Support operations
            </p>
          </div>
        </div>
        <div className="px-4 pt-7">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
            Workspace
          </p>
          <nav className="mt-3 space-y-1">
            {navItems.map(({ label, icon: Icon, count }) => (
              <button
                key={label}
                onClick={() => {
                  setActiveNav(label);
                  setShowMobileNav(false);
                  if (label === "Create ticket") setShowCreate(true);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition ${activeNav === label ? "bg-indigo-500/20 text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-100"}`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={17} />
                  {label}
                </span>
                {count && (
                  <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] text-slate-400">
                    {count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <Sparkles size={14} className="text-indigo-300" /> STQA progress
              </span>
              <span className="text-xs font-semibold text-indigo-300">72%</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[72%] rounded-full bg-indigo-400" />
            </div>
            <p className="mt-3 text-[11px] leading-4 text-slate-500">
              18 of 25 test cases executed this cycle.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-4">
            <div
              key={`sidebar-avatar-${currentUser.id || currentUser.email}`}
              aria-label={`${currentUser.name} avatar`}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-200 text-xs font-bold text-orange-800"
            >
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-200">
                {currentUser.name}
              </p>
              <p className="text-[11px] text-slate-500">{roleLabel}</p>
            </div>
            <MoreHorizontal size={16} className="text-slate-500" />
          </div>
        </div>
      </aside>
      {showMobileNav && (
        <button
          aria-label="Close navigation"
          onClick={() => setShowMobileNav(false)}
          className="fixed inset-0 z-20 bg-slate-900/40 lg:hidden"
        />
      )}
      <main className="min-w-0 flex-1">
        <header className="flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/80 px-5 backdrop-blur md:px-9">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileNav(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                <span>Workspace</span>
                <span>/</span>
                <span className="text-slate-600">{activeNav}</span>
              </div>
              <h1 className="mt-1 text-lg font-bold tracking-tight text-slate-900">
                {activeNav === "Overview" ? (
                  <>
                    Good morning, Jordan <span className="text-lg">✦</span>
                  </>
                ) : (
                  activeNav
                )}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden h-9 w-56 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-400 md:flex">
              <Search size={15} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tickets..."
                className="w-full bg-transparent outline-none placeholder:text-slate-400"
              />
              <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-400">
                <Command size={10} />
              </kbd>
            </div>
            <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100">
              <Bell size={18} />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>
            <div className="hidden h-7 w-px bg-slate-200 md:block" />
            <button
              onClick={() => setShowProfile((open) => !open)}
              className="flex items-center gap-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-200 text-xs font-bold text-orange-800">
                {userInitials}
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </button>
            {showProfile && (
              <div className="absolute right-5 top-16 z-20 w-56 rounded-xl border border-slate-200 bg-white p-3 shadow-xl md:right-9">
                <p className="text-xs font-bold text-slate-800">
                  {currentUser.name}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {currentUser.email}
                </p>
                <p className="mt-3 rounded-lg bg-indigo-50 px-2 py-1.5 text-[11px] font-semibold text-indigo-700">
                  {roleLabel}
                </p>
                <button
                  onClick={() => {
                    window.localStorage.removeItem("helpdesk-user");
                    window.location.href = "/login";
                  }}
                  className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </header>
        {activeNav !== "Overview" && activeNav !== "Create ticket" ? (
          <WorkspaceView
            activeNav={activeNav}
            tickets={visibleTickets}
            onCreate={() => setShowCreate(true)}
          />
        ) : (
          <div className="mx-auto max-w-[1480px] px-5 py-7 md:px-9">
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <p className="text-sm text-slate-500">
                Here&apos;s what&apos;s happening across your support queue.
              </p>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#5368d9] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_6px_14px_rgba(83,104,217,0.22)] transition hover:bg-[#455acb]"
              >
                <Plus size={17} /> Create ticket
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              <MetricCard
                label="Total tickets"
                value="128"
                change="+12.5%"
                icon={Ticket}
                tone="bg-indigo-50 text-indigo-600"
              />
              <MetricCard
                label="Open tickets"
                value="24"
                change="+4.2%"
                icon={CircleHelp}
                tone="bg-blue-50 text-blue-600"
              />
              <MetricCard
                label="In progress"
                value="18"
                change="+8.1%"
                icon={Activity}
                tone="bg-violet-50 text-violet-600"
              />
              <MetricCard
                label="Resolved"
                value="86"
                change="+18.4%"
                icon={CheckCircle2}
                tone="bg-emerald-50 text-emerald-600"
              />
              <MetricCard
                label="Overdue"
                value="7"
                change="-2.4%"
                icon={AlertTriangle}
                tone="bg-rose-50 text-rose-600"
              />
              <MetricCard
                label="Avg. resolution"
                value="4h 12m"
                change="-14.8%"
                icon={Clock3}
                tone="bg-amber-50 text-amber-600"
              />
            </div>
            <div className="mt-5 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
              <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(23,42,77,0.03)]">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Ticket volume
                    </h2>
                    <p className="mt-1 text-xs text-slate-400">
                      Tickets created over the last 30 days
                    </p>
                  </div>
                  <select className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-600 outline-none">
                    <option>Last 30 days</option>
                    <option>Last 7 days</option>
                  </select>
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                  128{" "}
                  <span className="text-xs font-medium text-emerald-600">
                    ↑ 12.5%
                  </span>
                </div>
                <MiniChart />
                <div className="mt-2 flex justify-between text-[10px] text-slate-400">
                  <span>Sep 15</span>
                  <span>Sep 22</span>
                  <span>Sep 29</span>
                  <span>Oct 06</span>
                  <span>Oct 14</span>
                </div>
              </section>
              <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(23,42,77,0.03)]">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Queue health
                    </h2>
                    <p className="mt-1 text-xs text-slate-400">
                      Current ticket distribution
                    </p>
                  </div>
                  <MoreHorizontal size={17} className="text-slate-400" />
                </div>
                <div className="mt-6 flex items-center gap-6">
                  <div
                    className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background:
                        "conic-gradient(#5368d9 0 67%, #f5b84b 67% 81%, #f17676 81% 87%, #dce2ec 87% 100%)",
                    }}
                  >
                    <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white">
                      <span className="text-2xl font-bold">128</span>
                      <span className="text-[10px] text-slate-400">total</span>
                    </div>
                  </div>
                  <div className="space-y-3 text-xs">
                    {[
                      ["Open", "24", "bg-blue-500"],
                      ["In progress", "18", "bg-indigo-500"],
                      ["Pending", "7", "bg-amber-400"],
                      ["Resolved", "86", "bg-emerald-500"],
                    ].map(([name, value, color]) => (
                      <div key={name} className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${color}`} />
                        <span className="w-20 text-slate-500">{name}</span>
                        <span className="font-bold text-slate-800">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
            <div className="mt-5 grid gap-5 xl:grid-cols-[1.65fr_1fr]">
              <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_5px_20px_rgba(23,42,77,0.03)]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Recent tickets
                    </h2>
                    <p className="mt-1 text-xs text-slate-400">
                      Stay on top of your team&apos;s latest activity
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 items-center gap-2 rounded-lg border border-slate-200 px-2.5 md:hidden">
                      <Search size={14} className="text-slate-400" />
                      <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search"
                        className="w-20 text-xs outline-none"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(event) =>
                        setStatusFilter(event.target.value as Status | "All")
                      }
                      className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-600 outline-none"
                    >
                      <option value="All">All statuses</option>
                      <option>Open</option>
                      <option>In progress</option>
                      <option>Pending</option>
                      <option>Resolved</option>
                    </select>
                    <button className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-600">
                      <Filter size={13} /> Filter
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left">
                    <thead className="bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="px-5 py-3">Ticket</th>
                        <th className="px-3 py-3">Requester</th>
                        <th className="px-3 py-3">Assignee</th>
                        <th className="px-3 py-3">Priority</th>
                        <th className="px-3 py-3">Status</th>
                        <th className="px-3 py-3">Due date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {visibleTickets.map((ticket) => (
                        <tr
                          key={ticket.id}
                          className="group transition hover:bg-slate-50/70"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                <Ticket size={15} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-bold text-indigo-600">
                                    {ticket.id}
                                  </span>
                                  {ticket.escalated && (
                                    <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-rose-600">
                                      Escalated
                                    </span>
                                  )}
                                </div>
                                <p className="mt-0.5 max-w-[210px] truncate text-xs font-semibold text-slate-800">
                                  {ticket.subject}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-4">
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-[9px] font-bold text-orange-700">
                                {ticket.initials}
                              </span>
                              {ticket.requester}
                            </div>
                          </td>
                          <td className="px-3 py-4 text-xs text-slate-600">
                            {ticket.agent}
                          </td>
                          <td className="px-3 py-4">
                            <span
                              className={`rounded-md px-2 py-1 text-[10px] font-bold ring-1 ${priorityStyles[ticket.priority]}`}
                            >
                              {ticket.priority}
                            </span>
                          </td>
                          <td className="px-3 py-4">
                            <select
                              aria-label={`Status for ${ticket.id}`}
                              value={ticket.status}
                              onChange={(event) =>
                                updateStatus(
                                  ticket.id,
                                  event.target.value as Status,
                                )
                              }
                              className={`rounded-md border-0 px-2 py-1 text-[10px] font-bold outline-none ${statusStyles[ticket.status]}`}
                            >
                              <option>Open</option>
                              <option>In progress</option>
                              <option>Pending</option>
                              <option>Resolved</option>
                            </select>
                          </td>
                          <td className="px-3 py-4 text-[11px] font-medium text-slate-500">
                            {ticket.due}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {visibleTickets.length === 0 && (
                    <div className="p-10 text-center text-sm text-slate-400">
                      No tickets match your current filters.
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-[11px] text-slate-400">
                  <span>Showing {visibleTickets.length} of 128 tickets</span>
                  <button className="flex items-center gap-1 font-semibold text-indigo-600">
                    View all tickets <ArrowUpRight size={13} />
                  </button>
                </div>
              </section>
              <div className="space-y-5">
                <section className="rounded-2xl border border-rose-100 bg-[#fffafa] p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                      <AlertTriangle size={16} className="text-rose-500" />{" "}
                      Needs attention
                    </h2>
                    <span className="rounded-md bg-rose-100 px-2 py-1 text-[10px] font-bold text-rose-600">
                      7 tickets
                    </span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {tickets
                      .filter(
                        (ticket) =>
                          ticket.escalated || ticket.priority === "Critical",
                      )
                      .slice(0, 2)
                      .map((ticket) => (
                        <div
                          key={ticket.id}
                          className="rounded-xl border border-rose-100 bg-white p-3"
                        >
                          <p className="text-[10px] font-bold text-rose-500">
                            {ticket.id} · {ticket.time}
                          </p>
                          <p className="mt-1 text-xs font-semibold leading-4 text-slate-800">
                            {ticket.subject}
                          </p>
                          <div className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                            <Clock3 size={12} /> Due {ticket.due}
                          </div>
                        </div>
                      ))}
                  </div>
                  <button className="mt-4 flex w-full items-center justify-center gap-1 text-xs font-bold text-rose-600">
                    Review escalations <ArrowUpRight size={13} />
                  </button>
                </section>
                <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(23,42,77,0.03)]">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-900">
                      Latest activity
                    </h2>
                    <button className="text-[11px] font-bold text-indigo-600">
                      View log
                    </button>
                  </div>
                  <div className="mt-4 space-y-4">
                    {[
                      [
                        "AM",
                        "Ava Thompson",
                        "assigned HD-1041 to herself",
                        "12 min ago",
                        "bg-violet-100 text-violet-700",
                      ],
                      [
                        "SL",
                        "Sam Rivera",
                        "added a comment on HD-1037",
                        "38 min ago",
                        "bg-emerald-100 text-emerald-700",
                      ],
                      [
                        "JD",
                        "Jordan Davis",
                        "escalated HD-1042",
                        "1 hr ago",
                        "bg-orange-100 text-orange-700",
                      ],
                    ].map(([initials, person, action, time, color]) => (
                      <div key={time} className="flex gap-3">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${color}`}
                        >
                          {initials}
                        </span>
                        <div>
                          <p className="text-[11px] leading-4 text-slate-600">
                            <span className="font-bold text-slate-800">
                              {person}
                            </span>{" "}
                            {action}
                          </p>
                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}
      </main>
      {notice && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-[#101a31] px-4 py-3 text-sm font-semibold text-white shadow-xl"
        >
          <CheckCircle2 size={16} className="text-emerald-400" /> {notice}
        </div>
      )}
      {showCreate && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  New request
                </p>
                <h2 className="mt-1 text-xl font-bold tracking-tight">
                  Create a support ticket
                </h2>
              </div>
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={addTicket} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-xs font-bold text-slate-600">
                  Subject
                </span>
                <input
                  required
                  name="subject"
                  maxLength={120}
                  placeholder="What do you need help with?"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-indigo-100 focus:ring-4"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold text-slate-600">
                  Description
                </span>
                <textarea
                  required
                  name="description"
                  rows={4}
                  placeholder="Add useful context for the support team..."
                  className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-indigo-100 focus:ring-4"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label>
                  <span className="text-xs font-bold text-slate-600">
                    Category
                  </span>
                  <select
                    name="category"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
                  >
                    <option>General</option>
                    <option>Access</option>
                    <option>Authentication</option>
                    <option>Reporting</option>
                    <option>Integrations</option>
                  </select>
                </label>
                <label>
                  <span className="text-xs font-bold text-slate-600">
                    Priority
                  </span>
                  <select
                    name="priority"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
                  >
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                    <option>Low</option>
                  </select>
                </label>
              </div>
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#5368d9] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#455acb]"
                >
                  Create ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
