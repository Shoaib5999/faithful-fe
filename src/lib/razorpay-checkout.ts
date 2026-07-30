import {
  MAGIC_CHECKOUT_SCRIPT_URL,
  ONLINE_PAYMENT_CHECKOUT_SCRIPT_URL,
  ONLINE_PAYMENT_MERCHANT_NAME,
} from "@/constants/payment.constants";
import type {
  OpenRazorpayCheckoutInput,
  RazorpayCheckoutResult,
} from "@/types/razorpay.types";

const scriptLoadPromises = new Map<string, Promise<boolean>>();
let activeScriptUrl: string | null = null;

const loadCheckoutScript = (scriptUrl: string): Promise<boolean> => {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  if (activeScriptUrl === scriptUrl && window.Razorpay) {
    return Promise.resolve(true);
  }

  const existingPromise = scriptLoadPromises.get(scriptUrl);
  if (existingPromise) {
    return existingPromise;
  }

  const loadPromise = new Promise<boolean>((resolve) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${scriptUrl}"]`,
    );

    const finish = (loaded: boolean) => {
      if (loaded) {
        activeScriptUrl = scriptUrl;
      }
      resolve(loaded);
    };

    if (existingScript) {
      if (window.Razorpay) {
        finish(true);
        return;
      }

      existingScript.addEventListener("load", () => finish(Boolean(window.Razorpay)));
      existingScript.addEventListener("error", () => finish(false));
      return;
    }

    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    script.onload = () => finish(Boolean(window.Razorpay));
    script.onerror = () => finish(false);
    document.body.appendChild(script);
  });

  scriptLoadPromises.set(scriptUrl, loadPromise);
  return loadPromise;
};

function formatContactPhone(phone?: string): string | undefined {
  if (!phone) return undefined;

  const trimmed = phone.trim();
  if (trimmed.startsWith("+")) return trimmed;

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;

  return digits ? `+${digits}` : undefined;
}

function buildMagicPrefill(
  prefill: OpenRazorpayCheckoutInput["prefill"],
  appliedCouponCode?: string,
  appliedCouponDiscountPaise?: number,
) {
  if (!prefill && !appliedCouponCode) return undefined;

  const prediscount =
    appliedCouponCode && appliedCouponDiscountPaise && appliedCouponDiscountPaise > 0
      ? [
          {
            label: `Coupon (${appliedCouponCode})`,
            value: `₹${(appliedCouponDiscountPaise / 100).toLocaleString("en-IN")}`,
          },
        ]
      : undefined;

  return {
    ...prefill,
    contact: formatContactPhone(prefill?.contact),
    ...(prediscount ? { prediscount } : {}),
  };
}

export const openOnlinePaymentCheckout = async (
  input: OpenRazorpayCheckoutInput,
): Promise<RazorpayCheckoutResult> => {
  const isMagic = input.checkoutMode === "magic";
  const scriptUrl = isMagic ? MAGIC_CHECKOUT_SCRIPT_URL : ONLINE_PAYMENT_CHECKOUT_SCRIPT_URL;
  const isLoaded = await loadCheckoutScript(scriptUrl);

  if (!isLoaded || !window.Razorpay) {
    return {
      status: "failed",
      message: "Unable to load payment checkout. Check your connection and try again.",
    };
  }

  const Razorpay = window.Razorpay;

  return new Promise((resolve) => {
    let isSettled = false;

    const settle = (result: RazorpayCheckoutResult) => {
      if (isSettled) return;
      isSettled = true;
      resolve(result);
    };

    const modal = {
      ondismiss: () => {
        settle({ status: "dismissed" });
      },
    };

    const handler = (response: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }) => {
      settle({ status: "success", response });
    };

    const onPaymentFailed = (event: {
      error?: { description?: string; reason?: string };
    }) => {
      const message =
        event.error?.description || event.error?.reason || "Payment failed. Please try again.";

      settle({ status: "failed", message });
    };

    // Razorpay coupon UI calls the merchant URLs configured in Razorpay Dashboard
    // (production), not your local API. Disable in dev unless you tunnel via ngrok.
    const showRazorpayCoupons =
      !input.appliedCouponCode &&
      (import.meta.env.PROD || import.meta.env.VITE_ENABLE_RAZORPAY_COUPONS === "true");

    const checkout = isMagic
      ? new Razorpay({
          key: input.keyId,
          one_click_checkout: true,
          name: input.name ?? ONLINE_PAYMENT_MERCHANT_NAME,
          order_id: input.razorpayOrderId,
          show_coupons: showRazorpayCoupons,
          prefill: buildMagicPrefill(
            input.prefill,
            input.appliedCouponCode,
            input.appliedCouponDiscountPaise,
          ),
          handler,
          modal,
        })
      : new Razorpay({
          key: input.keyId,
          amount: input.amount,
          currency: input.currency,
          name: input.name ?? ONLINE_PAYMENT_MERCHANT_NAME,
          description: input.description,
          order_id: input.razorpayOrderId,
          prefill: input.prefill,
          handler,
          modal,
        });

    checkout.on("payment.failed", onPaymentFailed);
    checkout.open();
  });
};

/** @deprecated Use openOnlinePaymentCheckout */
export const openRazorpayCheckout = openOnlinePaymentCheckout;
