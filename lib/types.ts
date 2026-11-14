import type { Priority, Role, TicketStatus } from "./constants";

export type Person = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type TicketSummary = {
  id: string;
  number: string;
  subject: string;
  description: string;
  category: string;
  priority: Priority;
  status: TicketStatus;
  dueDate: string | null;
  resolutionNotes: string | null;
  createdAt: string;
  updatedAt: string;
  requester: Person;
  assignee: Person | null;
  _count: { comments: number };
};

export type TicketComment = {
  id: string;
  body: string;
  internal: boolean;
  createdAt: string;
  author: Person;
};

export type TicketActivity = {
  id: string;
  action: string;
  details: string | null;
  createdAt: string;
  actor: Person;
};

export type TicketFeedback = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

export type TicketDetail = TicketSummary & {
  comments: TicketComment[];
  activities: TicketActivity[];
  feedback: TicketFeedback | null;
  escalations: { id: string; level: number; reason: string; createdAt: string }[];
};

export type SavedReply = {
  id: string;
  title: string;
  body: string;
  category: string | null;
};

export type DeskNotification = {
  id: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

export type DashboardData = {
  counts: {
    open: number;
    inProgress: number;
    waiting: number;
    overdue: number;
    unassigned: number;
    resolvedThisWeek: number;
  };
  byPriority: { priority: Priority; count: number }[];
  workload: {
    id: string;
    name: string;
    role: Role;
    open: number;
    waiting: number;
    overdue: number;
  }[];
  attention: {
    number: string;
    subject: string;
    reason: string;
    priority: Priority;
    status: TicketStatus;
    dueDate: string | null;
  }[];
  activity: {
    id: string;
    action: string;
    details: string | null;
    createdAt: string;
    actorName: string;
    ticketNumber: string;
    ticketSubject: string;
  }[];
  createdByDay: { label: string; count: number }[];
};
