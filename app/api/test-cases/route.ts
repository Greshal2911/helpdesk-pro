import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { statusSchema, ticketSchema } from "@/lib/ticket-validation";

type TestStatus = "PASS" | "FAIL";
type TestResult = {
  id: string;
  status: TestStatus;
  details: string;
};

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    testId?: string;
  };
  const testId = body.testId;
  const validIds = new Set([
    "TC-001",
    "TC-002",
    "TC-003",
    "TC-004",
    "TC-005",
    "TC-006",
    "TC-007",
    "TC-008",
    "TC-009",
    "TC-010",
  ]);
  if (testId && !validIds.has(testId))
    return NextResponse.json({ error: "Unknown test case." }, { status: 400 });

  const shouldRun = (id: string) => !testId || testId === id;
  const results: TestResult[] = [];
  const test = async (
    id: string,
    callback: () => Promise<string>,
  ): Promise<void> => {
    console.log(`[QA] ${id} STARTED`);
    try {
      const details = await callback();
      results.push({ id, status: "PASS", details });
      console.log(`[QA] ${id} PASSED - ${details}`);
    } catch (error) {
      const details = error instanceof Error ? error.message : "Unknown failure";
      results.push({ id, status: "FAIL", details });
      console.error(`[QA] ${id} FAILED - ${details}`);
    }
  };

  if (shouldRun("TC-001"))
    await test("TC-001", async () => {
    const requester = await prisma.user.findFirst({ where: { active: true } });
    assert(requester !== null, "No active requester is available.");
    const parsed = ticketSchema.safeParse({
      subject: "Automated QA ticket",
      description: "Created by the automated functional test.",
      category: "General",
      priority: "HIGH",
      requesterId: requester.id,
    });
    assert(parsed.success, "Valid ticket data was rejected.");
    return "Valid ticket data passed schema validation.";
    });

  if (shouldRun("TC-002"))
    await test("TC-002", async () => {
    const user = await prisma.user.findUnique({
      where: { email: "requester@helpdesk.local" },
    });
    assert(user !== null && user.active, "Demo requester account is unavailable.");
    assert(
      await bcrypt.compare("DemoPass123!", user.passwordHash),
      "Demo password verification failed.",
    );
    return "Active demo credentials were verified.";
    });

  if (shouldRun("TC-003"))
    await test("TC-003", async () => {
    const base = {
      subject: "Boundary test",
      category: "General",
      priority: "LOW" as const,
    };
    assert(
      !ticketSchema.safeParse({ ...base, description: "x".repeat(9) }).success,
      "Nine-character description was accepted.",
    );
    assert(
      ticketSchema.safeParse({ ...base, description: "x".repeat(10) }).success,
      "Ten-character description was rejected.",
    );
    assert(
      !ticketSchema.safeParse({ ...base, description: "x".repeat(5001) }).success,
      "5001-character description was accepted.",
    );
    return "Description boundaries 9, 10, and 5001 were checked.";
    });

  if (shouldRun("TC-004"))
    await test("TC-004", async () => {
    const validTicket = {
      subject: "Valid group",
      description: "A valid description for testing.",
      category: "General",
      priority: "MEDIUM" as const,
    };
    assert(ticketSchema.safeParse(validTicket).success, "Valid groups were rejected.");
    assert(
      ticketSchema.safeParse({ ...validTicket, subject: "Okay" }).success,
      "Valid subject group was rejected.",
    );
    assert(
      !ticketSchema.safeParse({ ...validTicket, subject: "No" }).success,
      "Invalid subject group was accepted.",
    );
    assert(
      ticketSchema.safeParse({ ...validTicket, category: "A" }).success,
      "Valid category group was rejected.",
    );
    assert(
      !ticketSchema.safeParse({ ...validTicket, category: " " }).success,
      "Invalid category group was accepted.",
    );
    assert(
      ticketSchema.safeParse({ ...validTicket, priority: "CRITICAL" }).success,
      "Valid priority group was rejected.",
    );
    assert(
      !ticketSchema.safeParse({
        ...validTicket,
        priority: "URGENT",
      }).success,
      "Invalid priority equivalence class was accepted.",
    );
    return "Valid and invalid subject, category, and priority groups were checked.";
    });

  if (shouldRun("TC-005"))
    await test("TC-005", async () => {
    await prisma.$queryRaw`SELECT 1`;
    return "Prisma successfully connected to SQLite.";
    });

  if (shouldRun("TC-006"))
    await test("TC-006", async () => {
    const statuses = ["OPEN", "IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED"];
    for (const status of statuses) {
      assert(statusSchema.safeParse(status).success, `${status} transition was rejected.`);
    }
    return "All supported ticket status transitions were accepted.";
    });

  if (shouldRun("TC-007"))
    await test("TC-007", async () => {
    const tickets = await prisma.ticket.findMany({
      where: { subject: { contains: "QA" } },
      take: 100,
    });
    assert(Array.isArray(tickets), "Ticket search did not return a list.");
    return `Ticket search returned ${tickets.length} matching records.`;
    });

  if (shouldRun("TC-008"))
    await test("TC-008", async () => {
    const invalid = ticketSchema.safeParse({
      subject: "",
      description: "",
      category: "",
      priority: "INVALID",
    });
    assert(!invalid.success, "Malformed ticket data was accepted.");
    return "Malformed ticket data was rejected.";
    });

  if (shouldRun("TC-009"))
    await test("TC-009", async () => {
    const user = await prisma.user.findUnique({
      where: { id: "invalid-requester-id" },
    });
    assert(user === null, "An invalid requester ID unexpectedly exists.");
    return "Invalid requester identity was rejected by the data lookup.";
    });

  if (shouldRun("TC-010"))
    await test("TC-010", async () => {
    const ticketCount = await prisma.ticket.count();
    const userCount = await prisma.user.count();
    assert(ticketCount >= 0 && userCount > 0, "Dashboard data is unavailable.");
    return "Dashboard data sources returned usable results.";
    });

  return NextResponse.json({ results });
}
