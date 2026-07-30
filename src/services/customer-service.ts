import type { Customer, Address, LedgerEntry } from "@/types/commerce.types";
import { api } from "@/services/api";
import { generateId } from "@/lib/formatters";

type ApiCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
};

type CustomerListResponse = {
  customers: ApiCustomer[];
  total: number;
  page: number;
  totalPages: number;
};

const customersCache: Customer[] = [];
let ledgerEntries: LedgerEntry[] = [];

const splitName = (name: string): { firstName: string; lastName: string } => {
  const t = name.trim();
  const i = t.indexOf(" ");
  if (i === -1) return { firstName: t || "Customer", lastName: "" };
  return { firstName: t.slice(0, i), lastName: t.slice(i + 1).trim() };
};

const mapApiCustomer = (row: ApiCustomer): Customer => {
  const { firstName, lastName } = splitName(row.name || "");
  return {
    id: row.id,
    firstName,
    lastName,
    email: row.email,
    phone: row.phone,
    type: "online",
    group: "retail",
    gstNumber: null,
    gstBusinessName: null,
    addresses: [],
    ledgerBalance: 0,
    totalOrders: row.totalOrders,
    totalSpent: row.totalSpent,
    notes: null,
    isActive: row.isActive,
    createdAt: row.createdAt,
  };
};

const fetchAllCustomerPages = async (): Promise<Customer[]> => {
  const merged: Customer[] = [];
  let page = 1;
  const limit = 100;
  const maxPages = 500;

  for (; page <= maxPages; page += 1) {
    const data = await api.get<CustomerListResponse>("/admin/customers", { page, limit });
    const rows = Array.isArray(data.customers) ? data.customers : [];
    if (rows.length === 0) break;

    merged.push(...rows.map(mapApiCustomer));

    const total = Number(data.total);
    const rawTp = Number(data.totalPages);
    const totalPages =
      Number.isFinite(rawTp) && rawTp > 0
        ? rawTp
        : Number.isFinite(total) && total > 0
          ? Math.ceil(total / limit)
          : page;

    if (page >= totalPages || rows.length < limit) break;
  }

  customersCache.splice(0, customersCache.length, ...merged);
  return [...customersCache];
};

export const fetchCustomers = (): Promise<Customer[]> => fetchAllCustomerPages();

export const getCustomerById = (id: string): Customer | undefined => customersCache.find((c) => c.id === id);

export const updateCustomerStatus = async (id: string, isActive: boolean): Promise<Customer> => {
  await api.patch<ApiCustomer>(`/admin/customers/${id}/status`, { isActive });
  const idx = customersCache.findIndex((c) => c.id === id);
  if (idx === -1) return Promise.reject(new Error("Customer not found"));
  customersCache[idx] = { ...customersCache[idx], isActive };
  return customersCache[idx];
};

export const updateCustomer = async (
  id: string,
  input: Partial<Omit<Customer, "id" | "createdAt">>,
): Promise<Customer> => {
  if (typeof input.isActive === "boolean") {
    return updateCustomerStatus(id, input.isActive);
  }
  const idx = customersCache.findIndex((c) => c.id === id);
  if (idx === -1) return Promise.reject(new Error("Customer not found"));
  customersCache[idx] = { ...customersCache[idx], ...input };
  return customersCache[idx];
};

export const createCustomer = async (
  input: Omit<Customer, "id" | "createdAt" | "totalOrders" | "totalSpent" | "ledgerBalance" | "addresses">,
): Promise<Customer> => {
  const customer: Customer = {
    ...input,
    id: generateId(),
    addresses: [],
    ledgerBalance: 0,
    totalOrders: 0,
    totalSpent: 0,
    createdAt: new Date().toISOString(),
  };
  customersCache.push(customer);
  return customer;
};

export const deleteCustomer = async (id: string): Promise<void> => {
  const idx = customersCache.findIndex((c) => c.id === id);
  if (idx === -1) return Promise.reject(new Error("Customer not found"));
  customersCache.splice(idx, 1);
};

export const createWalkinCustomer = (input: { name: string; phone: string | null; email: string | null }): Promise<Customer> => {
  const parts = input.name.trim().split(/\s+/);
  const firstName = parts[0] || input.name;
  const lastName = parts.slice(1).join(" ") || "";
  return createCustomer({
    firstName,
    lastName,
    email: input.email,
    phone: input.phone,
    type: "walkin",
    group: "retail",
    gstNumber: null,
    gstBusinessName: null,
    notes: null,
    isActive: true,
  });
};

export const addAddress = (customerId: string, input: Omit<Address, "id" | "customerId">): Promise<Address> => {
  const idx = customersCache.findIndex((c) => c.id === customerId);
  if (idx === -1) return Promise.reject(new Error("Customer not found"));
  const address: Address = { ...input, id: generateId(), customerId };
  if (address.isDefault) {
    customersCache[idx].addresses = customersCache[idx].addresses.map((a) => ({ ...a, isDefault: false }));
  }
  customersCache[idx].addresses.push(address);
  return Promise.resolve(address);
};

export const updateAddress = (
  customerId: string,
  addressId: string,
  input: Partial<Omit<Address, "id" | "customerId">>,
): Promise<Address> => {
  const cIdx = customersCache.findIndex((c) => c.id === customerId);
  if (cIdx === -1) return Promise.reject(new Error("Customer not found"));
  const aIdx = customersCache[cIdx].addresses.findIndex((a) => a.id === addressId);
  if (aIdx === -1) return Promise.reject(new Error("Address not found"));
  if (input.isDefault) {
    customersCache[cIdx].addresses = customersCache[cIdx].addresses.map((a) => ({ ...a, isDefault: false }));
  }
  customersCache[cIdx].addresses[aIdx] = { ...customersCache[cIdx].addresses[aIdx], ...input };
  return Promise.resolve(customersCache[cIdx].addresses[aIdx]);
};

export const deleteAddress = (customerId: string, addressId: string): Promise<void> => {
  const cIdx = customersCache.findIndex((c) => c.id === customerId);
  if (cIdx === -1) return Promise.reject(new Error("Customer not found"));
  customersCache[cIdx].addresses = customersCache[cIdx].addresses.filter((a) => a.id !== addressId);
  return Promise.resolve();
};

export const addLedgerEntry = (input: Omit<LedgerEntry, "id" | "createdAt" | "balanceBefore" | "balanceAfter">): Promise<LedgerEntry> => {
  const cIdx = customersCache.findIndex((c) => c.id === input.customerId);
  if (cIdx === -1) return Promise.reject(new Error("Customer not found"));

  const balanceBefore = customersCache[cIdx].ledgerBalance;
  const balanceAfter = balanceBefore + input.amount;
  customersCache[cIdx].ledgerBalance = balanceAfter;

  const entry: LedgerEntry = {
    ...input,
    id: generateId(),
    balanceBefore,
    balanceAfter,
    createdAt: new Date().toISOString(),
  };
  ledgerEntries.push(entry);
  return Promise.resolve(entry);
};

export const getLedgerHistory = (customerId: string): Promise<LedgerEntry[]> =>
  Promise.resolve(
    ledgerEntries
      .filter((e) => e.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  );

export const getAllCustomers = (): Customer[] => [...customersCache];
export const getCustomerArray = (): Customer[] => customersCache;
