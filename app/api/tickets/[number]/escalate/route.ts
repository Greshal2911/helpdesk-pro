import { NextRequest, NextResponse } from "next/server";
import { nextPriority, notifyOthers, recordActivity, requireUser, ticketDetailInclude } from "@/lib/desk";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ number: string }> },
) {
  const { number } = await params;
  const body = (await request.json().catch(() => ({}))) as {
    actorId?: string;
    reason?: string;
  };
  const actor = body.actorId ? await requireUser(body.actorId) : null;
  if (!actor || actor.role === "REQUESTER")
    return NextResponse.json({ error: "Only agents can escalate a ticket." }, { status: 403 });

  const ticket = await prisma.ticket.findUnique({ where: { number } });
  if (!ticket) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  if (ticket.status === "RESOLVED" || ticket.status === "CLOSED")
    return NextResponse.json({ error: "Reopen the ticket before escalating it." }, { status: 400 });

  const priority = nextPriority(ticket.priority);
  const level = (await prisma.escalationHistory.count({ where: { ticketId: ticket.id } })) + 1;
  const reason = body.reason?.trim() || "Escalated because it still needs attention.";

  await prisma.$transaction([
    prisma.ticket.update({
      where: { id: ticket.id },
      data: { priority, status: ticket.status === "PENDING" ? "OPEN" : ticket.status },
    }),
    prisma.escalationHistory.create({
      data: { ticketId: ticket.id, level, reason },
    }),
  ]);
  await recordActivity(ticket.id, actor.id, `Escalated to level ${level}`, reason);
  await notifyOthers(
    [ticket.assigneeId, ticket.requesterId],
    actor.id,
    `${ticket.number} escalated`,
    reason,
  );

  const updated = await prisma.ticket.findUnique({
    where: { number },
    include: ticketDetailInclude,
  });
  return NextResponse.json({ ticket: updated });
}
