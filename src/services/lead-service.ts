import { api } from "@/services/api";
import type { ContactLead, LeadListResponse, LeadStatus } from "@/types/lead.types";

export const fetchLeads = (params?: {
  page?: number;
  limit?: number;
  status?: LeadStatus | "all";
  subject?: string;
  search?: string;
}): Promise<LeadListResponse> => api.get<LeadListResponse>("/admin/leads", params);

export const fetchLeadById = (id: string): Promise<ContactLead> =>
  api.get<ContactLead>(`/admin/leads/${id}`);

export const updateLeadStatus = (id: string, status: LeadStatus): Promise<ContactLead> =>
  api.patch<ContactLead>(`/admin/leads/${id}/status`, { status });

export const deleteLead = (id: string): Promise<void> =>
  api.delete<void>(`/admin/leads/${id}`);
