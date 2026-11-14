import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const openStatuses = ["OPEN", "IN_PROGRESS", "PENDING"] as const;

export async function GET() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const [tickets, agents, activity] = await Promise.all([
    prisma.ticket.findMany({
      include: { assignee: { select: { id: true, name: true } } },
    }),
    prisma.user.findMany({
      where: { active: true, role: { in: ["AGENT", "ADMIN"] } },
      select: { id: true, name: true, role: true },
      orderBy: { name: "asc" },
    }),
    prisma.ticketActivity.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        actor: { select: { name: true } },
        ticket: { select: { number: true, subject: true } },
      },
    }),
  ]);

  const active = tickets.filter((ticket) =>
    openStatuses.includes(ticket.status as (typeof openStatuses)[number]),
  );
  const overdue = active.filter((ticket) => ticket.dueDate && ticket.dueDate < now);

  const counts = {
    open: tickets.filter((ticket) => ticket.status === "OPEN").length,
    inProgress: tickets.filter((ticket) => ticket.status === "IN_PROGRESS").length,
    waiting: tickets.filter((ticket) => ticket.status === "PENDING").length,
    overdue: overdue.length,
    unassigned: active.filter((ticket) => !ticket.assigneeId).length,
    resolvedThisWeek: tickets.filter(
      (ticket) =>
        (ticket.status === "RESOLVED" || ticket.status === "CLOSED") &&
        ticket.updatedAt >= weekAgo,
    ).length,
  };

  const byPriority = (["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((priority) => ({
    priority,
    count: active.filter((ticket) => ticket.priority === priority).length,
  }));

  const workload = agents.map((agent) => {
    const owned = tickets.filter((ticket) => ticket.assigneeId === agent.id);
    return {
      id: agent.id,
      name: agent.name,
      role: agent.role,
      open: owned.filter((ticket) =>
        openStatuses.includes(ticket.status as (typeof openStatuses)[number]),
      ).length,
      waiting: owned.filter((ticket) => ticket.status === "PENDING").length,
      overdue: owned.filter(
        (ticket) =>
          openStatuses.includes(ticket.status as (typeof openStatuses)[number]) &&
          ticket.dueDate &&
          ticket.dueDate < now,
      ).length,
    };
  });

  const attention = overdue
    .map((ticket) => ({ ticket, reason: "Past the response target" }))
    .concat(
      active
        .filter((ticket) => !ticket.assigneeId)
        .map((ticket) => ({ ticket, reason: "Nobody is assigned" })),
    )
    .concat(
      active
        .filter((ticket) => ticket.priority === "CRITICAL")
        .map((ticket) => ({ ticket, reason: "Critical priority" })),
    );

  const seen = new Set<string>();
  const attentionList = [];
  for (const item of attention) {
    if (seen.has(item.ticket.id)) continue;
    seen.add(item.ticket.id);
    attentionList.push({
      number: item.ticket.number,
      subject: item.ticket.subject,
      reason: item.reason,
      priority: item.ticket.priority,
      status: item.ticket.status,
      dueDate: item.ticket.dueDate,
    });
    if (attentionList.length === 8) break;
  }

  const createdByDay = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - (6 - index));
    const next = new Date(day);
    next.setDate(day.getDate() + 1);
    return {
      label: day.toLocaleDateString(undefined, { weekday: "short" }),
      count: tickets.filter((ticket) => ticket.createdAt >= day && ticket.createdAt < next)
        .length,
    };
  });

  return NextResponse.json({
    counts,
    byPriority,
    workload,
    attention: attentionList,
    activity: activity.map((item) => ({
      id: item.id,
      action: item.action,
      details: item.details,
      createdAt: item.createdAt,
      actorName: item.actor.name,
      ticketNumber: item.ticket.number,
      ticketSubject: item.ticket.subject,
    })),
    createdByDay,
  });
}
