import type { Staff } from "@/types/staff.types";
import type { StaffPermission } from "@/types/auth.types";
import { generateId } from "@/lib/formatters";

let staffMembers: Staff[] = [];

export const fetchStaff = (): Promise<Staff[]> => Promise.resolve([...staffMembers]);

export const createStaff = (input: Omit<Staff, "id" | "createdAt">): Promise<Staff> => {
    const staff: Staff = { ...input, id: generateId(), createdAt: new Date().toISOString() };
    staffMembers.push(staff);
    return Promise.resolve(staff);
};

export const updateStaff = (id: string, input: Partial<Omit<Staff, "id" | "createdAt">>): Promise<Staff> => {
    const idx = staffMembers.findIndex((s) => s.id === id);
    if (idx === -1) return Promise.reject(new Error("Not found"));
    staffMembers[idx] = { ...staffMembers[idx], ...input };
    return Promise.resolve(staffMembers[idx]);
};

export const deleteStaff = (id: string): Promise<void> => {
    staffMembers = staffMembers.filter((s) => s.id !== id);
    return Promise.resolve();
};

export const updateStaffPermissions = (staffId: string, permissions: StaffPermission[]): Promise<Staff> => {
    const idx = staffMembers.findIndex((s) => s.id === staffId);
    if (idx === -1) return Promise.reject(new Error("Not found"));
    staffMembers[idx] = { ...staffMembers[idx], permissions };
    return Promise.resolve(staffMembers[idx]);
};

export const getAllStaff = (): Staff[] => [...staffMembers];

export const getStaffArray = (): Staff[] => staffMembers;