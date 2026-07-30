import { PageHeader } from "@/components/common/PageHeader";
import { PermissionGate } from "@/components/common/PermissionGate";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DataTableOneColumn } from "@/components/ui/data-table";
import { DataTableOne } from "@/components/ui/data-table";
import { useModal } from "@/hooks/useModal";
import { useStaff } from "@/hooks/useStaff";
import { computeInitials } from "@/lib/formatters";
import type { ColorVariant } from "@/types/common.types";
import type { Staff } from "@/types/staff.types";
import { Pencil, Plus, Shield, Trash2 } from "lucide-react";
import React from "react";

const ACTIVE_COLOR: Record<string, ColorVariant> = { Active: "green", Inactive: "gray" };

const StaffPage: React.FC = () => {
  const { filteredStaff, search, setSearch, statusFilter, setStatusFilter, confirmDelete } =
    useStaff();
  const { openModal } = useModal();

  const columns: DataTableOneColumn<Staff>[] = [
    {
      key: "avatar",
      header: "",
      render: (r) => (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {computeInitials(`${r.firstName} ${r.lastName}`)}
          </AvatarFallback>
        </Avatar>
      ),
    },
    {
      key: "name",
      header: "Name",
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-medium">
            {r.firstName} {r.lastName}
          </span>
          <span className="text-xs text-muted-foreground">{r.email}</span>
        </div>
      ),
      sortable: true,
      sortValue: (r) => `${r.firstName} ${r.lastName}`,
    },
    {
      key: "phone",
      header: "Phone",
      render: (r) => <span className="text-muted-foreground">{r.phone}</span>,
    },
    { key: "role", header: "Role", render: (r) => <span>{r.role}</span> },
    {
      key: "permissions",
      header: "Permissions",
      render: (r) => <Badge variant="secondary">{r.permissions.length} modules</Badge>,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <StatusBadge status={r.isActive ? "Active" : "Inactive"} colorMap={ACTIVE_COLOR} />
      ),
    },
    {
      key: "actions",
      header: "",
      hideable: false,
      render: (r) => (
        <div className="flex gap-1 justify-end">
          <PermissionGate moduleKey="staff" operation="manage">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                openModal("StaffPermissions", { staff: r });
              }}
            >
              <Shield className="h-4 w-4" />
            </Button>
          </PermissionGate>
          <PermissionGate moduleKey="staff" operation="edit">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                openModal("StaffCreateEdit", { staff: r });
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </PermissionGate>
          <PermissionGate moduleKey="staff" operation="delete">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                confirmDelete(r);
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </PermissionGate>
        </div>
      ),
    },
  ];

  return (
    <PageWrapper>
      <PageHeader
        title="Staff"
        subtitle={`${filteredStaff.length} members`}
        actions={
          <PermissionGate moduleKey="staff" operation="create">
            <Button size="sm" onClick={() => openModal("StaffCreateEdit", {})}>
              <Plus className="mr-1 h-4 w-4" /> Add Staff
            </Button>
          </PermissionGate>
        }
      />
      <div className="mt-4">
        <DataTableOne
          columns={columns}
          data={filteredStaff}
          keyExtractor={(r) => r.id}
          emptyMessage="No staff members found"
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search staff..."
          filters={[
            {
              key: "status",
              label: "Status",
              value: statusFilter,
              options: [
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ],
              onChange: (v) => setStatusFilter(v as "all" | "active" | "inactive"),
            },
          ]}
        />
      </div>
    </PageWrapper>
  );
};

export default StaffPage;
