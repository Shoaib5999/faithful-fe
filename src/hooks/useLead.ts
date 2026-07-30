import { useState, useCallback, useMemo } from "react";
import React from "react";
import type { ContactLead, LeadStatus } from "@/types/lead.types";
import { deleteLead, fetchLeads, updateLeadStatus } from "@/services/lead-service";
import { useNotification } from "@/hooks/useNotification";
import { useModal } from "@/hooks/useModal";

export const useLead = () => {
  const [leads, setLeads] = useState<ContactLead[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<LeadStatus, number>>({
    new: 0,
    read: 0,
    archived: 0,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const { notify } = useNotification();
  const { openModal } = useModal();

  const refreshLeads = useCallback(async () => {
    const data = await fetchLeads({ limit: 200 });
    setLeads(data.leads);
    setStatusCounts(data.statusCounts);
  }, []);

  React.useEffect(() => {
    refreshLeads()
      .catch(() => {
        setLeads([]);
        setStatusCounts({ new: 0, read: 0, archived: 0 });
      })
      .finally(() => setIsLoading(false));
  }, [refreshLeads]);

  const filteredLeads = useMemo(() => {
    const q = search.toLowerCase();
    return leads.filter((lead) => {
      const matchesSearch =
        !q ||
        lead.name.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        lead.message.toLowerCase().includes(q) ||
        lead.subjectLabel.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      const matchesSubject = subjectFilter === "all" || lead.subject === subjectFilter;
      return matchesSearch && matchesStatus && matchesSubject;
    });
  }, [leads, search, statusFilter, subjectFilter]);

  const handleUpdateStatus = useCallback(
    async (id: string, status: LeadStatus) => {
      try {
        const updated = await updateLeadStatus(id, status);
        setLeads((prev) => prev.map((lead) => (lead.id === id ? updated : lead)));
        setStatusCounts((prev) => {
          const old = leads.find((l) => l.id === id);
          if (!old || old.status === status) return prev;
          return {
            ...prev,
            [old.status]: Math.max(0, prev[old.status] - 1),
            [status]: prev[status] + 1,
          };
        });
        notify("Lead updated", "success");
      } catch (err) {
        notify(err instanceof Error ? err.message : "Failed to update lead", "error");
      }
    },
    [leads, notify],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteLead(id);
        const removed = leads.find((l) => l.id === id);
        setLeads((prev) => prev.filter((lead) => lead.id !== id));
        if (removed) {
          setStatusCounts((prev) => ({
            ...prev,
            [removed.status]: Math.max(0, prev[removed.status] - 1),
          }));
        }
        notify("Lead deleted", "success");
      } catch (err) {
        notify(err instanceof Error ? err.message : "Failed to delete lead", "error");
      }
    },
    [leads, notify],
  );

  const confirmDelete = useCallback(
    (lead: ContactLead) => {
      openModal("ConfirmAction", {
        title: "Delete Lead",
        description: `Delete inquiry from "${lead.name}"?`,
        variant: "destructive",
        onConfirm: () => handleDelete(lead.id),
      });
    },
    [openModal, handleDelete],
  );

  const openLeadDetail = useCallback(
    (lead: ContactLead) => {
      openModal("LeadDetail", {
        lead,
        onStatusChange: handleUpdateStatus,
        onDelete: () => confirmDelete(lead),
      });
    },
    [openModal, handleUpdateStatus, confirmDelete],
  );

  return {
    leads,
    filteredLeads,
    statusCounts,
    isLoading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    subjectFilter,
    setSubjectFilter,
    handleUpdateStatus,
    confirmDelete,
    openLeadDetail,
    refreshLeads,
  };
};
