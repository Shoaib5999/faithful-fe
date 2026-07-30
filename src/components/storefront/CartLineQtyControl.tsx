import { Minus, Plus } from "lucide-react";

type CartLineQtyControlProps = {
  qty: number;
  onQtyChange: (qty: number) => void;
  maxQty?: number;
};

export function CartLineQtyControl({
  qty,
  onQtyChange,
  maxQty = 99,
}: CartLineQtyControlProps) {
  return (
    <div className="inline-flex items-center rounded-md border border-black/15 bg-white">
      <button
        type="button"
        onClick={() => onQtyChange(qty - 1)}
        className="px-2.5 py-1.5 text-[#6b6b6b] transition-colors hover:text-[#1a1a1a] disabled:opacity-40"
        aria-label="Decrease quantity"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="min-w-[2rem] border-x border-black/15 px-2 text-center font-store-body text-xs font-semibold text-[#1a1a1a]">
        {qty}
      </span>
      <button
        type="button"
        onClick={() => onQtyChange(Math.min(maxQty, qty + 1))}
        disabled={qty >= maxQty}
        className="px-2.5 py-1.5 text-[#6b6b6b] transition-colors hover:text-[#1a1a1a] disabled:opacity-40"
        aria-label="Increase quantity"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
