import { useRef, useState, type ComponentType, type FormEvent } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import {
  Mail,
  MapPin,
  Clock,
  Phone,
  ChevronDown,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  ContactSubjectMenu,
  type ContactSubjectId,
} from "@/components/storefront/ContactSubjectMenu";
import { StorePageShell } from "@/components/storefront/StorePageShell";
import { StorePageTitle } from "@/components/storefront/StorePageTitle";
import { StoreSEO } from "@/components/storefront/StoreSEO";
import { RevealText } from "@/components/storefront/motion/RevealText";
import { RevealWordTitle } from "@/components/storefront/motion/RevealWordTitle";
import { useGsapStaggerReveal } from "@/components/storefront/motion/useGsapStaggerReveal";
import {
  StoreFormLabel,
  StoreInput,
  StorePageContainer,
  StorePrimaryButton,
  StoreTextarea,
  storePanelClass,
} from "@/components/storefront/storefront-ui";
import { CONTACT_FAQS, STORE_LOCATION } from "@/constants/storefront.constants";
import { validateStoreEmail } from "@/lib/store-auth";
import { cn } from "@/lib/utils";
import { submitContactForm } from "@/services/store-contact-service";

const CHANNELS = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@faithfulmeat.com",
    href: "mailto:hello@faithfulmeat.com",
    hint: "We reply within two working days",
  },
  {
    icon: Phone,
    label: "Call",
    value: STORE_LOCATION.phoneDisplay,
    href: `tel:${STORE_LOCATION.phoneTel}`,
    hint: "Speak with our boutique team",
  },
  {
    icon: MapPin,
    label: "Address",
    value: "Mira Road East, Maharashtra",
    href: STORE_LOCATION.mapsUrl,
    hint: STORE_LOCATION.address,
  },
  {
    icon: Clock,
    label: "Timings",
    value: STORE_LOCATION.hours,
    href: "#contact-faqs",
    hint: "Walk-ins welcome — no appointment needed",
  },
] as const;

const channelContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const channelItemVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

function ContactChannelCard({
  icon: Icon,
  label,
  value,
  href,
  hint,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  href: string;
  hint: string;
}) {
  const isExternal = href.startsWith("http");
  const isAnchor = href.startsWith("#");

  const content = (
    <>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[var(--store-red)]/30 bg-[var(--store-cream)]/60 text-[var(--store-red)] transition-all duration-300 group-hover:border-[var(--store-red)] group-hover:bg-[var(--store-red)]/10">
        <Icon className="h-5 w-5" strokeWidth={1.25} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <p className="font-store-body text-[9px] font-semibold uppercase tracking-[0.28em] text-[var(--store-muted)]">
          {label}
        </p>
        <p className="mt-1.5 font-display text-lg tracking-wide text-[var(--store-ink)] transition-colors group-hover:text-[var(--store-red)]">
          {value}
        </p>
        <p className="mt-2 font-store-body text-xs leading-relaxed text-[var(--store-muted)] line-clamp-2">
          {hint}
        </p>
      </span>
      <span
        className="mt-1 h-px w-0 self-end bg-[var(--store-red)] transition-all duration-500 group-hover:w-8"
        aria-hidden
      />
    </>
  );

  const className =
    "group store-card-hover flex gap-4 rounded-lg border border-black/8 bg-white p-5 shadow-[var(--store-shadow-sm)] transition-[transform,box-shadow,border-color] duration-300 hover:border-[var(--store-red)]/25 md:p-6";

  if (isAnchor) {
    return (
      <a href={href} className={className}>
        {content}
      </a>
    );
  }

  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={className}
    >
      {content}
    </a>
  );
}

function ContactSuccessPanel({ message }: { message: string | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        storePanelClass,
        "flex flex-col items-center bg-[var(--store-cream)]/40 px-8 py-20 text-center md:py-24",
      )}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 16 }}
      >
        <CheckCircle2 className="h-14 w-14 text-[var(--store-red)]" strokeWidth={1.25} aria-hidden />
      </motion.div>
      <p className="mt-6 font-display text-2xl tracking-wide text-[var(--store-ink)]">
        Thank you for reaching out
      </p>
      <p className="mx-auto mt-3 max-w-sm font-store-body text-sm leading-relaxed text-[var(--store-muted)]">
        {message ?? "Our team will respond within two working days."}
      </p>
    </motion.div>
  );
}

function ContactFaqSection() {
  const [openId, setOpenId] = useState<string | null>(CONTACT_FAQS[0]?.id ?? null);
  const faqRef = useGsapStaggerReveal<HTMLDivElement>({ selector: "[data-faq]" });

  return (
    <section
      id="contact-faqs"
      className="w-full border-t border-black/8 bg-[var(--store-cream)] py-16 md:py-24"
      aria-labelledby="contact-faq-heading"
    >
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 xl:px-16">
        <header className="mb-10 max-w-xl md:mb-12">
          <RevealText
            variant="eyebrow"
            className="font-store-body text-[9px] uppercase tracking-[0.42em] text-[var(--store-red)]"
          >
            Common questions
          </RevealText>
          <RevealWordTitle
            as="h2"
            id="contact-faq-heading"
            className="mt-2 font-display text-[clamp(1.5rem,3.5vw,2.5rem)] font-normal leading-[1.06] tracking-wide text-[var(--store-ink)]"
          >
            Before you write
          </RevealWordTitle>
        </header>

        <div ref={faqRef} className="mx-auto max-w-3xl divide-y divide-black/10 rounded-lg border border-black/8 bg-white shadow-[var(--store-shadow-sm)]">
          {CONTACT_FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div key={faq.id} data-faq>
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-[var(--store-cream)]/40 md:px-7"
                  aria-expanded={isOpen}
                >
                  <span className="font-store-body text-sm font-semibold text-[var(--store-ink)] md:text-[15px]">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-[var(--store-red)] transition-transform duration-300",
                      isOpen && "rotate-180",
                    )}
                    aria-hidden
                  />
                </button>
                {isOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p className="px-5 pb-5 font-store-body text-sm leading-[1.8] text-[var(--store-muted)] md:px-7 md:pb-6">
                      {faq.answer}
                    </p>
                  </motion.div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "general" as ContactSubjectId,
    message: "",
  });

  const channelsRef = useRef<HTMLDivElement>(null);
  const channelsInView = useInView(channelsRef, { once: true, margin: "-10%" });

  const whatsappUrl = `https://wa.me/${STORE_LOCATION.phoneTel.replace(/\D/g, "")}?text=${encodeURIComponent("Hello! I have a question about my order.")}`;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    const emailError = validateStoreEmail(form.email, true);
    if (emailError) {
      setFormError(emailError);
      return;
    }

    if (!form.name.trim() || !form.message.trim()) {
      setFormError("Please fill in your name and message.");
      return;
    }

    setIsSubmitting(true);

    try {
      const message = await submitContactForm(form);
      setSuccessMessage(message);
      setSent(true);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Could not send your message. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StorePageShell>
      <StoreSEO
        path="/contact"
        title="Contact Us"
        description="Reach Faithful Meat in Daltonganj, Palamu, Jharkhand — call, WhatsApp or visit us at Bairia Chowk for fresh chicken, mutton, fish and seafood delivery."
      />
      <StorePageTitle title="Contact Us" eyebrow="We are here for you" />

      <section className="w-full bg-white py-12 md:py-16">
        <StorePageContainer>
          <div className="mx-auto max-w-3xl text-center">
            <RevealText
              variant="eyebrow"
              className="font-store-body text-[9px] uppercase tracking-[0.42em] text-[var(--store-red)]"
            >
              Get in touch
            </RevealText>
            <RevealWordTitle
              as="h2"
              className="mt-2 font-display text-[clamp(1.75rem,4vw,3rem)] font-normal leading-[1.06] tracking-wide text-[var(--store-ink)]"
            >
              We would love to hear from you
            </RevealWordTitle>
            <RevealText delay={100} className="mt-5 font-store-body text-[15px] leading-[1.85] text-[var(--store-muted)]">
              Questions about an order, a delivery, or a product? Reach out — our team
              responds with care and clarity.
            </RevealText>
          </div>
        </StorePageContainer>
      </section>

      <section className="w-full bg-white pb-16 md:pb-20">
        <StorePageContainer>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
            <div ref={channelsRef} className="lg:col-span-5">
              <motion.ul
                variants={channelContainerVariants}
                initial="hidden"
                animate={channelsInView ? "visible" : "hidden"}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:gap-5"
              >
                {CHANNELS.map((channel) => (
                  <motion.li key={channel.label} variants={channelItemVariants}>
                    <ContactChannelCard {...channel} />
                  </motion.li>
                ))}
              </motion.ul>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="store-btn-press inline-flex items-center gap-2 rounded-md border border-[#25D366]/40 bg-[#25D366]/10 px-5 py-2.5 font-store-body text-xs font-semibold uppercase tracking-[0.12em] text-[#1a6b42] transition-[transform,opacity,background-color] duration-300 hover:bg-[#25D366]/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  WhatsApp us
                </a>
                <Link
                  to="/returns"
                  className="inline-flex items-center rounded-md border border-black/12 px-5 py-2.5 font-store-body text-xs font-semibold uppercase tracking-[0.12em] text-[var(--store-muted)] transition-colors hover:border-[var(--store-red)]/40 hover:text-[var(--store-ink)]"
                >
                  Return policy
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              {sent ? (
                <ContactSuccessPanel message={successMessage} />
              ) : (
                <motion.form
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  onSubmit={handleSubmit}
                  className={cn(
                    storePanelClass,
                    "relative overflow-hidden p-6 md:p-8 lg:p-10",
                  )}
                >
                  <div
                    className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[var(--store-red)]/8 blur-3xl"
                    aria-hidden
                  />

                  <div className="relative">
                    <p className="font-store-body text-[9px] font-semibold uppercase tracking-[0.28em] text-[var(--store-red)]">
                      Send a message
                    </p>
                    <p className="mt-2 font-display text-xl tracking-wide text-[var(--store-ink)] md:text-2xl">
                      Tell us how we can help
                    </p>
                  </div>

                  {formError ? (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative mt-6 rounded-md bg-[#fef2f2] px-4 py-3 font-store-body text-sm text-[#c45c5c]"
                      role="alert"
                    >
                      {formError}
                    </motion.p>
                  ) : null}

                  <div className="relative mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <label className="block">
                      <StoreFormLabel className="block">Name</StoreFormLabel>
                      <StoreInput
                        required
                        placeholder="Your full name"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        className="mt-2"
                      />
                    </label>
                    <label className="block">
                      <StoreFormLabel className="block">Email</StoreFormLabel>
                      <StoreInput
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        className="mt-2"
                      />
                    </label>
                  </div>

                  <div className="relative mt-6 block">
                    <StoreFormLabel className="block">Subject</StoreFormLabel>
                    <ContactSubjectMenu
                      value={form.subject}
                      onChange={(subject) => setForm((f) => ({ ...f, subject }))}
                    />
                  </div>

                  <label className="relative mt-6 block">
                    <StoreFormLabel className="block">Message</StoreFormLabel>
                    <StoreTextarea
                      required
                      rows={5}
                      placeholder="How can we help you?"
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      className="mt-2"
                    />
                  </label>

                  <StorePrimaryButton
                    type="submit"
                    disabled={isSubmitting}
                    className="relative mt-8 w-full py-3.5 sm:w-auto sm:px-14"
                  >
                    {isSubmitting ? "Sending…" : "Send message"}
                  </StorePrimaryButton>
                </motion.form>
              )}
            </div>
          </div>
        </StorePageContainer>
      </section>

      <ContactFaqSection />
    </StorePageShell>
  );
}
