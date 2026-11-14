import { NextRequest, NextResponse } from "next/server";
import { forViewer, notifyOthers, recordActivity, requireUser, ticketDetailInclude } from "@/lib/desk";
import { prisma } from "@/lib/prisma";
import { commentSchema, firstIssue } from "@/lib/ticket-validation";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ number: string }> },
) {
  const { number } = await params;
  const parsed = commentSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });

  const author = await requireUser(parsed.data.actorId);
  if (!author)
    return NextResponse.json({ error: "Choose who is sending this reply." }, { status: 400 });

  const ticket = await prisma.ticket.findUnique({ where: { number } });
  if (!ticket) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });

  const internal = author.role === "REQUESTER" ? false : Boolean(parsed.data.internal);
  await prisma.comment.create({
    data: {
      body: parsed.data.body,
      internal,
      ticketId: ticket.id,
      authorId: author.id,
    },
  });
  await recordActivity(
    ticket.id,
    author.id,
    internal ? "Added an internal note" : "Replied",
    internal ? undefined : parsed.data.body.slice(0, 140),
  );

  if (!internal && ticket.status === "PENDING" && author.role !== "REQUESTER") {
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: "IN_PROGRESS" },
    });
    await recordActivity(ticket.id, author.id, "Updated ticket", "Status: Waiting → In progress");
  }
  if (!internal && author.role === "REQUESTER" && ticket.status === "PENDING") {
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: "OPEN" },
    });
    await recordActivity(ticket.id, author.id, "Updated ticket", "Status: Waiting → Open");
  }

  if (!internal) {
    await notifyOthers(
      [ticket.requesterId, ticket.assigneeId],
      author.id,
      `Reply on ${ticket.number}`,
      parsed.data.body.slice(0, 180),
    );
  } else if (ticket.assigneeId) {
    await notifyOthers(
      [ticket.assigneeId],
      author.id,
      `Internal note on ${ticket.number}`,
      parsed.data.body.slice(0, 180),
    );
  }

  const updated = await prisma.ticket.findUnique({
    where: { number },
    include: ticketDetailInclude,
  });
  return NextResponse.json(
    { ticket: updated ? forViewer(updated, author.role) : updated },
    { status: 201 },
  );
}
