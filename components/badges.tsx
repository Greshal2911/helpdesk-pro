import type { Priority, TicketStatus } from "@/lib/constants";
import { priorityLabel, statusLabel } from "@/lib/labels";

const priorityStyles: Record<Priority, string> = {
  CRITICAL: "bg-rose-50 text-rose-700 ring-rose-100",
  HIGH: "bg-orange-50 text-orange-700 ring-orange-100",
  MEDIUM: "bg-amber-50 text-amber-800 ring-amber-100",
  LOW: "bg-slate-100 text-slate-600 ring-slate-200",
};

const statusStyles: Record<TicketStatus, string> = {
  OPEN: "bg-blue-50 text-blue-700",
  IN_PROGRESS: "bg-indigo-50 text-indigo-700",
  PENDING: "bg-amber-50 text-amber-800",
  RESOLVED: "bg-emerald-50 text-emerald-700",
  CLOSED: "bg-slate-100 text-slate-600",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`rounded-md px-2 py-1 text-[11px] font-bold ring-1 ${priorityStyles[priority]}`}>
      {priorityLabel(priority)}
    </span>
  );
}

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className={`rounded-md px-2 py-1 text-[11px] font-bold ${statusStyles[status]}`}>
      {statusLabel(status)}
    </span>
  );
}
