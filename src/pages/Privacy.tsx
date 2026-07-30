import { LegalDocument, type LegalSection } from "@/components/editorial/LegalDocument";
import { STORE_CONTACT_EMAIL, STORE_LOCATION } from "@/constants/storefront.constants";
import { StorePageShell } from "@/components/storefront/StorePageShell";
import { StorePageTitle } from "@/components/storefront/StorePageTitle";

const SECTIONS: LegalSection[] = [
  {
    id: "intro",
    title: "What this notice covers",
    body: [
      "This notice explains what personal data Faithful Meat collects, why we collect it, how we use it, and the rights you have over it.",
      "We collect only what we need to deliver your order, answer your queries, and keep the website working.",
    ],
  },
  {
    id: "data",
    title: "Data we collect",
    body: [
      "Account data: name, email address, password hash, and any addresses you choose to save.",
      "Order data: items purchased, shipping and billing addresses, order value, and a partial payment record (we never see your full card number).",
      "Technical data: IP address, device, browser, and basic interaction logs to keep the site secure and to fix bugs.",
    ],
  },
  {
    id: "use",
    title: "How we use it",
    body: [
      "To fulfil orders, send shipping updates, and answer enquiries.",
      "To improve the site and our products — always in aggregate, never to single out a person.",
      "To send occasional offers and updates, only when you've explicitly asked for one. You can unsubscribe at the bottom of every email.",
    ],
  },
  {
    id: "sharing",
    title: "Sharing",
    body: [
      "We share data only with processors who help us run the business: payment providers, delivery partners, email infrastructure, and analytics. They are bound by contract to use it only for our purposes.",
      "We do not sell your data. Ever.",
    ],
  },
  {
    id: "rights",
    title: "Your rights",
    body: [
      `You have the right to access, correct, export, or delete your data. Write to ${STORE_CONTACT_EMAIL} and we'll act within thirty days.`,
      "You can also withdraw consent for marketing at any time without affecting your account or order history.",
    ],
  },
  {
    id: "retention",
    title: "Retention",
    body: [
      "Order records are kept for seven years to meet tax and accounting obligations.",
      "Marketing data is kept until you unsubscribe.",
      "Technical logs are kept for ninety days.",
    ],
  },
  {
    id: "contact",
    title: "Contact",
    body: [
      `Faithful Meat — ${STORE_LOCATION.address}. Privacy enquiries: ${STORE_CONTACT_EMAIL}.`,
    ],
  },
];

export default function Privacy() {
  return (
    <StorePageShell>
      <StorePageTitle title="Privacy Policy" />
      <LegalDocument sections={SECTIONS} className="font-store-body" />
    </StorePageShell>
  );
}
