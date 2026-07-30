import React from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PermissionGate } from "@/components/common/PermissionGate";
import { DataTableOne } from "@/components/ui/data-table";
import type { DataTableOneColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { useLead } from "@/hooks/useLead";
import { formatDate, truncateText } from "@/lib/formatters";
import type { ContactLead, LeadStatus } from "@/types/lead.types";
import type { ColorVariant } from "@/types/common.types";
import { CONTACT_SUBJECT_OPTIONS } from "@/components/storefront/ContactSubjectMenu";
import { Eye } from "lucide-react";

const STATUS_COLOR: Record<string, ColorVariant> = {
  new: "yellow",
  read: "green",
  archived: "gray",
};

const LeadsPage: React.FC = () => {
  const {
    filteredLeads,
    statusCounts,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    subjectFilter,
    setSubjectFilter,
    isLoading,
    openLeadDetail,
    handleUpdateStatus,
  } = useLead();

  const columns: DataTableOneColumn<ContactLead>[] = [
    {
      key: "name",
      header: "Name",
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-medium">{r.name}</span>
          <span className="text-xs text-muted-foreground">{r.email}</span>
        </div>
      ),
      sortable: true,
      sortValue: (r) => r.name,
    },
    {
      key: "subject",
      header: "Subject",
      render: (r) => r.subjectLabel,
      sortable: true,
      sortValue: (r) => r.subjectLabel,
    },
    {
      key: "message",
      header: "Message",
      render: (r) => (
        <span className="text-muted-foreground">{truncateText(r.message, 60)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={r.status} colorMap={STATUS_COLOR} />,
    },
    {
      key: "date",
      header: "Received",
      render: (r) => <span className="text-muted-foreground">{formatDate(r.createdAt)}</span>,
      sortable: true,
      sortValue: (r) => r.createdAt,
    },
    {
      key: "actions",
      header: "",
      hideable: false,
      render: (r) => (
        <div className="flex gap-1 justify-end">
          <Button
            variant="ghost"
            size="icon"
            aria-label="View lead"
            onClick={(e) => {
              e.stopPropagation();
              openLeadDetail(r);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {r.status === "new" && (
            <PermissionGate moduleKey="leads" operation="edit">
              <Button
                variant="ghost"
                size="sm"
                className="text-green-600"
                onClick={(e) => {
                  e.stopPropagation();
                  void handleUpdateStatus(r.id, "read");
                }}
              >
                Mark read
              </Button>
            </PermissionGate>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageWrapper>
      <PageHeader
        title="Leads"
        subtitle={`${statusCounts.new} new · ${statusCounts.read} read · ${statusCounts.archived} archived`}
      />
      <div className="mt-4">
        <DataTableOne
          columns={columns}
          data={filteredLeads}
          keyExtractor={(r) => r.id}
          emptyMessage={isLoading ? "Loading leads..." : "No contact form submissions yet"}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by name, email, or message..."
          filters={[
            {
              key: "status",
              label: "Status",
              value: statusFilter,
              options: [
                { label: "New", value: "new" },
                { label: "Read", value: "read" },
                { label: "Archived", value: "archived" },
              ],
              onChange: (v) => setStatusFilter(v as LeadStatus | "all"),
            },
            {
              key: "subject",
              label: "Subject",
              value: subjectFilter,
              options: CONTACT_SUBJECT_OPTIONS.map((opt) => ({
                label: opt.label,
                value: opt.id,
              })),
              onChange: setSubjectFilter,
            },
          ]}
        />
      </div>
    </PageWrapper>
  );
};

export default LeadsPage;
