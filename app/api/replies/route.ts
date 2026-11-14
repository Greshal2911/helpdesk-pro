import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { firstIssue, replySchema } from "@/lib/ticket-validation";

export async function GET() {
  const replies = await prisma.savedReply.findMany({ orderBy: { title: "asc" } });
  return NextResponse.json({ replies });
}

export async function POST(request: NextRequest) {
  const parsed = replySchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  const reply = await prisma.savedReply.create({
    data: {
      title: parsed.data.title,
      body: parsed.data.body,
      category: parsed.data.category || null,
    },
  });
  return NextResponse.json({ reply }, { status: 201 });
}
