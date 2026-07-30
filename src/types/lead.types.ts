export type LeadStatus = "new" | "read" | "archived";

export type ContactLead = {
  id: string;
  name: string;
  email: string;
  subject: string;
  subjectLabel: string;
  message: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
};

export type LeadListResponse = {
  leads: ContactLead[];
  total: number;
  page: number;
  totalPages: number;
  statusCounts: Record<LeadStatus, number>;
};
