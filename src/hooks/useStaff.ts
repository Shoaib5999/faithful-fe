import { useModal } from "@/hooks/useModal";
import { useNotification } from "@/hooks/useNotification";
import { createStaff, deleteStaff, fetchStaff, updateStaff, updateStaffPermissions } from "@/services/staff-service";
import type { StaffPermission } from "@/types/auth.types";
import type { Staff } from "@/types/staff.types";
import React, { useCallback, useMemo, useState } from "react";

export const useStaff = () => {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
    const [isLoading, setIsLoading] = useState(true);
    const { notify } = useNotification();
    const { openModal } = useModal();

    React.useEffect(() => {
        fetchStaff().then((s: Staff[]) => {
            setStaff(s);
            setIsLoading(false);
        });
    }, []);

    const filteredStaff = useMemo(() => {
        return staff.filter((s: Staff) => {
            const q = search.toLowerCase();
            const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
            const matchesSearch = !q || fullName.includes(q) || s.email.toLowerCase().includes(q);
            const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? s.isActive : !s.isActive);
            return matchesSearch && matchesStatus;
        });
    }, [staff, search, statusFilter]);

    const handleCreate = useCallback(async (input: Omit<Staff, "id" | "createdAt">) => {
        const s = await createStaff(input);
        setStaff((prev) => [...prev, s]);
        notify("Staff member created", "success");
    }, [notify]);

    const handleUpdate = useCallback(async (id: string, input: Partial<Omit<Staff, "id" | "createdAt">>) => {
        const s = await updateStaff(id, input);
        setStaff((prev) => prev.map((x) => (x.id === id ? s : x)));
        notify("Staff member updated", "success");
    }, [notify]);

    const handleDelete = useCallback(async (id: string) => {
        await deleteStaff(id);
        setStaff((prev) => prev.filter((x) => x.id !== id));
        notify("Staff member deleted", "success");
    }, [notify]);

    const handleUpdatePermissions = useCallback(async (staffId: string, permissions: StaffPermission[]) => {
        const s = await updateStaffPermissions(staffId, permissions);
        setStaff((prev) => prev.map((x) => (x.id === staffId ? s : x)));
        notify("Permissions updated", "success");
    }, [notify]);

    const confirmDelete = useCallback((member: Staff) => {
        openModal("ConfirmAction", {
            title: "Delete Staff Member",
            description: `Are you sure you want to delete "${member.firstName} ${member.lastName}"?`,
            variant: "destructive",
            onConfirm: () => handleDelete(member.id),
        });
    }, [openModal, handleDelete]);

    return {
        staff, filteredStaff, isLoading,
        search, setSearch, statusFilter, setStatusFilter,
        handleCreate, handleUpdate, handleDelete, handleUpdatePermissions, confirmDelete,
    };
};