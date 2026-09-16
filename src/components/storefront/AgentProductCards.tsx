import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Loader2, Plus } from "lucide-react";

import { useCartActions } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import type { AgentProductCard, AgentProductVariant } from "@/services/agent-service";

/**
 * Real catalogue results, rendered as tappable cards instead of the agent
 * describing them in text.
 *
 * This is the direct answer to the two biggest pieces of feedback: a customer
 * having to type "yes", a size, or a quantity back at the agent in words, and
 * the agent's text listing every product/size/price redundantly. Tapping a
 * size here adds it immediately — no further confirmation round trip through
 * the model, because the tap itself already is the customer's explicit,
 * specific choice, same as tapping "Add" on a normal product card anywhere
 * else on the site.
 *
 * Uses the exact same `addItem` the storefront's own product cards use, which
 * already does the right thing for both a signed-in customer (a real,
 * persisted server-side cart write) and a guest (a local cart line) — nothing
 * new or separately-audited is introduced here.
 */

const INR = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

function VariantButton({
  product,
  variant,
  onAdded,
}: {
  product: AgentProductCard;
  variant: AgentProductVariant;
  onAdded: () => void;
}) {
  const { addItem } = useCartActions();
  const [state, setState] = useState<"idle" | "adding" | "added" | "failed">("idle");

  const handleAdd = async () => {
    if (state === "adding" || !variant.inStock) return;
    setState("adding");
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
      setState("added");
      onAdded();
    } catch {
      setState("failed");
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleAdd()}
      disabled={!variant.inStock || state === "adding"}
      className={cn(
        "flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1.5 font-store-body text-[11px] font-semibold transition-colors",
        !variant.inStock
          ? "cursor-not-allowed border-black/10 text-[var(--store-muted)] opacity-50"
          : state === "added"
            ? "border-green-600 bg-green-50 text-green-700"
            : state === "failed"
              ? "border-red-400 bg-red-50 text-red-700"
              : "border-[var(--store-red)]/30 bg-white text-[var(--store-ink)] hover:border-[var(--store-red)] hover:bg-[var(--store-red)]/5",
      )}
    >
      {state === "adding" ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : state === "added" ? (
        <Check className="h-3 w-3" />
      ) : (
        <Plus className="h-3 w-3" />
      )}
      <span>{variant.label}</span>
      <span className="text-[var(--store-red)]">
        {!variant.inStock ? "Out of stock" : state === "added" ? "Added" : INR(variant.price)}
      </span>
    </button>
  );
}

function ProductCard({
  product,
  onAdded,
  onNavigate,
}: {
  product: AgentProductCard;
  onAdded: () => void;
  onNavigate: () => void;
}) {
  return (
    <div className="w-[168px] shrink-0 overflow-hidden rounded-xl border border-black/8 bg-white">
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
        {product.variants.map((variant) => (
          <VariantButton
            key={variant.variantId}
            product={product}
            variant={variant}
            onAdded={onAdded}
          />
        ))}
      </div>
    </div>
  );
}

export function AgentProductCards({
  products,
  onAdded,
  onNavigate,
}: {
  products: AgentProductCard[];
  onAdded: () => void;
  onNavigate: () => void;
}) {
  if (products.length === 0) return null;

  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {products.map((product) => (
        <ProductCard
          key={product.slug}
          product={product}
          onAdded={onAdded}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}
