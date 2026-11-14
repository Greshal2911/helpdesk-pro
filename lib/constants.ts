export const CATEGORIES = [
  "Access",
  "Billing",
  "Hardware",
  "Software",
  "Network",
  "How-to",
] as const;

export const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export const STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "PENDING",
  "RESOLVED",
  "CLOSED",
] as const;

export type Category = (typeof CATEGORIES)[number];
export type Priority = (typeof PRIORITIES)[number];
export type TicketStatus = (typeof STATUSES)[number];
export type Role = "ADMIN" | "AGENT" | "REQUESTER";
