import { useState, useCallback, useMemo } from "react";
import type { Customer, Address, LedgerEntry } from "@/types/commerce.types";
import { useNotification } from "@/hooks/useNotification";
import {
  fetchCustomers, createCustomer, updateCustomer, deleteCustomer,
  addAddress, updateAddress, deleteAddress, addLedgerEntry, getLedgerHistory,
} from "@/services/customer-service";
import { useModal } from "@/hooks/useModal";
import React from "react";

export const useCustomer = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [isLoading, setIsLoading] = useState(true);
  const { notify } = useNotification();
  const { openModal } = useModal();

  React.useEffect(() => {
    fetchCustomers()
      .then((c) => {
        setCustomers(c);
        setIsLoading(false);
      })
      .catch(() => {
        setCustomers([]);
        setIsLoading(false);
      });
  }, []);

  const refreshCustomers = useCallback(async () => {
    const c = await fetchCustomers();
    setCustomers(c);
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = search.toLowerCase();
      const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
      const matchesSearch =
        !q ||
        fullName.includes(q) ||
        (c.email?.toLowerCase().includes(q) ?? false) ||
        (c.phone?.includes(q) ?? false);
      const matchesStatus =
        statusFilter === "all" || (statusFilter === "active" ? c.isActive : !c.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  const handleCreate = useCallback(async (input: Omit<Customer, "id" | "createdAt" | "totalOrders" | "totalSpent" | "ledgerBalance" | "addresses">) => {
    const customer = await createCustomer(input);
    setCustomers((prev) => [...prev, customer]);
    notify("Customer created", "success");
  }, [notify]);

  const handleUpdate = useCallback(async (id: string, input: Partial<Omit<Customer, "id" | "createdAt">>) => {
    const customer = await updateCustomer(id, input);
    setCustomers((prev) => prev.map((c) => (c.id === id ? customer : c)));
    notify("Customer updated", "success");
  }, [notify]);

  const handleDelete = useCallback(async (id: string) => {
    await deleteCustomer(id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    notify("Customer deleted", "success");
  }, [notify]);

  const confirmDelete = useCallback((customer: Customer) => {
    openModal("ConfirmAction", {
      title: "Delete Customer",
      description: `Are you sure you want to delete "${customer.firstName} ${customer.lastName}"?`,
      variant: "destructive",
      onConfirm: () => handleDelete(customer.id),
    });
  }, [openModal, handleDelete]);

  const handleToggleActive = useCallback(async (customer: Customer) => {
    const nextActive = !customer.isActive;
    try {
      const updated = await updateCustomer(customer.id, { isActive: nextActive });
      setCustomers((prev) => prev.map((c) => (c.id === customer.id ? updated : c)));
      notify(nextActive ? "Customer activated" : "Customer deactivated", "success");
    } catch (err) {
      notify(err instanceof Error ? err.message : "Failed to update customer", "error");
    }
  }, [notify]);

  const handleAddAddress = useCallback(async (customerId: string, input: Omit<Address, "id" | "customerId">) => {
    await addAddress(customerId, input);
    await refreshCustomers();
    notify("Address added", "success");
  }, [refreshCustomers, notify]);

  const handleUpdateAddress = useCallback(async (customerId: string, addressId: string, input: Partial<Omit<Address, "id" | "customerId">>) => {
    await updateAddress(customerId, addressId, input);
    await refreshCustomers();
    notify("Address updated", "success");
  }, [refreshCustomers, notify]);

  const handleDeleteAddress = useCallback(async (customerId: string, addressId: string) => {
    await deleteAddress(customerId, addressId);
    await refreshCustomers();
    notify("Address deleted", "success");
  }, [refreshCustomers, notify]);

  const handleAddLedgerEntry = useCallback(async (input: Omit<LedgerEntry, "id" | "createdAt" | "balanceBefore" | "balanceAfter">) => {
    await addLedgerEntry(input);
    await refreshCustomers();
    notify("Ledger entry added", "success");
  }, [refreshCustomers, notify]);

  const handleGetLedgerHistory = useCallback(async (customerId: string) => {
    return getLedgerHistory(customerId);
  }, []);

  return {
    customers, filteredCustomers, isLoading,
    search, setSearch, statusFilter, setStatusFilter,
    handleCreate, handleUpdate, handleDelete, confirmDelete,
    handleToggleActive, refreshCustomers,
    handleAddAddress, handleUpdateAddress, handleDeleteAddress,
    handleAddLedgerEntry, handleGetLedgerHistory,
  };
};
