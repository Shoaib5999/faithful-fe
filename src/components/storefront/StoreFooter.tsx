import { useEffect, useRef, useState, type FormEvent } from "react";
import { Facebook, Instagram } from "lucide-react";
import { FooterNavLink } from "@/components/storefront/FooterNavLink";
import { StoreLogo } from "@/components/storefront/StoreLogo";
import { validateStoreEmail } from "@/lib/store-auth";
import { subscribeNewsletter } from "@/services/store-newsletter-service";
import { ensureGsapPlugins, gsap } from "@/components/storefront/motion/gsap";
import {
  FOOTER_CUSTOMER_SERVICE_LINKS,
  FOOTER_INFORMATION_LINKS,
  FOOTER_LEGAL_LINKS,
  FOOTER_NEWSLETTER,
  FOOTER_QUICK_LINKS,
  SOCIAL_LINKS,
} from "@/constants/storefront.constants";
import { StoreHomeSection, type StoreSectionTheme } from "@/components/storefront/StoreHomeSection";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const SOCIAL_ICON = {
  instagram: Instagram,
  facebook: Facebook,
  whatsapp: WhatsAppIcon,
} as const;

const LINK_COLUMNS = [
  { title: "Legal", links: FOOTER_LEGAL_LINKS },
  { title: "Support", links: FOOTER_CUSTOMER_SERVICE_LINKS },
  { title: "Info", links: FOOTER_INFORMATION_LINKS },
  { title: "Explore", links: FOOTER_QUICK_LINKS },
] as const;

function UnderlineInput({
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  disabled,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <input
      id={id}
      type={type}
      required={required}
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border-0 border-b border-[var(--section-border)] bg-transparent pb-2.5 font-store-body text-base text-[var(--section-fg)] outline-none placeholder:text-[var(--section-fg-muted)] focus:border-[var(--section-fg)] transition-colors duration-300"
    />
  );
}

type StoreFooterProps = {
  theme?: StoreSectionTheme;
};

export function StoreFooter(_props: StoreFooterProps = {}) {
  const year = new Date().getFullYear();
  const footerRef = useRef<HTMLElement>(null);
  const logoWrapRef = useRef<HTMLDivElement>(null);
  const positioningRef = useRef<HTMLParagraphElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const emailError = validateStoreEmail(email, true);
    if (emailError) {
      setError(emailError);
      return;
    }
    setIsSubmitting(true);
    try {
      const message = await subscribeNewsletter(email);
      setSuccess(message);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not subscribe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    ensureGsapPlugins();

    const ctx = gsap.context(() => {
      const watermark = logoWrapRef.current?.querySelector("img");
      if (watermark) {
        gsap.fromTo(
          watermark,
          { opacity: 0.025, scale: 1.15, y: 24 },
          {
            opacity: 0.6,
            scale: 1,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: footer,
              start: "top 90%",
              end: "top 15%",
              scrub: 2,
            },
          },
        );
      }

      if (positioningRef.current) {
        gsap.fromTo(
          positioningRef.current,
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "expo.out",
            scrollTrigger: {
              trigger: footer,
              start: "top 78%",
            },
          },
        );
      }

      if (ruleRef.current) {
        gsap.fromTo(
          ruleRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.4,
            ease: "expo.inOut",
            transformOrigin: "left",
            scrollTrigger: {
              trigger: ruleRef.current,
              start: "top 88%",
            },
          },
        );
      }

      if (linksRef.current) {
        const cols = linksRef.current.querySelectorAll(".link-col");
        gsap.fromTo(
          cols,
          { y: 18, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.08,
            ease: "expo.out",
            scrollTrigger: {
              trigger: linksRef.current,
              start: "top 88%",
            },
          },
        );
      }

      if (bottomRef.current) {
        gsap.fromTo(
          bottomRef.current,
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "expo.out",
            scrollTrigger: {
              trigger: bottomRef.current,
              start: "top 95%",
            },
          },
        );
      }
    }, footer);

    return () => ctx.revert();
  }, []);

  return (
    <StoreHomeSection
      ref={footerRef}
      as="footer"
      theme="dark"
      compact
      className="store-footer-dark overflow-hidden pt-6 pb-14 sm:pt-8 sm:pb-16"
      aria-label="Site footer"
    >
      <div
        ref={logoWrapRef}
        className="pointer-events-none absolute inset-0 bottom-5  flex items-center justify-center overflow-hidden"
        aria-hidden
      />

      <div className="relative z-[1] mx-auto w-full max-w-[1440px] px-5 pt-2 sm:px-8 sm:pt-3 md:px-12 md:pt-4 lg:px-16">
        <div className="flex justify-center">
          <StoreLogo variant="light" size="lg" />
        </div>

        <div
          ref={linksRef}
          className="relative mt-12 grid grid-cols-2 gap-x-8 gap-y-9 sm:mt-14 sm:gap-x-10 md:grid-cols-4 md:gap-y-0 lg:mt-16"
        >
          {LINK_COLUMNS.map(({ title, links }, index) => (
            <div key={title} className={`link-col ${index > 0 ? "md:pl-8 lg:pl-10" : ""}`}>
              <p className="mb-4 font-store-body text-sm font-semibold uppercase tracking-[0.22em] text-[var(--section-fg-muted)]">
                {title}
              </p>
              <ul className="space-y-2.5 sm:space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    {"href" in link ? (
                      <FooterNavLink
                        label={link.label}
                        href={(link as { href: string }).href}
                        external={(link as { external?: boolean }).external}
                      />
                    ) : (
                      <FooterNavLink label={link.label} to={(link as { to: string }).to} />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="relative mt-8 h-px w-full bg-[var(--section-border)] sm:mt-10 md:mt-12"
          aria-hidden
        />

        <div
          ref={bottomRef}
          className="relative mt-6 flex flex-col gap-6 opacity-0 sm:mt-8 sm:gap-7 lg:mt-10 lg:flex-row lg:items-end lg:justify-between lg:gap-6"
        >
          <div className="min-w-0 flex-1 lg:max-w-md">
            <p className="mb-1 font-store-body text-sm font-medium uppercase tracking-[0.24em] text-[var(--section-fg-muted)]">
              Newsletter
            </p>
            <p className="mb-4 max-w-sm font-store-body text-base leading-relaxed text-[var(--section-fg-muted)] sm:mb-5">
              {FOOTER_NEWSLETTER.subtitle}
            </p>
            {error && (
              <p className="mb-2 font-store-body text-sm text-red-200" role="alert">
                {error}
              </p>
            )}
            {success && (
              <p
                className="mb-2 font-store-body text-sm text-[var(--section-fg)]"
                role="status"
              >
                {success}
              </p>
            )}
            <form onSubmit={handleSubmit} className="flex items-end gap-4 sm:gap-5">
              <div className="min-w-0 flex-1">
                <label htmlFor="footer-email" className="sr-only">
                  {FOOTER_NEWSLETTER.placeholder}
                </label>
                <UnderlineInput
                  id="footer-email"
                  type="email"
                  required
                  value={email}
                  onChange={setEmail}
                  placeholder={FOOTER_NEWSLETTER.placeholder}
                  disabled={isSubmitting}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="shrink-0 border-b border-[var(--section-fg)] pb-2.5 font-store-body text-sm font-medium uppercase tracking-[0.16em] text-[var(--section-fg)] transition-opacity hover:opacity-60 disabled:opacity-40"
              >
                {isSubmitting ? "…" : "Subscribe →"}
              </button>
            </form>
          </div>

          <div className="flex items-center justify-center gap-2.5 sm:gap-3 lg:justify-center">
            {SOCIAL_LINKS.map((social) => {
              const Icon = SOCIAL_ICON[social.id as keyof typeof SOCIAL_ICON] ?? Instagram;
              return (
                <a
                  key={social.id}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-[var(--section-fg-muted)] transition-colors duration-300 hover:border-white hover:text-white sm:h-10 sm:w-10"
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </a>
              );
            })}
          </div>

          <p className="shrink-0 text-center font-store-body text-sm uppercase tracking-[0.14em] text-[var(--section-fg-muted)] lg:text-right">
            © {year} Faithful Meat.
            <span className="hidden sm:inline"> </span>
            <br className="sm:hidden" />
            All rights reserved.
          </p>
        </div>
      </div>
    </StoreHomeSection>
  );
}
