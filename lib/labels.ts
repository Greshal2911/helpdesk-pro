import type { Priority, Role, TicketStatus } from "./constants";

export function statusLabel(status: TicketStatus) {
  switch (status) {
    case "OPEN":
      return "Open";
    case "IN_PROGRESS":
      return "In progress";
    case "PENDING":
      return "Waiting";
    case "RESOLVED":
      return "Resolved";
    case "CLOSED":
      return "Closed";
  }
}

export function priorityLabel(priority: Priority) {
  return priority.charAt(0) + priority.slice(1).toLowerCase();
}

export function roleLabel(role: Role) {
  switch (role) {
    case "ADMIN":
      return "Admin";
    case "AGENT":
      return "Agent";
    case "REQUESTER":
      return "Requester";
  }
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function timeAgo(iso: string) {
  const delta = Date.now() - new Date(iso).getTime();
  const mins = Math.round(delta / 60000);
  if (Math.abs(mins) < 1) return "just now";
  const sign = mins < 0 ? "from now" : "ago";
  const abs = Math.abs(mins);
  if (abs < 60) return `${abs}m ${sign}`;
  const hours = Math.round(abs / 60);
  if (hours < 24) return `${hours}h ${sign}`;
  const days = Math.round(hours / 24);
  return `${days}d ${sign}`;
}

export function dueLabel(iso: string | null, status: TicketStatus) {
  if (!iso) return "No due date";
  const when = new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  if (status === "RESOLVED" || status === "CLOSED") return when;
  if (new Date(iso).getTime() < Date.now()) return `Overdue · ${when}`;
  return `Due ${when}`;
}

export function isOverdue(iso: string | null, status: TicketStatus) {
  if (!iso) return false;
  if (status === "RESOLVED" || status === "CLOSED") return false;
  return new Date(iso).getTime() < Date.now();
}

export function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
