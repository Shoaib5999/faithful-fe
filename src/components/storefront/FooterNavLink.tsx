import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type FooterNavLinkProps = {
  label: string;
  to?: string;
  href?: string;
  external?: boolean;
  className?: string;
};

const defaultClass =
  "group relative inline-block font-store-display text-base leading-snug tracking-[0.02em] text-[var(--section-fg-muted)] transition-colors duration-300 hover:text-[var(--section-fg)]";

function LinkContent({ label }: { label: string }) {
  return (
    <>
      <span className="relative z-[1]">{label}</span>
      <span
        className="absolute -bottom-0.5 left-0 h-px w-0 bg-[var(--store-red)] transition-all duration-300 ease-out group-hover:w-full"
        aria-hidden
      />
    </>
  );
}

export function FooterNavLink({ label, to, href, external, className }: FooterNavLinkProps) {
  const baseClass = cn(defaultClass, className);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  if (href) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={baseClass}
        onClick={scrollTop}
      >
        <LinkContent label={label} />
      </a>
    );
  }

  if (!to) return null;

  return (
    <Link
      to={to}
      className={baseClass}
      onClick={(e) => {
        scrollTop();
        if (to.startsWith("http")) {
          e.preventDefault();
          window.open(to, external ? "_blank" : "_self", "noopener,noreferrer");
        }
      }}
    >
      <LinkContent label={label} />
    </Link>
  );
}
