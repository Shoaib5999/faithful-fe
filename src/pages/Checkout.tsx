import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Lock, Plus, ShieldCheck, Trash2, Truck } from "lucide-react";
import { CartLineQtyControl } from "@/components/storefront/CartLineQtyControl";
import { StoreAddressFormModal } from "@/components/storefront/StoreAddressFormModal";
import { StorePageShell } from "@/components/storefront/StorePageShell";
import { StorePageTitle } from "@/components/storefront/StorePageTitle";
import { RevealTitle } from "@/components/storefront/motion/RevealTitle";
import {
  StoreFormLabel,
  StoreGhostButton,
  StoreInput,
  StorePageContainer,
  StorePrimaryButton,
  StorePrimaryLink,
  storePageSectionClass,
  storePanelClass,
} from "@/components/storefront/storefront-ui";
import {
  getCheckoutButtonLabel,
  getPaymentMethodHelperText,
  isOnlineCheckoutPaymentCode,
  UPI_PAYMENT_CODE,
  type OnlineCheckoutPaymentCode,
} from "@/constants/payment.constants";
import { useCart } from "@/context/CartContext";
import { useCheckoutConfig } from "@/hooks/useCheckoutConfig";
import { useStorefrontPaymentModes } from "@/hooks/useStorefrontPaymentModes";
import { useStoreAuth } from "@/context/StoreAuthContext";
import { useStoreAuthUi } from "@/context/StoreAuthUiContext";
import { useNotification } from "@/hooks/useNotification";
import { getErrorMessage } from "@/lib/error";
import { mergeStoreCustomerPhoneFromAddresses, normalizeStorePhone } from "@/lib/store-auth";
import {
  getDefaultCheckoutPaymentCode,
  selectCheckoutPaymentModes,
  sortCheckoutPaymentModesForDisplay,
} from "@/lib/checkout-payment-modes";
import { openOnlinePaymentCheckout } from "@/lib/razorpay-checkout";
import { formatStoreOrderNumber } from "@/lib/store-order-display";
import { cn } from "@/lib/utils";
import { completeGuestOnlineCheckout, completeOnlineCheckout, prepareGuestOnlineCheckout, prepareOnlineCheckout } from "@/services/payment-service";
import { fetchStoreAddresses, type StoreAddressApi } from "@/services/store-address-service";
import { placeStoreOrder } from "@/services/store-customer-order-service";
import type { StoreShippingMethod, StoreCartSummary } from "@/services/store-cart-service";
import { estimateGuestCart } from "@/services/store-cart-service";
import { getPendingCouponCode, setPendingCouponCode } from "@/constants/store-coupon.constants";
import { validateStoreCoupon } from "@/services/store-coupon-service";

type CouponFeedback = { type: "success" | "error"; message: string };

function CheckoutStepHeader({
  step,
  title,
  action,
}: {
  step: number;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3 border-b border-black/10 pb-4">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--store-ink)] font-store-body text-xs font-bold text-white">
          {step}
        </span>
        <RevealTitle
          as="h2"
          className=" text-lg tracking-wide text-[var(--store-ink)] md:text-xl"
        >
          {title}
        </RevealTitle>
      </div>
      {action}
    </div>
  );
}

function parsePrice(price: string): number {
  const n = Number(price.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { notify } = useNotification();
  const { customer, isLoggedIn, isBootstrapping, updateCustomer } = useStoreAuth();
  const { openAuth } = useStoreAuthUi();
  const { items, summary, setItemQty, removeItem, refreshCart, isCartLoading, clear } = useCart();
  const { data: paymentModes = [], isPending: paymentModesLoading } = useStorefrontPaymentModes();
  const { data: checkoutConfig, isPending: checkoutConfigLoading } = useCheckoutConfig();

  const checkoutPaymentModes = useMemo(() => {
    const modes = selectCheckoutPaymentModes(paymentModes);
    // Guests: UPI only (opens Razorpay with all instruments; no method picker).
    if (!isLoggedIn && Boolean(checkoutConfig?.magicCheckoutEnabled)) {
      return modes.filter((mode) => mode.code.toUpperCase() === UPI_PAYMENT_CODE);
    }
    return modes;
  }, [paymentModes, isLoggedIn, checkoutConfig?.magicCheckoutEnabled]);

  const displayPaymentModes = useMemo(
    () => sortCheckoutPaymentModesForDisplay(checkoutPaymentModes),
    [checkoutPaymentModes],
  );

  const defaultPaymentMethod = useMemo(
    () => getDefaultCheckoutPaymentCode(checkoutPaymentModes),
    [checkoutPaymentModes],
  );

  const [addresses, setAddresses] = useState<StoreAddressApi[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponDraft, setCouponDraft] = useState("");
  const [couponFeedback, setCouponFeedback] = useState<CouponFeedback | null>(null);
  const [couponApplying, setCouponApplying] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string>("");
  const [guestSummary, setGuestSummary] = useState<StoreCartSummary | null>(null);
  const pendingCouponAppliedRef = useRef(false);
  const guestAutoPayStartedRef = useRef(false);

  const checkoutSummary = isLoggedIn ? summary : guestSummary;

  const paymentMethod = useMemo(() => {
    if (
      selectedPaymentMethod
      && checkoutPaymentModes.some((mode) => mode.code === selectedPaymentMethod)
    ) {
      return selectedPaymentMethod;
    }
    return defaultPaymentMethod;
  }, [selectedPaymentMethod, defaultPaymentMethod, checkoutPaymentModes]);

  const magicCheckoutEnabled = Boolean(checkoutConfig?.magicCheckoutEnabled);
  const isGuestMagicCheckout = !isLoggedIn && magicCheckoutEnabled;
  const checkoutFormReady = !paymentModesLoading && !checkoutConfigLoading;

  const reloadAddresses = async () => {
    setAddressesLoading(true);
    try {
      const list = await fetchStoreAddresses();
      setAddresses(list);
      const def = list.find((a) => a.isDefault) ?? list[0];
      setSelectedAddressId((current) => {
        if (current && list.some((a) => a.id === current)) return current;
        return def?.id ?? null;
      });
    } catch {
      setAddresses([]);
      setSelectedAddressId(null);
    } finally {
      setAddressesLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    void reloadAddresses();
  }, [isLoggedIn]);

  const subtotalDisplay = useMemo(() => {
    if (checkoutSummary) return Number(checkoutSummary.subtotal);
    return items.reduce((sum, it) => sum + (it.priceNumber ?? parsePrice(it.price)) * it.qty, 0);
  }, [items, checkoutSummary]);

  const discountDisplay = checkoutSummary ? Number(checkoutSummary.discount) : 0;
  const appliedCouponCode =
    discountDisplay > 0 && checkoutSummary?.coupon?.code ? checkoutSummary.coupon.code : null;
  const shippingDisplay = checkoutSummary ? Number(checkoutSummary.shippingCharge) : 0;
  const isFreeShipping = Boolean(checkoutSummary?.isFreeShippingApplied);
  const originalShippingFee =
    checkoutSummary?.shippingSettings?.defaultShippingFee ??
    checkoutSummary?.shippingMethod?.fee ??
    0;
  const shippingMethods = checkoutSummary?.shippingMethods ?? [];
  const totalDisplay = checkoutSummary
    ? Number(checkoutSummary.total)
    : subtotalDisplay - discountDisplay + shippingDisplay;

  useEffect(() => {
    const methods = checkoutSummary?.shippingMethods;
    if (!methods?.length) return;
    setSelectedShippingMethod((current) => {
      if (current && methods.some((method) => method.code === current)) {
        return current;
      }
      const selected = checkoutSummary?.shippingMethod?.code;
      if (selected) return selected;
      const fallback =
        methods.find((method) => method.isDefault)?.code
        ?? methods[0]?.code
        ?? "";
      return fallback;
    });
  }, [checkoutSummary?.shippingMethod?.code, checkoutSummary?.shippingMethods]);

  useEffect(() => {
    if (isLoggedIn || items.length === 0) {
      setGuestSummary(null);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const estimate = await estimateGuestCart({
          items: items.map((line) => ({
            variantId: line.variantId,
            quantity: line.qty,
          })),
          coupon: couponCode || undefined,
          shippingMethod: selectedShippingMethod || undefined,
        });
        if (!cancelled) setGuestSummary(estimate);
      } catch {
        if (!cancelled) setGuestSummary(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, items, couponCode, selectedShippingMethod]);

  const formatMethodPrice = (method: StoreShippingMethod) => {
    if (isFreeShipping) {
      return (
        <span className="inline-flex items-center gap-1.5">
          {method.fee > 0 ? (
            <span className="line-through opacity-60">
              ₹{method.fee.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          ) : null}
          <span className="font-semibold text-[var(--store-red)]">Free</span>
        </span>
      );
    }
    return `₹${method.fee.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleShippingMethodChange = async (code: string) => {
    setSelectedShippingMethod(code);
    if (isLoggedIn) {
      await refreshCart(couponCode || undefined, code);
    }
  };

  useEffect(() => {
    if (pendingCouponAppliedRef.current || !isLoggedIn || isCartLoading || couponCode) return;
    const pending = getPendingCouponCode();
    if (!pending) return;
    pendingCouponAppliedRef.current = true;
    setCouponDraft(pending);
    void (async () => {
      setCouponApplying(true);
      try {
        const validation = await validateStoreCoupon(pending, subtotalDisplay);
        if (!validation.valid) {
          setPendingCouponCode(null);
          setCouponFeedback({
            type: "error",
            message: validation.message ?? "Coupon from product page is no longer valid.",
          });
          return;
        }
        const updated = await refreshCart(pending, selectedShippingMethod || undefined);
        const discount = Number(updated?.discount ?? 0);
        if (updated?.coupon && discount > 0) {
          setCouponCode(pending);
          setCouponFeedback({
            type: "success",
            message: `Coupon "${pending}" applied from product page.`,
          });
        }
      } catch (err) {
        setCouponFeedback({ type: "error", message: getErrorMessage(err) });
      } finally {
        setCouponApplying(false);
      }
    })();
  }, [isLoggedIn, isCartLoading, couponCode, subtotalDisplay]);

  const handleApplyCoupon = async () => {
    const c = couponDraft.trim();
    setCouponFeedback(null);

    if (!c) {
      setCouponCode("");
      await refreshCart(undefined, selectedShippingMethod || undefined);
      return;
    }

    setCouponApplying(true);
    try {
      const validation = await validateStoreCoupon(c, subtotalDisplay);
      if (!validation.valid) {
        setCouponCode("");
        setPendingCouponCode(null);
        setCouponFeedback({
          type: "error",
          message: validation.message ?? "This coupon code is not applicable to your order.",
        });
        await refreshCart(undefined, selectedShippingMethod || undefined);
        return;
      }

      const updated = await refreshCart(c, selectedShippingMethod || undefined);
      const discount = Number(updated?.discount ?? 0);
      if (updated?.coupon && discount > 0) {
        const code = updated.coupon.code;
        setCouponCode(code);
        setCouponDraft(code);
        setPendingCouponCode(code);
        setCouponFeedback({
          type: "success",
          message: `Coupon "${code}" applied. You save ₹${discount.toLocaleString("en-IN")}.`,
        });
        return;
      }

      setCouponCode("");
      setCouponFeedback({
        type: "error",
        message: "This coupon code is not applicable to your order.",
      });
      await refreshCart(undefined, selectedShippingMethod || undefined);
    } catch (err) {
      setCouponCode("");
      setCouponFeedback({
        type: "error",
        message: getErrorMessage(err),
      });
      await refreshCart(undefined, selectedShippingMethod || undefined);
    } finally {
      setCouponApplying(false);
    }
  };

  const handleRemoveCoupon = async () => {
    setCouponDraft("");
    setCouponCode("");
    setPendingCouponCode(null);
    setCouponFeedback(null);
    setCouponApplying(true);
    try {
      await refreshCart(undefined, selectedShippingMethod || undefined);
    } finally {
      setCouponApplying(false);
    }
  };

  const handlePlaceOrder = useCallback(async () => {
    if (!paymentMethod) {
      notify("Select a payment method.", "error");
      return;
    }

    const selectedAddress = addresses.find((address) => address.id === selectedAddressId);
    const isOnline = isOnlineCheckoutPaymentCode(paymentMethod);
    const useMagicFlow = magicCheckoutEnabled && isOnline;
    const appliedCoupon = couponCode.trim() || undefined;

    if (isGuestMagicCheckout && !isOnline) {
      notify("Please sign in to use cash on delivery.", "error");
      return;
    }

    if (!useMagicFlow && !selectedAddressId) {
      notify("Select a delivery address.", "error");
      return;
    }

    setPlacing(true);
    try {
      if (isOnline) {
        const guestCartItems = items.map((line) => ({
          variantId: line.variantId,
          quantity: line.qty,
        }));

        const session = isGuestMagicCheckout
          ? await prepareGuestOnlineCheckout({
              items: guestCartItems,
              paymentMethod,
              couponCode: appliedCoupon,
              shippingMethodCode: selectedShippingMethod || undefined,
            })
          : await prepareOnlineCheckout({
              addressId: selectedAddressId || undefined,
              paymentMethod,
              couponCode: appliedCoupon,
              shippingMethodCode: selectedShippingMethod || undefined,
            });

        const checkoutResult = await openOnlinePaymentCheckout({
          keyId: session.keyId,
          amount: session.amount,
          currency: session.currency,
          razorpayOrderId: session.razorpayOrderId,
          paymentMethod: session.paymentMethod as OnlineCheckoutPaymentCode,
          checkoutMode: session.checkoutMode,
          appliedCouponCode: useMagicFlow ? appliedCoupon : undefined,
          appliedCouponDiscountPaise:
            useMagicFlow && appliedCoupon ? Math.round(discountDisplay * 100) : undefined,
          description: "Faithful Meat order",
          // Guests: no prefill so Magic Checkout shows email/contact fields.
          prefill: isGuestMagicCheckout
            ? undefined
            : {
                name: selectedAddress?.name ?? customer?.name,
                email: customer?.email,
                contact: selectedAddress?.phone ?? customer?.phone,
              },
        });

        if (checkoutResult.status === "dismissed") {
          notify("Payment cancelled. Your cart is unchanged.", "error");
          return;
        }

        if (checkoutResult.status === "failed") {
          notify(checkoutResult.message, "error");
          return;
        }

        if (isGuestMagicCheckout) {
          const result = await completeGuestOnlineCheckout({
            paymentMethod,
            couponCode: appliedCoupon,
            shippingMethodCode: selectedShippingMethod || undefined,
            razorpayOrderId: checkoutResult.response.razorpay_order_id,
            razorpayPaymentId: checkoutResult.response.razorpay_payment_id,
            razorpaySignature: checkoutResult.response.razorpay_signature,
          });

          if (!result?.order?.id || !result.email) {
            throw new Error(
              "Order was paid but could not be finalized. Contact support with your payment ID.",
            );
          }

          notify("Order placed successfully.", "success");
          setCouponCode("");
          setCouponDraft("");
          setCouponFeedback(null);
          setPendingCouponCode(null);
          await clear();
          navigate(
            `/track-order?orderId=${encodeURIComponent(formatStoreOrderNumber(result.order.id))}`,
            { replace: true },
          );
          return;
        }

        await completeOnlineCheckout({
          addressId: selectedAddressId || undefined,
          paymentMethod,
          couponCode: appliedCoupon,
          shippingMethodCode: selectedShippingMethod || undefined,
          razorpayOrderId: checkoutResult.response.razorpay_order_id,
          razorpayPaymentId: checkoutResult.response.razorpay_payment_id,
          razorpaySignature: checkoutResult.response.razorpay_signature,
        });

        if (useMagicFlow && customer && !normalizeStorePhone(customer.phone)) {
          try {
            const addresses = await fetchStoreAddresses();
            const withPhone = mergeStoreCustomerPhoneFromAddresses(customer, addresses);
            if (normalizeStorePhone(withPhone.phone)) {
              updateCustomer(withPhone);
            }
          } catch {
            // Order already placed; profile phone can sync on next session load
          }
        }

        notify("Order placed successfully.", "success");
        setCouponCode("");
        setCouponDraft("");
        setCouponFeedback(null);
        setPendingCouponCode(null);
        await refreshCart();
        navigate("/account/orders", { replace: true });
        return;
      }

      if (!selectedAddressId) {
        notify("Select a delivery address.", "error");
        return;
      }

      await placeStoreOrder({
        addressId: selectedAddressId,
        paymentMethod,
        couponCode: appliedCoupon,
        shippingMethodCode: selectedShippingMethod || undefined,
      });

      notify("Order placed successfully.", "success");
      setCouponCode("");
      setCouponDraft("");
      setCouponFeedback(null);
      setPendingCouponCode(null);
      await refreshCart();
      navigate("/account/orders", { replace: true });
    } catch (err) {
      notify(getErrorMessage(err), "error");
    } finally {
      setPlacing(false);
    }
  }, [
    addresses,
    clear,
    couponCode,
    customer,
    discountDisplay,
    isGuestMagicCheckout,
    items,
    magicCheckoutEnabled,
    navigate,
    notify,
    paymentMethod,
    refreshCart,
    selectedAddressId,
    selectedShippingMethod,
    updateCustomer,
  ]);

  // Guest checkout: skip payment radios and open Razorpay once cart is ready.
  useEffect(() => {
    if (isBootstrapping) return;
    if (!isGuestMagicCheckout) return;
    if (!checkoutFormReady || isCartLoading) return;
    if (items.length === 0) return;
    if (placing) return;
    if (guestAutoPayStartedRef.current) return;
    if (!paymentMethod || !isOnlineCheckoutPaymentCode(paymentMethod)) return;
    if (checkoutPaymentModes.length === 0) return;

    guestAutoPayStartedRef.current = true;
    void handlePlaceOrder();
  }, [
    checkoutFormReady,
    checkoutPaymentModes.length,
    handlePlaceOrder,
    isBootstrapping,
    isCartLoading,
    isGuestMagicCheckout,
    items.length,
    paymentMethod,
    placing,
  ]);

  if (isBootstrapping) {
    return (
      <StorePageShell>
        <StorePageTitle title="Checkout" />
        <StorePageContainer className={cn(storePageSectionClass, "flex justify-center py-16")}>
          <Loader2 className="h-8 w-8 animate-spin text-[var(--store-muted)]" aria-hidden />
        </StorePageContainer>
      </StorePageShell>
    );
  }

  if (!isLoggedIn && !isGuestMagicCheckout) {
    return (
      <StorePageShell>
        <StorePageTitle title="Checkout" />
        <StorePageContainer className={cn(storePageSectionClass, "mx-auto max-w-2xl px-4 py-12 md:py-16")}>
          {items.length === 0 ? (
            <div className={cn(storePanelClass, "px-6 py-12 text-center md:px-12")}>
              <RevealTitle
                as="h1"
                className=" text-2xl font-bold uppercase tracking-wide text-[var(--store-ink)] md:text-3xl"
              >
                Your Cart is Empty
              </RevealTitle>
              <p className="mt-4 font-store-body text-sm leading-relaxed text-[var(--store-muted)]">
                Discover fresh chicken, mutton, fish, and more.
              </p>
              <StorePrimaryLink to="/collection" className="mt-8 px-8">
                Explore Collection
              </StorePrimaryLink>
            </div>
          ) : (
            <div className={cn(storePanelClass, "px-6 py-10 md:px-12")}>
              <div className="text-center">
                <RevealTitle
                  as="h1"
                  className=" text-2xl font-bold uppercase tracking-wide text-[var(--store-ink)] md:text-3xl"
                >
                  Sign In to Checkout
                </RevealTitle>
                <p className="mt-4 font-store-body text-sm leading-relaxed text-[var(--store-muted)] md:text-base">
                  Complete your purchase by signing in. Your cart items are safely saved on this device.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                <StorePrimaryButton 
                  type="button" 
                  className="w-full py-3" 
                  onClick={() => openAuth("login")}
                >
                  Sign In to Continue
                </StorePrimaryButton>
                
                <div className="text-center">
                  <p className="font-store-body text-xs text-[var(--store-muted)]">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => openAuth("signup")}
                      className="font-semibold text-[var(--store-red)] hover:underline"
                    >
                      Create one
                    </button>
                  </p>
                </div>
              </div>

              <div className="mt-8 border-t border-black/10 pt-6">
                <Link
                  to="/collection"
                  className="block text-center font-store-body text-xs font-semibold uppercase tracking-[0.12em] text-[var(--store-muted)] transition-colors hover:text-[var(--store-ink)]"
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </StorePageContainer>
      </StorePageShell>
    );
  }

  if (items.length === 0) {
    return (
      <StorePageShell>
        <StorePageTitle title="Checkout" />
        <StorePageContainer className={cn(storePageSectionClass, "max-w-2xl text-center")}>
          <p className="font-store-body text-sm text-[var(--store-muted)]">
            Your cart is empty. Add a product to continue.
          </p>
          <StorePrimaryLink to="/collection" className="mt-6">
            Continue shopping
          </StorePrimaryLink>
        </StorePageContainer>
      </StorePageShell>
    );
  }

  const useMagicFlow =
    magicCheckoutEnabled && isOnlineCheckoutPaymentCode(paymentMethod);

  return (
    <StorePageShell>
      <StorePageTitle title="Checkout" />
      <StorePageContainer className={storePageSectionClass}>
        {isCartLoading || !checkoutFormReady ? (
          <div className="mt-8 flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--store-muted)]" aria-hidden />
          </div>
        ) : (
          <>
            <p className="font-store-body text-sm text-[var(--store-muted)]">
              {useMagicFlow
                ? isGuestMagicCheckout
                  ? "Review your order and pay securely — no account needed. Enter email, address, and payment in the Razorpay window."
                  : "Review your order and pay securely — address and offers are handled in the payment window."
                : "Review your order, choose delivery address, and place your order."}
            </p>

            {isGuestMagicCheckout ? (
              <p className="mt-3 font-store-body text-xs text-[var(--store-muted)]">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => openAuth("login")}
                  className="font-semibold text-[var(--store-red)] hover:underline"
                >
                  Sign in
                </button>
              </p>
            ) : null}

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="space-y-6 lg:col-span-7">
              {!useMagicFlow ? (
              <section className={cn(storePanelClass, "p-5 md:p-6")}>
                <CheckoutStepHeader
                  step={1}
                  title="Address"
                  action={
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(true)}
                      className="inline-flex items-center gap-1 font-store-body text-xs font-semibold uppercase tracking-[0.12em] text-[var(--store-red)] transition-colors hover:text-[var(--store-red-dark)]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add address
                    </button>
                  }
                />
                {addressesLoading ? (
                  <p className="font-store-body text-sm text-[var(--store-muted)]">Loading addresses…</p>
                ) : addresses.length === 0 ? (
                  <div className="rounded-md border border-dashed border-black/20 bg-[var(--store-cream)]/40 p-6 text-center">
                    <p className="font-store-body text-sm text-[var(--store-muted)]">
                      No saved addresses yet. Add one to continue checkout.
                    </p>
                    <StorePrimaryButton
                      type="button"
                      className="mt-4 inline-flex items-center gap-2"
                      onClick={() => setShowAddressForm(true)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add delivery address
                    </StorePrimaryButton>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {addresses.map((a) => (
                      <li key={a.id}>
                        <label
                          className={cn(
                            "flex cursor-pointer gap-3 rounded-md border p-4 font-store-body text-sm transition-colors",
                            selectedAddressId === a.id
                              ? "border-[var(--store-red)] bg-[#fffdf8] shadow-[var(--store-shadow-sm)]"
                              : "border-black/10 bg-white hover:border-black/20",
                          )}
                        >
                          <input
                            type="radio"
                            name="checkout-address"
                            className="mt-1 accent-[var(--store-red)]"
                            checked={selectedAddressId === a.id}
                            onChange={() => setSelectedAddressId(a.id)}
                          />
                          <span>
                            <span className="font-semibold text-[var(--store-ink)]">{a.name}</span>
                            <span className="block text-[var(--store-muted)]">
                              {a.line1}
                              {a.line2 ? `, ${a.line2}` : ""}
                            </span>
                            <span className="block text-[var(--store-muted)]">
                              {a.city}, {a.state} {a.pincode}
                            </span>
                            <span className="block text-[var(--store-muted)]">{a.phone}</span>
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              ) : null}

              {!useMagicFlow && shippingMethods.length > 0 ? (
                <section className={cn(storePanelClass, "p-5 md:p-6")}>
                  <CheckoutStepHeader step={2} title="Shipping" />
                  <ul className="space-y-2">
                    {shippingMethods.map((method) => (
                      <li key={method.id}>
                        <label
                          className={cn(
                            "flex cursor-pointer items-start gap-3 rounded-md border p-4 font-store-body text-sm transition-colors",
                            selectedShippingMethod === method.code
                              ? "border-[var(--store-red)] bg-[#fffdf8] shadow-[var(--store-shadow-sm)]"
                              : "border-black/10 bg-white hover:border-black/20",
                          )}
                        >
                          <input
                            type="radio"
                            name="checkout-shipping"
                            className="mt-1 accent-[var(--store-red)]"
                            checked={selectedShippingMethod === method.code}
                            onChange={() => void handleShippingMethodChange(method.code)}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <Truck className="h-3.5 w-3.5 text-[var(--store-muted)]" aria-hidden />
                              <span className="font-semibold text-[var(--store-ink)]">{method.name}</span>
                            </span>
                            <span className="mt-1 block text-[var(--store-muted)]">
                              {method.deliveryLabel} · {formatMethodPrice(method)}
                            </span>
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <section className={cn(storePanelClass, "p-5 md:p-6")}>
                <CheckoutStepHeader
                  step={useMagicFlow ? 1 : shippingMethods.length > 0 ? 3 : 2}
                  title="Payment"
                />
                {checkoutPaymentModes.length === 0 ? (
                  <p className="font-store-body text-sm text-[var(--store-muted)]">
                    No payment methods are available. Enable checkout payment modes in admin settings.
                  </p>
                ) : isGuestMagicCheckout ? (
                  <p className="font-store-body text-sm leading-relaxed text-[var(--store-muted)]">
                    Secure payment opens automatically — choose UPI, card, wallet, or any method in the Razorpay window.
                  </p>
                ) : (
                  <div className="space-y-2 font-store-body text-sm">
                    {displayPaymentModes.map((mode) => (
                      <label
                        key={mode.id}
                        className={cn(
                          "flex cursor-pointer gap-3 rounded-md border p-4 transition-colors hover:bg-[var(--store-cream)]/30",
                          paymentMethod === mode.code
                            ? "border-[var(--store-red)] bg-[#fffdf8] shadow-[var(--store-shadow-sm)]"
                            : "border-black/10",
                        )}
                      >
                        <input
                          type="radio"
                          name="checkout-pay"
                          className="mt-0.5 accent-[var(--store-red)]"
                          checked={paymentMethod === mode.code}
                          onChange={() => setSelectedPaymentMethod(mode.code)}
                        />
                        <span>
                          <span className="font-medium text-[var(--store-ink)]">{mode.label}</span>
                          {getPaymentMethodHelperText(mode.code) ? (
                            <span className="mt-0.5 block text-xs leading-relaxed text-[var(--store-muted)]">
                              {getPaymentMethodHelperText(mode.code)}
                            </span>
                          ) : null}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                <div className="mt-6 border-t border-black/10 pt-6">
                  <StorePrimaryButton
                    type="button"
                    disabled={
                      placing ||
                      (!useMagicFlow && (!selectedAddressId || addresses.length === 0)) ||
                      !paymentMethod ||
                      checkoutPaymentModes.length === 0
                    }
                    className="w-full py-3"
                    onClick={() => void handlePlaceOrder()}
                  >
                    {placing ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {isOnlineCheckoutPaymentCode(paymentMethod)
                          ? "Processing payment…"
                          : "Placing order…"}
                      </span>
                    ) : (
                      getCheckoutButtonLabel(paymentMethod)
                    )}
                  </StorePrimaryButton>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                    <span className="inline-flex items-center gap-1.5 font-store-body text-[10px] uppercase tracking-[0.1em] text-[var(--store-muted)]">
                      <Lock className="h-3 w-3" aria-hidden />
                      Secure checkout
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-store-body text-[10px] uppercase tracking-[0.1em] text-[var(--store-muted)]">
                      <ShieldCheck className="h-3 w-3" aria-hidden />
                      Encrypted payments
                    </span>
                  </div>

                  <Link
                    to="/collection"
                    className="mt-4 block text-center font-store-body text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--store-muted)] underline-offset-2 transition-colors hover:text-[var(--store-ink)] hover:underline"
                  >
                    Continue shopping
                  </Link>
                </div>
              </section>
            </div>

            <aside className="lg:col-span-5">
              <div className="lg:sticky lg:top-28">
                <div className={cn(storePanelClass, "overflow-hidden")}>
                  <div className="border-b border-black/10 px-5 py-4 md:px-6">
                    <RevealTitle
                      as="h2"
                      className=" text-lg tracking-wide text-[var(--store-ink)]"
                    >
                      Order summary
                    </RevealTitle>
                    <p className="mt-0.5 font-store-body text-xs text-[var(--store-muted)]">
                      {items.length} {items.length === 1 ? "item" : "items"}
                    </p>
                  </div>

                  <ul className="divide-y divide-black/10">
                    {items.map((it) => {
                      const unitPrice = it.priceNumber ?? parsePrice(it.price);
                      const lineTotal = unitPrice * it.qty;

                      return (
                        <li key={it.id} className="flex gap-3 px-5 py-4 md:px-6">
                          <img
                            src={it.image}
                            alt={it.name}
                            className="h-16 w-14 shrink-0 rounded-sm bg-[var(--store-cream)] object-contain p-1"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-store-body text-sm font-semibold text-[var(--store-ink)]">
                              {it.name}
                            </p>
                            {it.notes && (
                              <p className="mt-0.5 font-store-body text-[11px] text-[var(--store-muted)]">
                                {it.notes}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap items-center gap-3">
                              <CartLineQtyControl
                                qty={it.qty}
                                maxQty={it.stockQty ?? 99}
                                onQtyChange={(nextQty) => void setItemQty(it.id, nextQty)}
                              />
                              <button
                                type="button"
                                onClick={() => void removeItem(it.id)}
                                className="inline-flex items-center gap-1 font-store-body text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--store-muted)] transition-colors hover:text-[var(--store-ink)]"
                                aria-label={`Remove ${it.name}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Remove
                              </button>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="font-store-body text-sm font-semibold text-[var(--store-ink)]">
                              ₹ {lineTotal.toLocaleString("en-IN")}
                            </p>
                            {it.qty > 1 && (
                              <p className="mt-0.5 font-store-body text-[10px] text-[var(--store-muted)]">
                                {it.price} each
                              </p>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="space-y-2 border-t border-black/10 px-5 py-4 font-store-body text-sm md:px-6">
                    <div className="flex justify-between text-[var(--store-muted)]">
                      <span>Subtotal</span>
                      <span className="text-[var(--store-ink)]">₹ {subtotalDisplay.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-[var(--store-muted)]">
                      <span>
                        Discount
                        {appliedCouponCode ? (
                          <span className="ml-1 text-[var(--store-ink)]">({appliedCouponCode})</span>
                        ) : null}
                      </span>
                      <span className="text-[var(--store-ink)]">₹ {discountDisplay.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-[var(--store-muted)]">
                      <span>Shipping</span>
                      <span className="text-[var(--store-ink)]">
                        {shippingDisplay > 0 ? (
                          `₹ ${shippingDisplay.toLocaleString("en-IN")}`
                        ) : (
                          <span className="inline-flex items-center gap-1.5">
                            {originalShippingFee > 0 ? (
                              <span className="text-[var(--store-muted)] line-through opacity-60">
                                ₹ {originalShippingFee.toLocaleString("en-IN")}
                              </span>
                            ) : null}
                            <span className="font-semibold text-[var(--store-red)]">Free</span>
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-black/10 pt-3 text-base font-semibold text-[var(--store-ink)]">
                      <span>Total</span>
                      <span>₹ {totalDisplay.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <div className="border-t border-black/10 bg-[var(--store-cream)]/30 px-5 py-4 md:px-6">
                    {!isGuestMagicCheckout ? (
                      <>
                    <StoreFormLabel>Coupon code</StoreFormLabel>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <StoreInput
                        value={couponDraft}
                        onChange={(e) => {
                          setCouponDraft(e.target.value.toUpperCase());
                          if (couponFeedback) setCouponFeedback(null);
                        }}
                        placeholder="Enter code"
                        disabled={couponApplying || Boolean(appliedCouponCode)}
                        className="min-w-[140px] flex-1 uppercase disabled:cursor-not-allowed disabled:opacity-60"
                      />
                      {appliedCouponCode ? (
                        <StoreGhostButton
                          type="button"
                          onClick={() => void handleRemoveCoupon()}
                          disabled={couponApplying}
                        >
                          Remove
                        </StoreGhostButton>
                      ) : (
                        <StorePrimaryButton
                          type="button"
                          disabled={couponApplying || !couponDraft.trim()}
                          onClick={() => void handleApplyCoupon()}
                        >
                          {couponApplying ? (
                            <span className="inline-flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Applying…
                            </span>
                          ) : (
                            "Apply"
                          )}
                        </StorePrimaryButton>
                      )}
                    </div>
                    {couponFeedback ? (
                      <p
                        role={couponFeedback.type === "error" ? "alert" : "status"}
                        className={cn(
                          "mt-2 font-store-body text-sm",
                          couponFeedback.type === "success" ? "text-emerald-700" : "text-red-600",
                        )}
                      >
                        {couponFeedback.message}
                      </p>
                    ) : null}
                      </>
                    ) : (
                      <p className="font-store-body text-xs text-[var(--store-muted)]">
                        Coupons can be applied in the secure payment window.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          </div>
          </>
        )}

        <StoreAddressFormModal
          open={showAddressForm}
          onClose={() => setShowAddressForm(false)}
          onSaved={(address) => {
            void reloadAddresses().then(() => setSelectedAddressId(address.id));
          }}
        />
      </StorePageContainer>
    </StorePageShell>
  );
}
