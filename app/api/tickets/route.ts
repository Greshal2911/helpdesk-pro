import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { nextTicketNumber, dueDateForPriority, recordActivity, notifyOthers, ticketListInclude, requireUser } from "@/lib/desk";
import { prisma } from "@/lib/prisma";
import { firstIssue, ticketSchema } from "@/lib/ticket-validation";

const openStatuses = ["OPEN", "IN_PROGRESS", "PENDING"] as const;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const search = params.get("search")?.trim();
  const status = params.get("status");
  const priority = params.get("priority");
  const category = params.get("category");
  const assignee = params.get("assignee");
  const overdue = params.get("overdue") === "1";
  const scope = params.get("scope");
  const actorId = params.get("actorId");
  const sort = params.get("sort") ?? "newest";

  const where: Prisma.TicketWhereInput = {};
  if (status && status !== "ALL") where.status = status as Prisma.TicketWhereInput["status"];
  if (priority && priority !== "ALL")
    where.priority = priority as Prisma.TicketWhereInput["priority"];
  if (category && category !== "ALL") where.category = category;
  if (assignee === "unassigned") where.assigneeId = null;
  else if (assignee && assignee !== "ALL") where.assigneeId = assignee;
  if (overdue) {
    where.dueDate = { lt: new Date() };
    where.status = status && status !== "ALL" ? where.status : { in: [...openStatuses] };
  }
  if (scope === "mine" && actorId) {
    const actor = await requireUser(actorId);
    if (actor?.role === "REQUESTER") where.requesterId = actor.id;
    else if (actor) where.assigneeId = actor.id;
  }
  if (search) {
    where.OR = [
      { subject: { contains: search } },
      { description: { contains: search } },
      { number: { contains: search } },
      { requester: { name: { contains: search } } },
      { assignee: { name: { contains: search } } },
    ];
  }

  const tickets = await prisma.ticket.findMany({
    where,
    include: ticketListInclude,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  if (sort === "due") {
    tickets.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.getTime() - b.dueDate.getTime();
    });
  }
  if (sort === "priority") {
    const rank = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    tickets.sort((a, b) => rank[a.priority] - rank[b.priority]);
  }

  return NextResponse.json({ tickets });
}

export async function POST(request: NextRequest) {
  const parsed = ticketSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });

  const actor = parsed.data.actorId ? await requireUser(parsed.data.actorId) : null;
  const requester = parsed.data.requesterId
    ? await requireUser(parsed.data.requesterId)
    : actor?.role === "REQUESTER"
      ? actor
      : await prisma.user.findFirst({
          where: { active: true, role: "REQUESTER" },
          orderBy: { name: "asc" },
        });
  if (!requester)
    return NextResponse.json(
      { error: "Choose the person this request is for." },
      { status: 400 },
    );

  let assigneeId: string | null = parsed.data.assigneeId ?? null;
  if (assigneeId) {
    const assignee = await requireUser(assigneeId);
    if (!assignee || assignee.role === "REQUESTER")
      return NextResponse.json(
        { error: "Assign the ticket to an agent or admin." },
        { status: 400 },
      );
  }

  const dueDate = await dueDateForPriority(parsed.data.priority, parsed.data.dueDate);
  const ticket = await prisma.ticket.create({
    data: {
      number: await nextTicketNumber(),
      subject: parsed.data.subject,
      description: parsed.data.description,
      category: parsed.data.category,
      priority: parsed.data.priority,
      requesterId: requester.id,
      assigneeId,
      dueDate,
    },
    include: ticketListInclude,
  });

  const actorId = actor?.id ?? requester.id;
  await recordActivity(
    ticket.id,
    actorId,
    "Opened ticket",
    `${ticket.number} · ${ticket.category} · ${ticket.priority}`,
  );
  await notifyOthers(
    [assigneeId, requester.id],
    actorId,
    `New ticket ${ticket.number}`,
    ticket.subject,
  );

  return NextResponse.json({ ticket }, { status: 201 });
}
