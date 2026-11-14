import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { firstIssue, replySchema } from "@/lib/ticket-validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const parsed = replySchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  try {
    const reply = await prisma.savedReply.update({
      where: { id },
      data: {
        title: parsed.data.title,
        body: parsed.data.body,
        category: parsed.data.category || null,
      },
    });
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "Saved reply not found." }, { status: 404 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  try {
    await prisma.savedReply.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Saved reply not found." }, { status: 404 });
  }
}
