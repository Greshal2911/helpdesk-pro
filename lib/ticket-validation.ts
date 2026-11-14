import { z } from "zod";

export const prioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
export const statusSchema = z.enum([
  "OPEN",
  "IN_PROGRESS",
  "PENDING",
  "RESOLVED",
  "CLOSED",
]);

export const ticketSchema = z.object({
  subject: z.string().trim().min(3, "Subject must be at least 3 characters.").max(120),
  description: z
    .string()
    .trim()
    .min(10, "Describe the problem in at least 10 characters.")
    .max(5000),
  category: z.string().trim().min(1, "Choose a category.").max(60),
  priority: prioritySchema.default("MEDIUM"),
  dueDate: z.coerce.date().optional(),
  requesterId: z.string().min(1).optional(),
  assigneeId: z.string().min(1).nullable().optional(),
  actorId: z.string().min(1).optional(),
});

export const ticketUpdateSchema = z.object({
  actorId: z.string().min(1, "Choose who is making this change."),
  subject: z.string().trim().min(3).max(120).optional(),
  description: z.string().trim().min(10).max(5000).optional(),
  category: z.string().trim().min(1).max(60).optional(),
  priority: prioritySchema.optional(),
  status: statusSchema.optional(),
  assigneeId: z.string().min(1).nullable().optional(),
  dueDate: z.union([z.coerce.date(), z.null()]).optional(),
  resolutionNotes: z.string().trim().max(5000).nullable().optional(),
});

export const commentSchema = z.object({
  actorId: z.string().min(1),
  body: z.string().trim().min(1, "Write a reply before sending.").max(5000),
  internal: z.boolean().optional(),
});

export const feedbackSchema = z.object({
  actorId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

export const replySchema = z.object({
  title: z.string().trim().min(2, "Give the reply a short title.").max(80),
  body: z.string().trim().min(2, "Write the reply text.").max(5000),
  category: z.string().trim().max(60).optional(),
});

export function firstIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Check the form and try again.";
}
