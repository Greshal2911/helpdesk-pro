import { z } from "zod";

export const ticketSchema = z.object({
  subject: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(5000),
  category: z.string().trim().min(1).max(60),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  dueDate: z.coerce.date().optional(),
  requesterId: z.string().min(1).optional(),
});

export const statusSchema = z.enum([
  "OPEN",
  "IN_PROGRESS",
  "PENDING",
  "RESOLVED",
  "CLOSED",
]);
