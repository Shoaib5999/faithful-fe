import { ShieldCheck } from "lucide-react";
import { PDP_PAYMENT_METHODS } from "@/constants/product-detail.constants";

function VisaLogo() {
  return (
    <svg viewBox="0 0 48 16" className="h-5 w-auto" aria-hidden>
      <rect width="48" height="16" rx="3" fill="#1A1F71" />
      <text
        x="24"
        y="11.5"
        textAnchor="middle"
        fill="#fff"
        fontSize="7"
        fontWeight="700"
        fontFamily="Arial, sans-serif"
        letterSpacing="0.5"
      >
        VISA
      </text>
    </svg>
  );
}

function MastercardLogo() {
  return (
    <svg viewBox="0 0 36 20" className="h-5 w-auto" aria-hidden>
      <circle cx="14" cy="10" r="8" fill="#EB001B" />
      <circle cx="22" cy="10" r="8" fill="#F79E1B" fillOpacity="0.95" />
    </svg>
  );
}

function RuPayLogo() {
  return (
    <svg viewBox="0 0 52 16" className="h-5 w-auto" aria-hidden>
      <rect width="52" height="16" rx="3" fill="#0B7A43" />
      <text
        x="26"
        y="11"
        textAnchor="middle"
        fill="#fff"
        fontSize="6.5"
        fontWeight="700"
        fontFamily="Arial, sans-serif"
      >
        RuPay
      </text>
    </svg>
  );
}

function UpiLogo() {
  return (
    <svg viewBox="0 0 44 18" className="h-5 w-auto" aria-hidden>
      <rect width="44" height="18" rx="4" fill="#fff" stroke="#E5E7EB" />
      <text
        x="22"
        y="8"
        textAnchor="middle"
        fill="#111827"
        fontSize="5"
        fontWeight="700"
        fontFamily="Arial, sans-serif"
      >
        UPI
      </text>
      <text
        x="22"
        y="13"
        textAnchor="middle"
        fill="#6B7280"
        fontSize="3"
        fontFamily="Arial, sans-serif"
      >
        PAYMENTS
      </text>
    </svg>
  );
}

const LOGO_COMPONENTS = {
  visa: VisaLogo,
  mastercard: MastercardLogo,
  rupay: RuPayLogo,
  upi: UpiLogo,
} as const;

type PaymentMethodId = keyof typeof LOGO_COMPONENTS;

export function ProductDetailPaymentMethods() {
  const methods = PDP_PAYMENT_METHODS.filter(
    (m): m is typeof m & { id: PaymentMethodId } =>
      m.id in LOGO_COMPONENTS
  );

  return (
    <section className="mt-8" aria-label="Accepted payment methods">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="h-4 w-4 text-emerald-600" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Secure payments accepted
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
        <div className="flex flex-nowrap items-stretch gap-px overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {methods.map((method, index) => {
            const Logo = LOGO_COMPONENTS[method.id];
            return (
              <div
                key={method.id}
                title={method.label}
                className={`
                  group flex shrink-0 flex-col items-center justify-center gap-2
                  px-5 py-4 transition-all duration-200
                  hover:bg-neutral-50
                  ${index !== methods.length - 1 ? "border-r border-neutral-100" : ""}
                `}
              >
                <div className="transition-transform duration-200 group-hover:scale-105">
                  <Logo />
                </div>
                <span className="text-[10px] font-medium text-neutral-400 tracking-wide">
                  {method.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="border-t border-neutral-100 bg-neutral-50/60 px-5 py-2.5 flex items-center gap-1.5">
          <ShieldCheck className="h-3 w-3 text-emerald-500 shrink-0" />
          <p className="text-[10.5px] text-neutral-400">
            All transactions are encrypted and securely processed.
          </p>
        </div>
      </div>
    </section>
  );
}