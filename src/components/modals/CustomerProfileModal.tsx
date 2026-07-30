import React, { useState, useEffect } from "react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { useModal } from "@/hooks/useModal";
import { useCustomer } from "@/hooks/useCustomer";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { NumberInput } from "@/components/common/NumberInput";
import { SectionCard } from "@/components/common/SectionCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTableOne } from "@/components/ui/data-table";
import type { DataTableOneColumn } from "@/components/ui/data-table";
import { computeInitials, formatCurrency, formatDate, formatRelativeTime } from "@/lib/formatters";
import { fetchOrders } from "@/services/order-service";
import type { Customer, Order, LedgerEntry, Address } from "@/types/commerce.types";
import type { ColorVariant } from "@/types/common.types";
import { Pencil, Trash2, Plus } from "lucide-react";

const LEDGER_TYPE_COLOR: Record<string, ColorVariant> = { sale: "red", payment: "green", refund: "blue", adjustment: "gray" };
const ACTIVE_COLOR: Record<string, ColorVariant> = { Active: "green", Inactive: "gray" };

export const CustomerProfileModal: React.FC = () => {
  const { closeModal, payload, openModal } = useModal();
  const { handleAddLedgerEntry, handleGetLedgerHistory, handleDeleteAddress } = useCustomer();

  const customer = payload.customer as Customer;
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showLedgerForm, setShowLedgerForm] = useState(false);
  const [ledgerType, setLedgerType] = useState<"payment" | "adjustment">("payment");
  const [ledgerAmount, setLedgerAmount] = useState(0);
  const [ledgerNote, setLedgerNote] = useState("");

  useEffect(() => {
    let cancelled = false;
    handleGetLedgerHistory(customer.id).then(setLedger);
    fetchOrders()
      .then((all) => {
        if (!cancelled) setOrders(all.filter((o) => o.customerId === customer.id));
      })
      .catch(() => {
        if (!cancelled) setOrders([]);
      });
    return () => {
      cancelled = true;
    };
  }, [customer.id, handleGetLedgerHistory]);

  const handleAddEntry = async () => {
    const amount = ledgerType === "payment" ? -ledgerAmount : ledgerAmount;
    await handleAddLedgerEntry({ customerId: customer.id, transactionId: null, type: ledgerType, amount, note: ledgerNote });
    const updated = await handleGetLedgerHistory(customer.id);
    setLedger(updated);
    setShowLedgerForm(false);
    setLedgerAmount(0);
    setLedgerNote("");
  };

  const orderColumns: DataTableOneColumn<Order>[] = [
    { key: "orderNumber", header: "Order #", render: (r) => <span className="">{r.orderNumber}</span> },
    { key: "date", header: "Date", render: (r) => formatDate(r.createdAt) },
    { key: "total", header: "Total", render: (r) => formatCurrency(r.total) },
  ];

  return (
    <ResponsiveModal open onOpenChange={() => closeModal()} title="Customer Profile" className="sm:max-w-3xl">
      <div className="flex flex-col gap-4 p-1">
        <SectionCard>
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="text-lg">{computeInitials(`${customer.firstName} ${customer.lastName}`)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-lg">{customer.firstName} {customer.lastName}</span>
                <StatusBadge status={customer.isActive ? "Active" : "Inactive"} colorMap={ACTIVE_COLOR} />
              </div>
              {customer.email && <span className="text-sm text-muted-foreground block">{customer.email}</span>}
              {customer.phone && <span className="text-sm text-muted-foreground block">{customer.phone}</span>}
              <div className="flex gap-4 mt-2 text-sm">
                <span>Orders: <span className="font-medium">{customer.totalOrders}</span></span>
                <span>Spent: <span className="font-medium">{formatCurrency(customer.totalSpent)}</span></span>
              </div>
            </div>
          </div>
        </SectionCard>

        <Tabs defaultValue="orders">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
            <TabsTrigger value="ledger">Ledger</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-4">
            <DataTableOne columns={orderColumns} data={orders} keyExtractor={(r) => r.id} emptyMessage="No orders" />
          </TabsContent>

          <TabsContent value="addresses" className="mt-4">
            <div className="flex flex-col gap-2">
              <Button size="sm" variant="outline" onClick={() => openModal("AddressCreateEdit", { customerId: customer.id })}>
                <Plus className="h-4 w-4 mr-1" /> Add Address
              </Button>
              {customer.addresses.length === 0 ? (
                <EmptyState title="No addresses" description="No addresses added yet" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {customer.addresses.map((addr) => (
                    <SectionCard key={addr.id}>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{addr.label}</span>
                          {addr.isDefault && <Badge variant="secondary">Default</Badge>}
                        </div>
                        <span className="text-sm text-muted-foreground">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</span>
                        <span className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.postalCode}</span>
                        <div className="flex gap-1 mt-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openModal("AddressCreateEdit", { customerId: customer.id, address: addr })}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openModal("ConfirmAction", { title: "Delete Address", description: `Delete "${addr.label}"?`, variant: "destructive", onConfirm: () => handleDeleteAddress(customer.id, addr.id) })}>
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </SectionCard>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="ledger" className="mt-4">
            <div className="flex flex-col gap-3">
              <SectionCard>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-muted-foreground">Current Balance</span>
                    <span className={`block text-2xl font-bold ${customer.ledgerBalance > 0 ? "text-destructive" : customer.ledgerBalance < 0 ? "text-green-600" : ""}`}>
                      {formatCurrency(Math.abs(customer.ledgerBalance))}
                    </span>
                  </div>
                  <Button size="sm" onClick={() => setShowLedgerForm(!showLedgerForm)}>Add Entry</Button>
                </div>
              </SectionCard>

              {showLedgerForm && (
                <SectionCard>
                  <div className="flex flex-col gap-3">
                    <Select value={ledgerType} onValueChange={(v) => setLedgerType(v as "payment" | "adjustment")}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="payment">Payment</SelectItem>
                        <SelectItem value="adjustment">Adjustment</SelectItem>
                      </SelectContent>
                    </Select>
                    <NumberInput value={ledgerAmount} onChange={setLedgerAmount} min={0} prefix="₹" />
                    <Textarea value={ledgerNote} onChange={(e) => setLedgerNote(e.target.value)} placeholder="Note..." />
                    <Button size="sm" onClick={handleAddEntry} disabled={ledgerAmount <= 0}>Save Entry</Button>
                  </div>
                </SectionCard>
              )}

              {ledger.length === 0 ? (
                <EmptyState title="No entries" description="No ledger entries yet" />
              ) : (
                <div className="flex flex-col gap-0 relative">
                  {ledger.map((entry, idx) => (
                    <div key={entry.id} className="flex gap-3 pb-4">
                      <div className="flex flex-col items-center">
                        <div className={`h-3 w-3 rounded-full shrink-0 mt-1 ${entry.type === "sale" ? "bg-destructive" : entry.type === "payment" ? "bg-green-500" : entry.type === "refund" ? "bg-blue-500" : "bg-gray-400"}`} />
                        {idx < ledger.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                      </div>
                      <div className="flex flex-col gap-0.5 flex-1">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={entry.type} colorMap={LEDGER_TYPE_COLOR} />
                          <span className={`font-medium text-sm ${entry.amount > 0 ? "text-destructive" : "text-green-600"}`}>
                            {entry.amount > 0 ? "+" : ""}{formatCurrency(Math.abs(entry.amount))}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">Balance: {formatCurrency(Math.abs(entry.balanceAfter))}</span>
                        {entry.note && <span className="text-xs text-muted-foreground">{entry.note}</span>}
                        <span className="text-xs text-muted-foreground">{formatRelativeTime(entry.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="details" className="mt-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ["First Name", customer.firstName], ["Last Name", customer.lastName],
                ["Email", customer.email ?? "—"], ["Phone", customer.phone ?? "—"],
                ["Member Since", formatDate(customer.createdAt)], ["Status", customer.isActive ? "Active" : "Inactive"],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveModal>
  );
};
