import { NextRequest, NextResponse } from "next/server";
import { forViewer, recordActivity, requireUser, ticketDetailInclude } from "@/lib/desk";
import { prisma } from "@/lib/prisma";
import { feedbackSchema, firstIssue } from "@/lib/ticket-validation";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ number: string }> },
) {
  const { number } = await params;
  const parsed = feedbackSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });

  const actor = await requireUser(parsed.data.actorId);
  if (!actor) return NextResponse.json({ error: "Choose who is rating this." }, { status: 400 });

  const ticket = await prisma.ticket.findUnique({ where: { number } });
  if (!ticket) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  if (ticket.status !== "RESOLVED" && ticket.status !== "CLOSED")
    return NextResponse.json(
      { error: "Rate the ticket after it is resolved." },
      { status: 400 },
    );

  await prisma.feedback.upsert({
    where: { ticketId: ticket.id },
    update: { rating: parsed.data.rating, comment: parsed.data.comment || null },
    create: {
      ticketId: ticket.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment || null,
    },
  });
  await recordActivity(
    ticket.id,
    actor.id,
    "Left feedback",
    `${parsed.data.rating}/5${parsed.data.comment ? ` · ${parsed.data.comment}` : ""}`,
  );

  const updated = await prisma.ticket.findUnique({
    where: { number },
    include: ticketDetailInclude,
  });
  return NextResponse.json({
    ticket: updated ? forViewer(updated, actor.role) : updated,
  });
}
