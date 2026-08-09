import React, { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Loader2, MapPin, Package, Printer, Truck, User } from "lucide-react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { useModal } from "@/hooks/useModal";
import { useOrder } from "@/hooks/useOrder";
import { useNotification } from "@/hooks/useNotification";
import { fetchOrderById, ORDERS_QK } from "@/services/order-service";
import {
  createShiprocketOrder,
  fulfillShipment,
} from "@/services/shipping-service";
import { useAuth } from "@/hooks/useAuth";
import { useMasterData } from "@/hooks/useMasterData";
import { StatusBadge } from "@/components/common/StatusBadge";
import { InlineAlert } from "@/components/common/InlineAlert";
import { PermissionGate } from "@/components/common/PermissionGate";
import { SectionCard } from "@/components/common/SectionCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import {
  canShipWithShiprocket,
  filterActiveOrderStatuses,
  getOrderActionMessage,
  getOrderActionPhase,
  getOrderStatusLabel,
  isCodOrder,
  orderMayReceiveShiprocketUpdates,
  ORDERS_SHIPROCKET_POLL_MS,
} from "@/lib/order-display";
import { ADMIN_MANUAL_STATUS_CODES, SHIPROCKET_ENABLED } from "@/constants/order.constants";
import { cn } from "@/lib/utils";
import type { Order, ShipmentTracking } from "@/types/commerce.types";
import type { ColorVariant } from "@/types/common.types";

export const OrderDetailModal: React.FC = () => {
  const { closeModal, payload, openModal, activeKey } = useModal();
  const { handleUpdateStatus } = useOrder();
  const { notify } = useNotification();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { orderStatuses } = useMasterData();
  const activeOrderStatuses = filterActiveOrderStatuses(orderStatuses);

  const initialOrder = payload?.order as Order | undefined;
  const orderId = activeKey === "OrderDetail" ? initialOrder?.id : undefined;

  const { data: fetchedOrder } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrderById(orderId!),
    enabled: Boolean(orderId) && activeKey === "OrderDetail",
    refetchInterval: (query) => {
      const current = query.state.data ?? initialOrder;
      if (!current || !orderMayReceiveShiprocketUpdates(current, orderStatuses)) {
        return false;
      }
      return ORDERS_SHIPROCKET_POLL_MS;
    },
  });

  const order = fetchedOrder ?? initialOrder;

  const [optimisticStatus, setOptimisticStatus] = useState<string | null>(null);
  const [optimisticShipment, setOptimisticShipment] = useState<Partial<ShipmentTracking> | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [shippingBusy, setShippingBusy] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<{ type: "success"; message: string } | null>(null);
  const [statusHighlight, setStatusHighlight] = useState(false);
  const prevStatusRef = useRef<string | undefined>(undefined);
  const manualStatusChangeRef = useRef(false);

  useEffect(() => {
    if (order?.id) {
      setOptimisticStatus(null);
      setOptimisticShipment(null);
      setStatusFeedback(null);
      prevStatusRef.current = order.status;
      manualStatusChangeRef.current = false;
    }
  }, [order?.id]);

  useEffect(() => {
    if (optimisticStatus && order?.status === optimisticStatus) {
      setOptimisticStatus(null);
    }
  }, [order?.status, optimisticStatus]);

  useEffect(() => {
    if (!statusFeedback) return;
    const timer = window.setTimeout(() => setStatusFeedback(null), 8000);
    return () => window.clearTimeout(timer);
  }, [statusFeedback]);

  useEffect(() => {
    if (!order?.status) return;
    const previous = prevStatusRef.current;
    if (previous && previous !== order.status && !isUpdating && !optimisticStatus) {
      if (!manualStatusChangeRef.current) {
        setStatusFeedback({
          type: "success",
          message: order.shipment
            ? `Status auto-updated to ${getOrderStatusLabel(order.status, orderStatuses)} via Shiprocket`
            : `Status updated to ${getOrderStatusLabel(order.status, orderStatuses)}`,
        });
        setStatusHighlight(true);
        window.setTimeout(() => setStatusHighlight(false), 2000);
      }
      manualStatusChangeRef.current = false;
    }
    prevStatusRef.current = order.status;
  }, [order?.status, order?.shipment, orderStatuses, isUpdating, optimisticStatus]);

  const statusColorMap = orderStatuses.reduce<Record<string, ColorVariant>>((acc, s) => {
    acc[s.code] = s.color;
    return acc;
  }, {});

  const confirmedStatus = activeOrderStatuses.find((s) => s.code === "CONFIRMED");
  const cancelledStatus = activeOrderStatuses.find((s) => s.code === "CANCELLED");
  const manualStatusOptions = activeOrderStatuses.filter((s) =>
    (ADMIN_MANUAL_STATUS_CODES as readonly string[]).includes(s.code),
  );

  const patchOrderInCache = (patch: Partial<Order>) => {
    if (!order) return;
    queryClient.setQueryData<Order>(["order", order.id], (old) => (old ? { ...old, ...patch } : old));
    queryClient.setQueryData<Order[]>(ORDERS_QK, (old) =>
      old?.map((o) => (o.id === order.id ? { ...o, ...patch } : o)),
    );
  };

  const handleConfirmOrder = async () => {
    if (!order || !confirmedStatus) return;
    setIsUpdating(true);
    manualStatusChangeRef.current = true;
    try {
      await handleUpdateStatus(order.id, confirmedStatus.code, "Order confirmed", user?.name ?? "System");
      setOptimisticStatus(confirmedStatus.code);
      patchOrderInCache({ status: confirmedStatus.code });
      setStatusFeedback({ type: "success", message: "✓ Confirmed — now pack and click Ship with Shiprocket below" });
      setStatusHighlight(true);
      window.setTimeout(() => setStatusHighlight(false), 2500);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleManualStatusChange = async (newStatus: string) => {
    if (!order || newStatus === displayStatus) return;
    setIsUpdating(true);
    manualStatusChangeRef.current = true;
    try {
      await handleUpdateStatus(order.id, newStatus, "Status updated manually by admin", user?.name ?? "System");
      setOptimisticStatus(newStatus);
      patchOrderInCache({ status: newStatus });
      setStatusFeedback({
        type: "success",
        message: `Status updated to ${getOrderStatusLabel(newStatus, orderStatuses)}`,
      });
      setStatusHighlight(true);
      window.setTimeout(() => setStatusHighlight(false), 2000);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleShipWithShiprocket = async () => {
    if (!order) return;
    setShippingBusy(true);
    try {
      const hasShipment = Boolean(order.shipment?.shipmentId || order.shipment?.shiprocketOrderId);
      if (!hasShipment) await createShiprocketOrder(order.id);
      const result = await fulfillShipment(order.id);
      const shipmentPatch: Partial<ShipmentTracking> = {
        awbCode: result.awbCode,
        courierName: result.courierName,
        trackingUrl: result.labelUrl,
        currentStatus: result.currentStatus ?? "AWB Assigned",
      };
      setOptimisticShipment(shipmentPatch);
      patchOrderInCache({
        shipment: {
          id: order.shipment?.id ?? "temp",
          orderId: order.id,
          shiprocketOrderId: order.shipment?.shiprocketOrderId ?? null,
          shipmentId: result.shipmentId ?? order.shipment?.shipmentId ?? null,
          lastUpdated: new Date().toISOString(),
          ...shipmentPatch,
        } as ShipmentTracking,
      });
      await queryClient.invalidateQueries({ queryKey: ["order", order.id] });
      await queryClient.invalidateQueries({ queryKey: ORDERS_QK });
      if (result.labelUrl) window.open(result.labelUrl, "_blank", "noopener,noreferrer");
      setStatusFeedback({
        type: "success",
        message: result.awbCode
          ? `✓ Shipped — AWB ${result.awbCode}. Stick label on box, courier will pick up.`
          : "✓ Registered with Shiprocket",
      });
      setStatusHighlight(true);
      window.setTimeout(() => setStatusHighlight(false), 2500);
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : "Shiprocket failed", "error");
    } finally {
      setShippingBusy(false);
    }
  };

  const handlePrintLabel = () => {
    const labelUrl = displayShipment?.trackingUrl;
    if (labelUrl) window.open(labelUrl, "_blank", "noopener,noreferrer");
    else notify("Ship with Shiprocket first to get the label", "warning");
  };

  const displayStatus = optimisticStatus ?? order?.status ?? "PENDING";

  const displayShipment = useMemo((): ShipmentTracking | null => {
    if (!order) return null;
    if (!optimisticShipment && !order.shipment) return null;
    if (!order.shipment) {
      return {
        id: "temp",
        orderId: order.id,
        shiprocketOrderId: null,
        shipmentId: optimisticShipment?.shipmentId ?? null,
        awbCode: optimisticShipment?.awbCode ?? null,
        courierName: optimisticShipment?.courierName ?? null,
        trackingUrl: optimisticShipment?.trackingUrl ?? null,
        currentStatus: optimisticShipment?.currentStatus ?? null,
        lastUpdated: new Date().toISOString(),
      };
    }
    return { ...order.shipment, ...optimisticShipment };
  }, [order, optimisticShipment]);

  if (!order) return null;

  const displayOrder: Order = { ...order, status: displayStatus, shipment: displayShipment };
  const hasAwb = Boolean(displayShipment?.awbCode);
  const isCod = isCodOrder(order);
  const phase = getOrderActionPhase(displayOrder, hasAwb);
  const actionMessage = getOrderActionMessage(phase, displayOrder);
  const currentStatusLabel = getOrderStatusLabel(displayStatus, orderStatuses);
  const isFinal = ["DELIVERED", "CANCELLED", "RETURNED"].includes(displayStatus);
  const showCodConfirm = phase === "cod_confirm";
  const showShipButton = phase === "ready_to_ship";
  const busy = isUpdating || shippingBusy;

  const paymentLabel = isCod
    ? "Cash on Delivery"
    : order.paymentStatus === "PAID"
      ? "Paid online"
      : "Online — payment pending";
  return (
    <ResponsiveModal
      open={activeKey === "OrderDetail"}
      onOpenChange={() => closeModal()}
      title={`Order ${order.orderNumber}`}
      description={`${formatDateTime(order.createdAt)} · ${formatCurrency(order.total)} · ${order.paymentMethod}`}
      className="sm:max-w-2xl"
    >
      <div className="flex flex-col gap-4 p-1">
        {statusFeedback && (
          <InlineAlert type={statusFeedback.type} message={statusFeedback.message} dismissible />
        )}

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge
            status={displayStatus}
            label={currentStatusLabel}
            colorMap={statusColorMap}
            className={cn("text-xs", statusHighlight && "ring-2 ring-primary ring-offset-1")}
          />
          <span className="text-xs text-muted-foreground">{paymentLabel}</span>
        </div>

        {/* What to do — always visible */}
        <div
          className={cn(
            "rounded-lg border px-4 py-3 text-sm",
            phase === "waiting_payment" && "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
            phase === "ready_to_ship" && "border-primary/30 bg-primary/5",
            phase === "shipped" && "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200",
            phase === "complete" && "border-border bg-muted/40 text-muted-foreground",
            phase === "cod_confirm" && "border-border bg-muted/40",
          )}
        >
          <p className="font-medium">{actionMessage}</p>
        </div>

        {/* Action buttons */}
        <PermissionGate moduleKey="orders" operation="edit">
          <div className="flex flex-col gap-2">
            {!isFinal && (
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-xs text-muted-foreground">Update status</span>
                <Select
                  value={displayStatus}
                  onValueChange={(v) => void handleManualStatusChange(v)}
                  disabled={busy}
                >
                  <SelectTrigger className="h-9 flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {manualStatusOptions.map((s) => (
                      <SelectItem key={s.code} value={s.code}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {showCodConfirm && (
              <Button
                onClick={handleConfirmOrder}
                disabled={busy}
                className="w-full h-11 bg-foreground text-background hover:bg-foreground/90"
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm COD Order"}
              </Button>
            )}

            {/* Shiprocket pan-India shipping — disabled while delivery is manual/in-city. Flip
                SHIPROCKET_ENABLED in constants/order.constants.ts to bring this back. */}
            {SHIPROCKET_ENABLED && showShipButton && (
              <Button onClick={handleShipWithShiprocket} disabled={busy} className="w-full h-11">
                {shippingBusy ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Truck className="mr-2 h-4 w-4" />
                )}
                Ship with Shiprocket
              </Button>
            )}

            {phase === "shipped" && (
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handlePrintLabel} disabled={busy}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print Label
                </Button>
                {displayShipment?.trackingUrl && (
                  <Button variant="outline" className="flex-1" asChild>
                    <a href={displayShipment.trackingUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Track
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </PermissionGate>

        {phase === "shipped" && displayShipment && (
          <p className="text-xs text-muted-foreground px-1">
            {displayShipment.courierName && `${displayShipment.courierName} · `}
            AWB {displayShipment.awbCode}
            {displayShipment.currentStatus && ` · ${displayShipment.currentStatus}`}
          </p>
        )}

        <SectionCard title={`Products (${order.items.length})`}>
          <div className="divide-y divide-border">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="flex h-12 w-10 shrink-0 items-center justify-center overflow-hidden rounded border bg-muted/40">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-contain p-0.5" />
                  ) : (
                    <Package className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{item.productName}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.variantName} · Qty {item.quantity}
                    {item.quantity > 1 ? ` · ${formatCurrency(item.unitPrice)} each` : ""}
                  </p>
                </div>
                <p className="text-sm font-medium shrink-0">{formatCurrency(item.totalPrice)}</p>
              </div>
            ))}
          </div>
          <Separator className="my-3" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="text-foreground">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>
                Discount
                {order.couponCode ? (
                  <span className="ml-1 text-foreground">({order.couponCode})</span>
                ) : null}
              </span>
              <span className="text-foreground">
                {order.discountAmount > 0
                  ? `−${formatCurrency(order.discountAmount)}`
                  : formatCurrency(0)}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span className="text-foreground">{formatCurrency(order.shippingAmount)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Delivery">
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <p className="font-medium">{order.customer.firstName} {order.customer.lastName}</p>
                {order.customer.email && <p className="text-xs text-muted-foreground">{order.customer.email}</p>}
              </div>
            </div>
            {order.shippingAddress && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-muted-foreground">
                    {order.shippingAddress.line1}, {order.shippingAddress.city},{" "}
                    {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </p>
                  {order.shippingAddress.latitude != null && order.shippingAddress.longitude != null && (
                    <a
                      href={`https://www.google.com/maps?q=${order.shippingAddress.latitude},${order.shippingAddress.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View pinned location on map
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {order.notes && (
          <p className="text-sm text-muted-foreground px-1">
            <span className="font-medium text-foreground">Note: </span>{order.notes}
          </p>
        )}

        {!isFinal && cancelledStatus && (
          <PermissionGate moduleKey="orders" operation="delete">
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive w-fit"
              disabled={busy}
              onClick={() =>
                openModal("ConfirmAction", {
                  title: "Cancel Order",
                  description: `Cancel order ${order.orderNumber}? Stock will be restored.`,
                  variant: "destructive",
                  onConfirm: async () => {
                    setIsUpdating(true);
                    manualStatusChangeRef.current = true;
                    try {
                      await handleUpdateStatus(order.id, cancelledStatus.code, "Order cancelled", user?.name ?? "System");
                      setOptimisticStatus(cancelledStatus.code);
                      patchOrderInCache({ status: cancelledStatus.code });
                      setStatusFeedback({ type: "success", message: "Order cancelled" });
                    } finally {
                      setIsUpdating(false);
                    }
                  },
                })
              }
            >
              Cancel order
            </Button>
          </PermissionGate>
        )}
      </div>
    </ResponsiveModal>
  );
};
