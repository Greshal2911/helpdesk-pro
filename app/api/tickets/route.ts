import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { statusSchema, ticketSchema } from "@/lib/ticket-validation";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search")?.trim();
  const status = request.nextUrl.searchParams.get("status") as
    | "OPEN"
    | "IN_PROGRESS"
    | "PENDING"
    | "RESOLVED"
    | "CLOSED"
    | null;
  const tickets = await prisma.ticket.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { subject: { contains: search } },
              { description: { contains: search } },
            ],
          }
        : {}),
    },
    include: {
      requester: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ tickets });
}

export async function PATCH(request: NextRequest) {
  const number = request.nextUrl.searchParams.get("number");
  const parsed = statusSchema.safeParse((await request.json()).status);
  if (!number || !parsed.success)
    return NextResponse.json(
      { error: "A valid ticket status is required." },
      { status: 400 },
    );

  const ticket = await prisma.ticket.update({
    where: { number },
    data: { status: parsed.data },
    include: {
      requester: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json({ ticket });
}

export async function POST(request: NextRequest) {
  const parsed = ticketSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid ticket data", issues: parsed.error.flatten() },
      { status: 400 },
    );
  const requester = parsed.data.requesterId
    ? await prisma.user.findUnique({ where: { id: parsed.data.requesterId } })
    : await prisma.user.findFirst({
        where: { active: true },
        orderBy: { createdAt: "asc" },
      });
  if (!requester)
    return NextResponse.json(
      { error: "No active requester account is available." },
      { status: 400 },
    );
  const latestTicket = await prisma.ticket.findFirst({
    where: { number: { startsWith: "HD-" } },
    orderBy: { createdAt: "desc" },
    select: { number: true },
  });
  const lastNumber = latestTicket
    ? Number(latestTicket.number.replace("HD-", ""))
    : 1000;
  const ticket = await prisma.ticket.create({
    data: {
      ...parsed.data,
      requesterId: requester.id,
      number: `HD-${lastNumber + 1}`,
    },
    include: { requester: { select: { id: true, name: true } } },
  });
  return NextResponse.json({ ticket }, { status: 201 });
}
