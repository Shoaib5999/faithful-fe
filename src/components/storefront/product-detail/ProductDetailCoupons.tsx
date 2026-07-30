import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Loader2, Tag, X } from "lucide-react";
import { setPendingCouponCode } from "@/constants/store-coupon.constants";
import { fetchPublicActiveCoupons } from "@/services/store-coupon-service";
import { cn } from "@/lib/utils";

export function ProductDetailCoupons() {
  const [isOpen, setIsOpen] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["public-active-coupons"],
    queryFn: fetchPublicActiveCoupons,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (appliedCode) {
      setPendingCouponCode(appliedCode);
    }
  }, [appliedCode]);

  const handleApply = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    const match = coupons.find((c) => c.code.toUpperCase() === trimmed);
    if (!match) {
      setApplyError("This coupon code is not valid or has expired.");
      setAppliedCode(null);
      setPendingCouponCode(null);
      return;
    }

    setApplyError(null);
    setCouponInput(match.code);
    setAppliedCode(match.code);
    setPendingCouponCode(match.code);
  };

  const handleRemove = () => {
    setAppliedCode(null);
    setCouponInput("");
    setApplyError(null);
    setPendingCouponCode(null);
  };

  return (
    <section className="mt-6 border border-[#e8dfd0] bg-[#fffdf8]">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 font-store-body text-xs font-semibold uppercase tracking-[0.12em] text-[#1a1a1a]">
          <Tag className="h-4 w-4 text-[#b8954a]" />
          Coupons & offers
        </span>
        <ChevronDown
          className={cn("h-4 w-4 text-[#b8954a] transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <div className="border-t border-[#e8dfd0] px-4 pb-4 pt-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => {
                setCouponInput(e.target.value);
                setApplyError(null);
              }}
              placeholder="Enter coupon code"
              className="min-w-0 flex-1 border border-black/15 bg-white px-3 py-2 font-store-body text-sm outline-none focus:border-[#b8954a]"
            />
            <button
              type="button"
              onClick={() => handleApply(couponInput)}
              className="shrink-0 cursor-pointer bg-[#1a1a1a] px-4 py-2 font-store-body text-[11px] font-semibold uppercase tracking-wider text-white"
            >
              Apply
            </button>
          </div>

          {appliedCode && !applyError && (
            <div className="mt-2 flex items-center justify-between rounded-md border border-green-200 bg-green-50 px-3 py-2">
              <p className="font-store-body text-xs text-green-800">
                Coupon <span className="font-semibold">{appliedCode}</span> will be applied at
                checkout when you are signed in.
              </p>
              <button
                type="button"
                onClick={handleRemove}
                className="ml-2 cursor-pointer text-green-600 hover:text-green-800"
                aria-label="Remove coupon"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {applyError && (
            <p className="mt-2 font-store-body text-xs text-[#c45c5c]">{applyError}</p>
          )}

          {isLoading && (
            <div className="mt-3 flex justify-center py-4 text-[#6b6b6b]">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}

          {!isLoading && coupons.length === 0 && (
            <p className="mt-3 font-store-body text-xs text-[#6b6b6b]">
              No active coupons at the moment.
            </p>
          )}

          {!isLoading && coupons.length > 0 && (
            <ul className="mt-3 space-y-2">
              {coupons.map((coupon) => (
                <li
                  key={coupon.id}
                  className="flex items-start justify-between gap-2 border border-dashed border-[#b8954a]/50 bg-white px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="font-store-body text-xs font-semibold text-[#1a1a1a]">
                      {coupon.description}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleApply(coupon.code)}
                      className="mt-1.5 cursor-pointer font-store-body text-[11px] font-semibold text-[#b8954a] underline underline-offset-2"
                    >
                      Use code: {coupon.code}
                    </button>
                  </div>
                  {appliedCode === coupon.code && (
                    <span className="shrink-0 rounded-sm bg-[#e8f5ec] px-1.5 py-0.5 font-store-body text-[9px] font-medium text-[#2d8a4e]">
                      Selected
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
