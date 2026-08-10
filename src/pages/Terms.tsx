import { LegalDocument, type LegalSection } from "@/components/editorial/LegalDocument";
import { StorePageShell } from "@/components/storefront/StorePageShell";
import { StorePageTitle } from "@/components/storefront/StorePageTitle";
import { StoreSEO } from "@/components/storefront/StoreSEO";

const SECTIONS: LegalSection[] = [
  {
    id: "acceptance",
    title: "Acceptance of terms",
    body: [
      "By browsing, registering, or purchasing on faithfulmeat.com you agree to these terms in full. If you do not agree, please discontinue use of the site.",
      "These terms may be revised from time to time. The current version always lives at this URL. Material changes are flagged at the top of the page for thirty days.",
    ],
  },
  {
    id: "orders",
    title: "Orders & pricing",
    body: [
      "All orders are subject to acceptance and stock availability. Listing a product on the site does not constitute a binding offer to sell.",
      "Prices are listed in INR and include applicable taxes unless stated otherwise. Delivery charges are calculated at checkout.",
      "We may cancel or refuse any order at our discretion, including but not limited to suspected fraud, pricing errors, or stock issues. Any sums charged will be refunded in full.",
    ],
  },
  {
    id: "shipping",
    title: "Delivery",
    body: [
      "Orders placed before 2PM are eligible for same-day delivery within our service areas; otherwise your order is delivered the next day.",
      "Fresh meat and seafood are perishable and handled cold-chain from our facility to your door. Risk of loss passes to you upon delivery. We are not liable for delays caused by events beyond our reasonable control.",
    ],
  },
  {
    id: "returns",
    title: "Returns & refunds",
    body: [
      "Because our products are fresh and perishable, they cannot be returned once delivered. If an item arrives damaged, spoiled, or incorrect, contact us within twenty-four hours of delivery for a replacement or refund.",
      "See the full Returns & Refund Policy for details.",
    ],
  },
  {
    id: "ip",
    title: "Intellectual property",
    body: [
      "All content on this site — text, photographs, and the Faithful Meat wordmark — is owned by or licensed to Faithful Meat and protected under applicable copyright and trademark law.",
      "You may not reproduce, distribute, or create derivative works without our prior written consent.",
    ],
  },
  {
    id: "liability",
    title: "Liability",
    body: [
      "To the fullest extent permitted by law, Faithful Meat shall not be liable for any indirect, incidental, or consequential losses arising from your use of the site or our products.",
      "Nothing in these terms limits liability for death or personal injury caused by negligence, or for any other liability that cannot be excluded by law.",
    ],
  },
  {
    id: "law",
    title: "Governing law",
    body: [
      "These terms are governed by the laws of India. Any dispute will be subject to the exclusive jurisdiction of the courts having jurisdiction over our registered place of business.",
    ],
  },
];

export default function Terms() {
  return (
    <StorePageShell>
      <StoreSEO
        path="/terms"
        title="Terms & Conditions"
        description="Terms and conditions for ordering fresh chicken, mutton, fish and seafood from Faithful Meat in Daltonganj, Palamu, Jharkhand."
      />
      <StorePageTitle title="Terms & Conditions" />
      <LegalDocument sections={SECTIONS} className="font-store-body" />
    </StorePageShell>
  );
}
