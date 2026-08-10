import { Link } from "react-router-dom";
import { LegalDocument, type LegalSection } from "@/components/editorial/LegalDocument";
import { StorePageShell } from "@/components/storefront/StorePageShell";
import { StorePageTitle } from "@/components/storefront/StorePageTitle";
import { StoreSEO } from "@/components/storefront/StoreSEO";
import { storeContainerClass, storePageBottomClass } from "@/components/storefront/storefront-ui";
import { cn } from "@/lib/utils";

const SECTIONS: LegalSection[] = [
  {
    id: "why-no-returns",
    title: "Why fresh orders can't be returned",
    body: [
      "For hygiene and food-safety reasons, fresh meat, fish, seafood, and eggs cannot be returned once delivered — even if unopened.",
      "Instead, we guarantee a replacement or full refund for anything that arrives damaged, spoiled, short-weight, or incorrect.",
    ],
  },
  {
    id: "damaged",
    title: "If something's wrong with your order",
    body: [
      "Inspect your order as soon as it arrives. If anything is damaged, appears spoiled, is missing, or doesn't match what you ordered, contact us within twenty-four hours of delivery with your order number and a photograph.",
      "We will arrange a free replacement or a full refund — whichever you prefer — at no extra cost.",
    ],
  },
  {
    id: "delivery",
    title: "Delivery",
    body: [
      "Orders placed before 2PM are eligible for same-day delivery within our service areas; otherwise your order is delivered the next day.",
      "Risk of loss passes to you upon delivery. Please be available to receive cold-chain deliveries promptly.",
    ],
  },
  {
    id: "refund",
    title: "Refunds",
    body: [
      "Approved refunds are processed to your original payment method within five to seven working days.",
    ],
  },
  {
    id: "cancellations",
    title: "Cancellations",
    body: [
      "Orders can be cancelled free of charge before they're dispatched for preparation. Once a cut has been prepared and packed, it can no longer be cancelled.",
    ],
  },
];

export default function Returns() {
  return (
    <StorePageShell>
      <StoreSEO
        path="/returns"
        title="Return & Refund Policy"
        description="Faithful Meat's return and refund policy for fresh chicken, mutton, fish and seafood orders delivered in Daltonganj, Palamu, Jharkhand."
      />
      <StorePageTitle title="Return & Refund Policy" />
      <LegalDocument sections={SECTIONS} className="font-store-body" />
      <div className={cn(storeContainerClass, storePageBottomClass, "max-w-3xl pt-0")}>
        <p className="font-store-body text-sm text-[#6b6b6b]">
          Still unsure?{" "}
          <Link to="/contact" className="text-[var(--store-red)] underline-offset-2 hover:underline">
            Contact us
          </Link>
        </p>
      </div>
    </StorePageShell>
  );
}
