import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

const people = [
  { name: "Jordan Davis", email: "admin@helpdesk.local", role: "ADMIN" as const },
  { name: "Ava Thompson", email: "agent@helpdesk.local", role: "AGENT" as const },
  { name: "Sam Okonkwo", email: "sam@helpdesk.local", role: "AGENT" as const },
  { name: "Priya Shah", email: "priya@helpdesk.local", role: "AGENT" as const },
  { name: "Maya Patel", email: "requester@helpdesk.local", role: "REQUESTER" as const },
  { name: "Leo Chen", email: "leo@helpdesk.local", role: "REQUESTER" as const },
  { name: "Nora Ibrahim", email: "nora@helpdesk.local", role: "REQUESTER" as const },
];

function shift(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

async function main() {
  const passwordHash = await bcrypt.hash("DemoPass123!", 12);

  await prisma.testExecution.deleteMany();
  await prisma.defect.deleteMany();
  await prisma.testCase.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.escalationHistory.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.ticketActivity.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.savedReply.deleteMany();
  await prisma.escalationRule.deleteMany();

  const users = new Map<string, string>();
  for (const person of people) {
    const saved = await prisma.user.upsert({
      where: { email: person.email },
      update: { name: person.name, role: person.role, active: true, passwordHash },
      create: { ...person, passwordHash },
    });
    users.set(person.email, saved.id);
  }

  const id = (email: string) => {
    const value = users.get(email);
    if (!value) throw new Error(`Missing user ${email}`);
    return value;
  };

  await prisma.escalationRule.createMany({
    data: [
      { priority: "CRITICAL", thresholdHours: 4 },
      { priority: "HIGH", thresholdHours: 8 },
      { priority: "MEDIUM", thresholdHours: 24 },
      { priority: "LOW", thresholdHours: 72 },
    ],
  });

  await prisma.savedReply.createMany({
    data: [
      {
        title: "Need a bit more detail",
        category: "How-to",
        body: "Thanks for reporting this. I can pick it up once I have three things:\n1. When it last worked\n2. The exact error text\n3. Whether anyone else on the team sees the same thing",
      },
      {
        title: "Password reset",
        category: "Access",
        body: "I reset the account and sent a temporary password to your email. Sign in, choose a new password, and reply here if the reset mail does not arrive within 10 minutes.",
      },
      {
        title: "VPN checks",
        category: "Network",
        body: "Please try this order:\n1. Disconnect and reconnect the VPN\n2. Forget the office Wi-Fi and join again\n3. Restart the VPN app\nTell me which step fails and paste the error code.",
      },
      {
        title: "Resolved — please confirm",
        category: "Software",
        body: "This should be fixed now. Please try the same steps that failed before and reply if it still happens. I will close the ticket if I do not hear back.",
      },
    ],
  });

  const admin = id("admin@helpdesk.local");
  const ava = id("agent@helpdesk.local");
  const sam = id("sam@helpdesk.local");
  const priya = id("priya@helpdesk.local");
  const maya = id("requester@helpdesk.local");
  const leo = id("leo@helpdesk.local");
  const nora = id("nora@helpdesk.local");

  await prisma.ticket.create({
    data: {
      number: "HD-2401",
      subject: "Finance VPN drops during month-end close",
      description:
        "The finance VPN disconnects every 10–15 minutes while the month-end workbook is open. It started after yesterday's laptop update. Reconnecting works, but unsaved cells are lost.",
      category: "Network",
      priority: "CRITICAL",
      status: "OPEN",
      dueDate: shift(-2),
      createdAt: shift(-6),
      requesterId: maya,
      activities: {
        create: { actorId: maya, action: "Opened ticket", details: "Filed from the finance close checklist.", createdAt: shift(-6) },
      },
    },
  });

  await prisma.ticket.create({
    data: {
      number: "HD-2402",
      subject: "Okta password reset loop",
      description:
        "Leo can request a reset email, but the link says it is already used. He is locked out of Slack and the billing tool.",
      category: "Access",
      priority: "HIGH",
      status: "IN_PROGRESS",
      dueDate: shift(6),
      createdAt: shift(-5),
      requesterId: leo,
      assigneeId: ava,
      comments: {
        create: {
          authorId: ava,
          body: "I cleared the stuck reset token. Try the newest email only — the older links will still look used.",
          createdAt: shift(-2),
        },
      },
      activities: {
        create: [
          { actorId: leo, action: "Opened ticket", createdAt: shift(-5) },
          { actorId: ava, action: "Updated ticket", details: "Assignee: Unassigned → Ava Thompson", createdAt: shift(-4) },
        ],
      },
    },
  });

  await prisma.ticket.create({
    data: {
      number: "HD-2403",
      subject: "March invoice charged the extra seats twice",
      description:
        "Invoice INV-20441 shows 40 seats and invoice INV-20458 charges the same 12 added seats again. We only added the seats once.",
      category: "Billing",
      priority: "HIGH",
      status: "IN_PROGRESS",
      dueDate: shift(-20),
      createdAt: shift(-30),
      requesterId: nora,
      assigneeId: priya,
      comments: {
        create: {
          authorId: priya,
          internal: true,
          body: "Billing ops confirmed INV-20458 is a duplicate export. Waiting on a credit memo number before I reply.",
          createdAt: shift(-3),
        },
      },
      activities: {
        create: { actorId: priya, action: "Added an internal note", details: "Waiting on the credit memo.", createdAt: shift(-3) },
      },
    },
  });

  await prisma.ticket.create({
    data: {
      number: "HD-2404",
      subject: "Laptop for the new intern starts Monday",
      description:
        "The intern arrives Monday and needs a laptop, charger, and standard app set. We still need the shipping address if it should go to the office instead of home.",
      category: "Hardware",
      priority: "MEDIUM",
      status: "PENDING",
      dueDate: shift(48),
      createdAt: shift(-26),
      requesterId: maya,
      assigneeId: sam,
      comments: {
        create: {
          authorId: sam,
          body: "I can ship a prepared laptop today. Reply with the office or home address and a contact phone number.",
          createdAt: shift(-8),
        },
      },
      activities: {
        create: { actorId: sam, action: "Updated ticket", details: "Status: Open → Waiting", createdAt: shift(-8) },
      },
    },
  });

  await prisma.ticket.create({
    data: {
      number: "HD-2405",
      subject: "How do I export the payroll report?",
      description:
        "I need last month's payroll report as a CSV for the auditor. The Reports page only offers PDF.",
      category: "How-to",
      priority: "LOW",
      status: "RESOLVED",
      dueDate: shift(-10),
      resolutionNotes: "Payroll → Reports → Monthly → Export CSV. The control is under the table, not the top menu.",
      createdAt: shift(-50),
      requesterId: leo,
      assigneeId: ava,
      comments: {
        create: {
          authorId: ava,
          body: "Use Payroll → Reports → Monthly, then Export CSV under the table. I attached the path in the resolution notes.",
          createdAt: shift(-40),
        },
      },
      feedback: { create: { rating: 5, comment: "Found it immediately. Thanks." } },
      activities: {
        create: { actorId: ava, action: "Updated ticket", details: "Status: In progress → Resolved", createdAt: shift(-40) },
      },
    },
  });

  await prisma.ticket.create({
    data: {
      number: "HD-2406",
      subject: "Outlook has not synced since this morning",
      description:
        "New mail arrives on the phone, but Outlook on the laptop has been stuck on Updating inbox since 8:40. Restarting the laptop did not help.",
      category: "Software",
      priority: "HIGH",
      status: "OPEN",
      dueDate: shift(3),
      createdAt: shift(-4),
      requesterId: leo,
      activities: {
        create: { actorId: leo, action: "Opened ticket", createdAt: shift(-4) },
      },
    },
  });

  await prisma.ticket.create({
    data: {
      number: "HD-2407",
      subject: "Badge does not open the 4th floor door",
      description:
        "Nora's badge works on the lobby turnstile and the 2nd floor, but the 4th floor reader flashes red. She has a desk there this week.",
      category: "Access",
      priority: "MEDIUM",
      status: "IN_PROGRESS",
      dueDate: shift(20),
      createdAt: shift(-12),
      requesterId: nora,
      assigneeId: sam,
      activities: {
        create: { actorId: sam, action: "Updated ticket", details: "Asked facilities to re-enable the 4th floor group.", createdAt: shift(-2) },
      },
    },
  });

  await prisma.ticket.create({
    data: {
      number: "HD-2408",
      subject: "Status bot posts the same standup twice",
      description:
        "The Monday standup bot posts every update twice in #support-daily. It started after the workflow was duplicated last Friday.",
      category: "Software",
      priority: "HIGH",
      status: "OPEN",
      dueDate: shift(-5),
      createdAt: shift(-18),
      requesterId: maya,
      assigneeId: priya,
      activities: {
        create: { actorId: priya, action: "Updated ticket", details: "Assignee: Unassigned → Priya Shah", createdAt: shift(-16) },
      },
    },
  });

  await prisma.ticket.create({
    data: {
      number: "HD-2409",
      subject: "Guest Wi-Fi password for Thursday's visitors",
      description:
        "Three visitors are on site Thursday from 10:00 to 15:00. They need guest Wi-Fi that expires the same day.",
      category: "Network",
      priority: "LOW",
      status: "CLOSED",
      dueDate: shift(-30),
      resolutionNotes: "Created a guest network named Visitors that expires Thursday 18:00. Password was shared in person.",
      createdAt: shift(-80),
      requesterId: nora,
      assigneeId: ava,
      activities: {
        create: { actorId: ava, action: "Updated ticket", details: "Status: Resolved → Closed", createdAt: shift(-70) },
      },
    },
  });

  await prisma.ticket.create({
    data: {
      number: "HD-2410",
      subject: "Customer export is missing the plan column",
      description:
        "The CSV from Customers → Export no longer includes the Plan column. The auditor file from last week still had it. We use that column to split billing.",
      category: "Software",
      priority: "MEDIUM",
      status: "OPEN",
      dueDate: shift(18),
      createdAt: shift(-7),
      requesterId: maya,
      activities: {
        create: { actorId: maya, action: "Opened ticket", createdAt: shift(-7) },
      },
    },
  });

  await prisma.ticket.create({
    data: {
      number: "HD-2411",
      subject: "Refund 8 unused seats before the card is charged",
      description:
        "We removed 8 seats this morning. The billing page still shows them as scheduled for tonight's charge. Please stop that charge.",
      category: "Billing",
      priority: "CRITICAL",
      status: "IN_PROGRESS",
      dueDate: shift(2),
      createdAt: shift(-3),
      requesterId: leo,
      assigneeId: priya,
      comments: {
        create: {
          authorId: priya,
          body: "I paused tonight's seat charge. I will confirm here once the renewal preview shows 8 fewer seats.",
          createdAt: shift(-1),
        },
      },
      activities: {
        create: { actorId: priya, action: "Replied", details: "Paused tonight's charge.", createdAt: shift(-1) },
      },
    },
  });

  await prisma.ticket.create({
    data: {
      number: "HD-2412",
      subject: "Need the approved email signature",
      description:
        "New hire kit links to a signature template that 404s. I need the current legal footer before I email customers.",
      category: "How-to",
      priority: "LOW",
      status: "RESOLVED",
      dueDate: shift(-4),
      resolutionNotes: "Template is in the shared drive under Brand / Email / signature-2026.html.",
      createdAt: shift(-28),
      requesterId: nora,
      assigneeId: sam,
      activities: {
        create: { actorId: sam, action: "Updated ticket", details: "Status: Open → Resolved", createdAt: shift(-6) },
      },
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: ava,
        title: "HD-2402 is still in progress",
        body: "Leo is waiting on the Okta reset to finish.",
        createdAt: shift(-1),
      },
      {
        userId: priya,
        title: "HD-2403 is overdue",
        body: "The duplicate invoice is past its response target.",
        createdAt: shift(-1),
      },
    ],
  });

  console.log("Seeded the support desk with 12 tickets.");
  console.log("Working identities are in the sidebar. No password is required.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
