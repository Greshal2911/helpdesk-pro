import { NextRequest, NextResponse } from "next/server";
import {
  forViewer,
  notifyOthers,
  recordActivity,
  requireUser,
  statusName,
  ticketDetailInclude,
} from "@/lib/desk";
import { prisma } from "@/lib/prisma";
import { firstIssue, ticketUpdateSchema } from "@/lib/ticket-validation";

type RouteContext = { params: Promise<{ number: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { number } = await params;
  const ticket = await prisma.ticket.findUnique({
    where: { number },
    include: ticketDetailInclude,
  });
  if (!ticket) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });

  const viewerId = request.nextUrl.searchParams.get("viewerId");
  const viewer = viewerId ? await requireUser(viewerId) : null;
  return NextResponse.json({
    ticket: viewer ? forViewer(ticket, viewer.role) : ticket,
  });
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { number } = await params;
  const parsed = ticketUpdateSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });

  const actor = await requireUser(parsed.data.actorId);
  if (!actor)
    return NextResponse.json({ error: "Choose who is making this change." }, { status: 400 });

  const existing = await prisma.ticket.findUnique({
    where: { number },
    include: { assignee: true, requester: true },
  });
  if (!existing) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });

  const data = parsed.data;
  if (actor.role === "REQUESTER") {
    const forbidden =
      data.assigneeId !== undefined ||
      data.priority !== undefined ||
      data.category !== undefined ||
      data.status !== undefined ||
      data.resolutionNotes !== undefined;
    if (forbidden)
      return NextResponse.json(
        { error: "Requesters can update the description, not the queue." },
        { status: 403 },
      );
  }

  let assigneeId = data.assigneeId;
  if (assigneeId) {
    const assignee = await requireUser(assigneeId);
    if (!assignee || assignee.role === "REQUESTER")
      return NextResponse.json(
        { error: "Assign the ticket to an agent or admin." },
        { status: 400 },
      );
  }

  const changes: string[] = [];
  if (data.status && data.status !== existing.status)
    changes.push(`Status: ${statusName(existing.status)} → ${statusName(data.status)}`);
  if (data.priority && data.priority !== existing.priority)
    changes.push(`Priority: ${existing.priority} → ${data.priority}`);
  if (data.category && data.category !== existing.category)
    changes.push(`Category: ${existing.category} → ${data.category}`);
  if (data.subject && data.subject !== existing.subject) changes.push("Updated the subject");
  if (data.description && data.description !== existing.description)
    changes.push("Updated the description");
  if (data.assigneeId !== undefined && data.assigneeId !== existing.assigneeId) {
    const nextName = data.assigneeId
      ? (await requireUser(data.assigneeId))?.name ?? "someone"
      : "Unassigned";
    changes.push(`Assignee: ${existing.assignee?.name ?? "Unassigned"} → ${nextName}`);
  }
  if (data.dueDate !== undefined) {
    const next = data.dueDate ? data.dueDate.toISOString() : null;
    const prev = existing.dueDate ? existing.dueDate.toISOString() : null;
    if (next !== prev) changes.push(next ? "Updated the due date" : "Cleared the due date");
  }
  if (
    data.resolutionNotes !== undefined &&
    data.resolutionNotes !== existing.resolutionNotes
  )
    changes.push("Updated the resolution notes");

  const ticket = await prisma.ticket.update({
    where: { number },
    data: {
      subject: data.subject,
      description: data.description,
      category: data.category,
      priority: data.priority,
      status: data.status,
      assigneeId,
      dueDate: data.dueDate,
      resolutionNotes: data.resolutionNotes,
    },
    include: ticketDetailInclude,
  });

  if (changes.length) {
    await recordActivity(ticket.id, actor.id, "Updated ticket", changes.join(" · "));
    await notifyOthers(
      [ticket.requesterId, ticket.assigneeId],
      actor.id,
      `${ticket.number} updated`,
      changes.join(" · "),
    );
  }

  const fresh = await prisma.ticket.findUnique({
    where: { number },
    include: ticketDetailInclude,
  });
  return NextResponse.json({
    ticket: forViewer(fresh ?? ticket, actor.role),
  });
}
