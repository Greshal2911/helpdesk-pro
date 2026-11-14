import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ notifications: [] });
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return NextResponse.json({ notifications });
}

export async function PATCH(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { userId?: string; id?: string };
  if (!body.userId)
    return NextResponse.json({ error: "A user is required." }, { status: 400 });
  await prisma.notification.updateMany({
    where: {
      userId: body.userId,
      readAt: null,
      ...(body.id ? { id: body.id } : {}),
    },
    data: { readAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
