import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Check, CreditCard, Loader2, Plus, ShoppingBag } from "lucide-react";

import { useCartActions } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import type {
  AgentLanguage,
  AgentProductCard,
  AgentProductVariant,
} from "@/services/agent-service";

/**
 * Real catalogue results, rendered as tappable cards instead of the agent
 * describing them in text.
 *
 * This is the direct answer to the two biggest pieces of feedback: a customer
 * having to type "yes", a size, or a quantity back at the agent in words, and
 * the agent's text listing every product/size/price redundantly. Tapping a
 * size adds it immediately — no further confirmation round trip through the
 * model, because the tap itself already is the customer's explicit, specific
 * choice, same as tapping "Add" on a normal product card anywhere else on the
 * site.
 *
 * Once something has been added, the conversation is no longer the fastest
 * route to finishing the order, so the next three real destinations are put
 * on screen directly rather than made to go back through the model.
 *
 * Uses the exact same `addItem` the storefront's own product cards use, which
 * already does the right thing for both a signed-in customer (a real,
 * persisted server-side cart write) and a guest (a local cart line) — nothing
 * new or separately-audited is introduced here.
 */

const INR = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const COPY: Record<
  AgentLanguage,
  { added: string; checkout: string; buyNow: string; explore: string }
> = {
  en: {
    added: "Added to your bag",
    checkout: "Checkout",
    buyNow: "Buy now",
    explore: "Explore",
  },
  hi: {
    added: "आपके बैग में जोड़ा गया",
    checkout: "चेकआउट",
    buyNow: "अभी खरीदें",
    explore: "और देखें",
  },
  hinglish: {
    added: "Aapke bag mein add ho gaya",
    checkout: "Checkout",
    buyNow: "Abhi khareedein",
    explore: "Aur dekhein",
  },
};

type Selection = { product: AgentProductCard; variant: AgentProductVariant };

export function AgentProductCards({
  products,
  language,
  onCheckout,
  onBuyNow,
  onNavigate,
}: {
  products: AgentProductCard[];
  language: AgentLanguage;
  /** Hand over to the cart, with the assistant pointing out what to do next. */
  onCheckout: (selection: Selection) => void;
  /** Skip the cart review and go straight to the checkout page. */
  onBuyNow: (selection: Selection) => void;
  /** Called before any in-app navigation, so the panel gets out of the way. */
  onNavigate: () => void;
}) {
  const { addItem } = useCartActions();
  const [addedIds, setAddedIds] = useState<Set<string>>(() => new Set());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [failedId, setFailedId] = useState<string | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);

  const copy = COPY[language] ?? COPY.en;

  if (products.length === 0) return null;

  const handleAdd = async (product: AgentProductCard, variant: AgentProductVariant) => {
    if (!variant.inStock || busyId === variant.variantId) return;
    setBusyId(variant.variantId);
    setFailedId(null);
    try {
      await addItem(
        {
          variantId: variant.variantId,
          name: product.name,
          image: product.image || "",
          price: INR(variant.price),
          priceNumber: variant.price,
          notes: variant.label,
          ...(product.category ? { categorySlug: product.category } : {}),
        },
        1,
      );
      setAddedIds((prev) => new Set(prev).add(variant.variantId));
      setSelection({ product, variant });
    } catch {
      setFailedId(variant.variantId);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="w-full">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.map((product) => (
          <div
            key={product.slug}
            className="w-[168px] shrink-0 overflow-hidden rounded-xl border border-black/8 bg-white"
          >
            <Link to={`/product/${product.slug}`} onClick={onNavigate} className="block">
              <div className="aspect-square w-full bg-[var(--store-cream)]">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-store-body text-[10px] text-[var(--store-muted)]">
                    No image
                  </div>
                )}
              </div>
              <p className="line-clamp-2 px-2 pt-1.5 font-store-body text-[11.5px] font-semibold leading-tight text-[var(--store-ink)]">
                {product.name}
              </p>
            </Link>

            <div className="flex gap-1.5 overflow-x-auto px-2 pb-2 pt-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {product.variants.map((variant) => {
                const added = addedIds.has(variant.variantId);
                const busy = busyId === variant.variantId;
                const failed = failedId === variant.variantId;

                return (
                  <button
                    key={variant.variantId}
                    type="button"
                    onClick={() => void handleAdd(product, variant)}
                    disabled={!variant.inStock || busy}
                    className={cn(
                      "flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1.5 font-store-body text-[11px] font-semibold transition-colors",
                      !variant.inStock
                        ? "cursor-not-allowed border-black/10 text-[var(--store-muted)] opacity-50"
                        : added
                          ? "border-green-600 bg-green-50 text-green-700"
                          : failed
                            ? "border-red-400 bg-red-50 text-red-700"
                            : "border-[var(--store-red)]/30 bg-white text-[var(--store-ink)] hover:border-[var(--store-red)] hover:bg-[var(--store-red)]/5",
                    )}
                  >
                    {busy ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : added ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Plus className="h-3 w-3" />
                    )}
                    <span>{variant.label}</span>
                    <span className="text-[var(--store-red)]">
                      {!variant.inStock ? "Out of stock" : added ? "Added" : INR(variant.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selection && (
        <div className="mt-2 rounded-xl border border-[var(--store-red)]/20 bg-white p-2.5">
          <p className="flex items-center gap-1.5 font-store-body text-[11.5px] font-semibold text-green-700">
            <Check className="h-3.5 w-3.5 shrink-0" />
            <span className="min-w-0 truncate">
              {copy.added} · {selection.product.name} {selection.variant.label}
            </span>
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => onCheckout(selection)}
              className="flex items-center gap-1.5 rounded-full bg-[var(--store-red)] px-3 py-1.5 font-store-body text-[11.5px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              {copy.checkout}
            </button>

            <button
              type="button"
              onClick={() => onBuyNow(selection)}
              className="flex items-center gap-1.5 rounded-full border border-[var(--store-red)]/40 px-3 py-1.5 font-store-body text-[11.5px] font-semibold text-[var(--store-red)] transition-colors hover:bg-[var(--store-red)]/5"
            >
              <CreditCard className="h-3.5 w-3.5" />
              {copy.buyNow}
            </button>

            <Link
              to={`/product/${selection.product.slug}`}
              onClick={onNavigate}
              className="flex items-center gap-1 rounded-full px-2.5 py-1.5 font-store-body text-[11.5px] font-semibold text-[var(--store-muted)] transition-colors hover:text-[var(--store-red)]"
            >
              {copy.explore}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
