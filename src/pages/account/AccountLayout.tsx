import { Link, NavLink, Outlet } from "react-router-dom";
import { Loader2, LogOut, UserCircle2, Package, MapPin, KeyRound, Heart } from "lucide-react";
import { StorePageShell } from "@/components/storefront/StorePageShell";
import { RevealTitle } from "@/components/storefront/motion/RevealTitle";
import {
  StorePageContainer,
  StorePrimaryButton,
  storePageSectionClass,
  storePanelClass,
} from "@/components/storefront/storefront-ui";
import { useStoreAuth, useStoreDisplayName } from "@/context/StoreAuthContext";
import { useStoreAuthUi } from "@/context/StoreAuthUiContext";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/account", end: true, label: "Profile", icon: UserCircle2 },
  { to: "/account/orders", end: false, label: "My Orders", icon: Package },
  { to: "/account/addresses", end: false, label: "Addresses", icon: MapPin },
  { to: "/wishlist", end: true, label: "Wishlist", icon: Heart },
  { to: "/account/security", end: false, label: "Security", icon: KeyRound },
] as const;

export default function AccountLayout() {
  const { customer, logout, formatPhone, getFirstName, isLoggedIn, isBootstrapping } = useStoreAuth();
  const { openAuth } = useStoreAuthUi();
  const displayName = useStoreDisplayName();
  const displayPhone = formatPhone();
  const displayEmail = customer?.email ?? "";
  const welcomeName = getFirstName();

  if (isBootstrapping) {
    return (
      <StorePageShell>
        <StorePageContainer className={cn(storePageSectionClass, "flex justify-center py-24")}>
          <Loader2 className="h-8 w-8 animate-spin text-[var(--store-muted)]" aria-hidden />
        </StorePageContainer>
      </StorePageShell>
    );
  }

  if (!isLoggedIn) {
    return (
      <StorePageShell>
        <StorePageContainer
          className={cn(
            storePageSectionClass,
            "mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center"
          )}
        >
          <div className="max-w-md">
            <RevealTitle
              as="h1"
              className=" text-3xl font-bold uppercase tracking-wide text-[var(--store-ink)] md:text-4xl"
            >
              My Account
            </RevealTitle>
  
            <p className="mt-4 font-store-body text-sm leading-relaxed text-[var(--store-muted)] md:text-base">
              Sign in to access your orders, saved addresses, and profile
              information.
            </p>
          </div>
  
          <div className="mt-8 flex flex-col items-center">
            <StorePrimaryButton
              type="button"
              onClick={() => openAuth("login")}
              className="px-8"
            >
              Sign In
            </StorePrimaryButton>
  
            <Link
              to="/"
              className="mt-4 font-store-body text-xs font-semibold uppercase tracking-[0.12em] text-[var(--store-muted)] transition-colors hover:text-[var(--store-red)]"
            >
              ← Back to Shop
            </Link>
          </div>
        </StorePageContainer>
      </StorePageShell>
    );
  }


  return (
    <StorePageShell>
      {/* <StorePageTitle title="My Account" /> */}

      <StorePageContainer className={storePageSectionClass}>
        <div className="flex flex-col gap-6 border-b border-black/10 pb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-store-body text-xs font-semibold uppercase tracking-[0.14em] text-[var(--store-muted)]">
              Welcome back
            </p>
            <RevealTitle
              as="h2"
              className="mt-2  text-2xl font-bold uppercase tracking-wide text-[var(--store-ink)] md:text-3xl"
            >
              Hello, {welcomeName}
            </RevealTitle>
            <p className="mt-2 max-w-lg font-store-body text-sm leading-relaxed text-[var(--store-muted)]">
              Manage your profile, orders, saved addresses, and account security.
            </p>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-md border border-black/15 px-4 py-2 font-store-body text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--store-muted)] transition-colors hover:border-[var(--store-ink)] hover:text-[var(--store-ink)] md:self-center"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-28">
              <p className="mb-4 font-store-body text-xs font-semibold uppercase tracking-[0.14em] text-[var(--store-muted)]">
                Account menu
              </p>
              <nav
                className={cn(
                  "store-glass-strong",
                  "flex gap-1 overflow-x-auto rounded-xl p-1.5 lg:flex-col lg:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                )}
              >
                {NAV.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        "inline-flex shrink-0 items-center gap-2.5 rounded-md px-4 py-2.5 font-store-body text-sm transition-colors lg:w-full",
                        isActive
                          ? "bg-[var(--store-ink)] text-white lg:border-l-2 lg:border-[var(--store-red)] lg:bg-[var(--store-cream)] lg:text-[var(--store-ink)] lg:shadow-[var(--store-shadow-sm)]"
                          : "text-[var(--store-muted)] hover:bg-[var(--store-cream)]/50 hover:text-[var(--store-ink)] lg:border-l-2 lg:border-transparent",
                      )
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <div className={cn(storePanelClass, "mt-6 hidden p-5 lg:block")}>
                <p className="font-store-body text-xs font-semibold uppercase tracking-[0.14em] text-[var(--store-muted)]">
                  Signed in as
                </p>
                <p className="mt-2 font-store-body text-sm font-semibold text-[var(--store-ink)]">{displayName}</p>
                {displayEmail ? (
                  <p className="mt-1 font-store-body text-sm text-[var(--store-muted)]">{displayEmail}</p>
                ) : null}
                {displayPhone ? (
                  <p className="mt-1 font-store-body text-sm text-[var(--store-muted)]">{displayPhone}</p>
                ) : null}
                <Link
                  to="/contact"
                  className="mt-4 inline-block font-store-body text-xs font-semibold uppercase tracking-[0.12em] text-[var(--store-red)] transition-colors hover:text-[var(--store-ink)]"
                >
                  Need help?
                </Link>
              </div>
            </div>
          </aside>

          <div className="min-w-0 lg:col-span-9">
            <Outlet />
          </div>
        </div>
      </StorePageContainer>
    </StorePageShell>
  );
}
