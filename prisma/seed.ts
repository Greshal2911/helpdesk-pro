import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

const demoUsers = [
  {
    name: "Jordan Davis",
    email: "admin@helpdesk.local",
    role: "ADMIN" as const,
  },
  {
    name: "Ava Thompson",
    email: "agent@helpdesk.local",
    role: "AGENT" as const,
  },
  {
    name: "Maya Patel",
    email: "requester@helpdesk.local",
    role: "REQUESTER" as const,
  },
];

async function main() {
  const passwordHash = await bcrypt.hash("DemoPass123!", 12);

  for (const user of demoUsers) {
    const saved = await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role, active: true, passwordHash },
      create: { ...user, passwordHash },
    });

    console.log(`${saved.role}: ${saved.email} | id=${saved.id}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
