import { useEffect, useRef } from "react";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { FooterNavLink } from "@/components/storefront/FooterNavLink";
import { StoreLogo } from "@/components/storefront/StoreLogo";
import { ensureGsapPlugins, gsap } from "@/components/storefront/motion/gsap";
import {
  FOOTER_CATEGORY_LINKS,
  FOOTER_MAIN_LINKS,
  SOCIAL_LINKS,
  STORE_CONTACT_EMAIL,
  STORE_LOCATION,
} from "@/constants/storefront.constants";
import { StoreHomeSection } from "@/components/storefront/StoreHomeSection";

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

function FooterColumnTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 font-store-body text-sm font-bold uppercase tracking-[0.18em] text-white">
      {children}
    </p>
  );
}

export function StoreFooter() {
  const year = new Date().getFullYear();
  const footerRef = useRef<HTMLElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    ensureGsapPlugins();

    const ctx = gsap.context(() => {
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
    }, footer);

    return () => ctx.revert();
  }, []);

  return (
    <StoreHomeSection
      ref={footerRef}
      as="footer"
      theme="dark"
      compact
      className="store-footer-dark overflow-hidden pt-12 pb-0"
      aria-label="Site footer"
    >
      <div className="relative z-[1] mx-auto w-full max-w-[1440px] px-5 sm:px-8 md:px-12 lg:px-16">
        <div
          ref={linksRef}
          className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] lg:gap-x-8"
        >
          <div className="link-col col-span-2 sm:col-span-3 lg:col-span-1">
            <StoreLogo variant="light" size="lg" tagline />
            <p className="mt-4 max-w-xs font-store-body text-sm leading-relaxed text-white/60">
              Faithful Meat is your trusted source for 100% fresh, hygienic &amp; premium quality
              meat and fish.
            </p>
          </div>

          <div className="link-col">
            <FooterColumnTitle>Quick Links</FooterColumnTitle>
            <ul className="space-y-2.5">
              {FOOTER_MAIN_LINKS.map((link) => (
                <li key={link.label}>
                  <FooterNavLink label={link.label} to={link.to} />
                </li>
              ))}
            </ul>
          </div>

          <div className="link-col">
            <FooterColumnTitle>Categories</FooterColumnTitle>
            <ul className="space-y-2.5">
              {FOOTER_CATEGORY_LINKS.map((link) => (
                <li key={link.label}>
                  <FooterNavLink label={link.label} to={link.to} />
                </li>
              ))}
            </ul>
          </div>

          <div className="link-col">
            <FooterColumnTitle>We Deliver</FooterColumnTitle>
            <p className="mb-2 font-store-body text-sm font-semibold text-white">
              At Your Doorstep
            </p>
            <a
              href={STORE_LOCATION.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-2 font-store-body text-sm leading-relaxed text-white/60 transition-colors duration-300 hover:text-white"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--store-red)]" aria-hidden />
              {STORE_LOCATION.address}
            </a>
          </div>

          <div className="link-col">
            <FooterColumnTitle>Contact Us</FooterColumnTitle>
            <ul className="space-y-2.5">
              <li>
                <a
                  href={`tel:${STORE_LOCATION.phoneTel}`}
                  className="flex items-center gap-2 font-store-body text-sm text-white/60 transition-colors duration-300 hover:text-white"
                >
                  <Phone className="h-4 w-4 shrink-0 text-[var(--store-red)]" aria-hidden />
                  {STORE_LOCATION.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${STORE_LOCATION.phoneTel.replace("+", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-store-body text-sm text-white/60 transition-colors duration-300 hover:text-white"
                >
                  <WhatsAppIcon className="h-4 w-4 shrink-0 text-[var(--store-red)]" />
                  {STORE_LOCATION.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${STORE_CONTACT_EMAIL}`}
                  className="flex items-center gap-2 font-store-body text-sm text-white/60 transition-colors duration-300 hover:text-white"
                >
                  <Mail className="h-4 w-4 shrink-0 text-[var(--store-red)]" aria-hidden />
                  {STORE_CONTACT_EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="relative z-[1] mt-10 w-full bg-[var(--store-red)] py-4">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-3 px-5 text-center sm:flex-row sm:px-8 sm:text-left md:px-12 lg:px-16">
          <p className="font-store-body text-xs uppercase tracking-[0.1em] text-white">
            &copy; {year} Faithful Meat. All Rights Reserved.
            <span className="hidden sm:inline">
              {" "}
              &nbsp;|&nbsp; Fresh Meat &amp; Fish Delivered To Your Doorstep
            </span>
          </p>

          <div className="flex items-center gap-2.5">
            {SOCIAL_LINKS.map((social) => {
              const Icon = SOCIAL_ICON[social.id as keyof typeof SOCIAL_ICON] ?? Instagram;
              return (
                <a
                  key={social.id}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/50 text-white transition-colors duration-300 hover:border-white hover:bg-white/10"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </StoreHomeSection>
  );
}
