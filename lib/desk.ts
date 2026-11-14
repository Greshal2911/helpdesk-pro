import type { Priority, TicketStatus } from "@prisma/client";
import { prisma } from "./prisma";

const personSelect = { id: true, name: true, email: true, role: true } as const;

export const ticketListInclude = {
  requester: { select: personSelect },
  assignee: { select: personSelect },
  _count: { select: { comments: true } },
} as const;

export const ticketDetailInclude = {
  ...ticketListInclude,
  comments: {
    include: { author: { select: personSelect } },
    orderBy: { createdAt: "asc" as const },
  },
  activities: {
    include: { actor: { select: personSelect } },
    orderBy: { createdAt: "desc" as const },
  },
  feedback: true,
  escalations: { orderBy: { createdAt: "desc" as const } },
} as const;

export async function requireUser(id: string) {
  return prisma.user.findFirst({ where: { id, active: true } });
}

export async function nextTicketNumber() {
  const rows = await prisma.ticket.findMany({ select: { number: true } });
  let max = 2400;
  for (const row of rows) {
    const value = Number(row.number.replace(/^HD-/, ""));
    if (Number.isFinite(value)) max = Math.max(max, value);
  }
  return `HD-${max + 1}`;
}

export async function dueDateForPriority(priority: Priority, explicit?: Date | null) {
  if (explicit) return explicit;
  const rule = await prisma.escalationRule.findUnique({ where: { priority } });
  const hours = rule?.enabled ? rule.thresholdHours : 24;
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

export async function recordActivity(
  ticketId: string,
  actorId: string,
  action: string,
  details?: string,
) {
  await prisma.ticketActivity.create({
    data: { ticketId, actorId, action, details },
  });
}

export async function notify(userId: string, title: string, body: string) {
  await prisma.notification.create({ data: { userId, title, body } });
}

export async function notifyOthers(
  userIds: Array<string | null | undefined>,
  actorId: string,
  title: string,
  body: string,
) {
  const unique = [...new Set(userIds.filter((id): id is string => Boolean(id)))].filter(
    (id) => id !== actorId,
  );
  await Promise.all(unique.map((userId) => notify(userId, title, body)));
}

const priorityRank: Record<Priority, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  CRITICAL: 3,
};

export function nextPriority(priority: Priority): Priority {
  const order: Priority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
  return order[Math.min(priorityRank[priority] + 1, order.length - 1)];
}

export function forViewer<
  T extends {
    comments: { internal: boolean }[];
    activities?: { action: string }[];
  },
>(ticket: T, role: "ADMIN" | "AGENT" | "REQUESTER") {
  if (role !== "REQUESTER") return ticket;
  return {
    ...ticket,
    comments: ticket.comments.filter((comment) => !comment.internal),
    activities: ticket.activities?.filter((activity) => activity.action !== "Added an internal note"),
  };
}

export function statusName(status: TicketStatus) {
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
