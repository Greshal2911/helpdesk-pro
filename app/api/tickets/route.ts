import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const ticketSchema = z.object({
  subject: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(5000),
  category: z.string().trim().min(1).max(60),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  dueDate: z.coerce.date().optional(),
  requesterId: z.string().min(1),
});

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

export async function POST(request: NextRequest) {
  const parsed = ticketSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid ticket data", issues: parsed.error.flatten() },
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
    data: { ...parsed.data, number: `HD-${lastNumber + 1}` },
    include: { requester: { select: { id: true, name: true } } },
  });
  return NextResponse.json({ ticket }, { status: 201 });
}
