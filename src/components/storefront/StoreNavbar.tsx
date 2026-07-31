import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, User, ShoppingBag, Heart, Menu, X, ChevronDown } from "lucide-react";
import { gsap } from "gsap";
import { StoreLogo } from "@/components/storefront/StoreLogo";
import { StoreSearchSuggestions } from "@/components/storefront/StoreSearchSuggestions";
import { StoreNavMegaMenu } from "@/components/storefront/StoreNavMegaMenu";
import { StoreCartDrawer } from "@/components/storefront/StoreCartDrawer";
import { StoreMobileMenu } from "@/components/storefront/StoreMobileMenu";
import { useStoreAuth } from "@/context/StoreAuthContext";
import { useStoreAuthUi } from "@/context/StoreAuthUiContext";
import { MAIN_NAV_LINKS } from "@/constants/storefront.constants";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

type DrawerView = "none" | "menu" | "cart";

// ─── Shared ──────────────────────────────────────────────────────────────────

const iconBtnClass =
  "relative flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors duration-200 hover:bg-white/10 hover:text-[var(--store-red-light)] active:scale-95";

function CartBadge({ count }: { count: number }) {
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--store-red)] px-1 text-[9px] font-bold leading-none text-white">
      {count}
    </span>
  );
}

const SCROLL_IDLE_MS = 220;
const TOP_REVEAL_THRESHOLD = 48;

function useNavbarScrollHide(suppress: boolean) {
  const [navVisible, setNavVisible] = useState(true);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => {
      if (suppress) {
        setNavVisible(true);
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        return;
      }

      if (window.scrollY <= TOP_REVEAL_THRESHOLD) {
        setNavVisible(true);
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        return;
      }

      setNavVisible(false);

      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        setNavVisible(true);
      }, SCROLL_IDLE_MS);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [suppress]);

  return navVisible;
}

// ─── Desktop Navbar ──────────────────────────────────────────────────────────

interface DesktopNavProps {
  scrolled: boolean;
  navVisible: boolean;
  searchOpen: boolean;
  searchQuery: string;
  isShopOpen: boolean;
  shopRef: React.RefObject<HTMLLIElement | null>;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  cartCount: number;
  isLoggedIn: boolean;
  isActive: (to: string) => boolean;
  onSearchOpen: () => void;
  onSearchClose: () => void;
  onSearchChange: (q: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onShopToggle: () => void;
  onCartToggle: () => void;
  onProfileClick: () => void;
  onLinkClick: () => void;
  showSuggestions: boolean;
  onSuggestionProduct: (slug: string) => void;
  onSuggestionViewAll: () => void;
  cartDrawerOpen: boolean;
}

function DesktopNav({
  scrolled,
  navVisible,
  searchOpen,
  searchQuery,
  isShopOpen,
  shopRef,
  searchInputRef,
  cartCount,
  isLoggedIn,
  isActive,
  onSearchOpen,
  onSearchClose,
  onSearchChange,
  onSearchSubmit,
  onShopToggle,
  onCartToggle,
  onProfileClick,
  onLinkClick,
  showSuggestions,
  onSuggestionProduct,
  onSuggestionViewAll,
  cartDrawerOpen,
}: DesktopNavProps) {
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const navLinksRef = useRef<HTMLUListElement>(null);
  const [spacerHeight, setSpacerHeight] = useState(0);
  const entranceDoneRef = useRef(false);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () => setSpacerHeight(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const tl = gsap.timeline({
      onComplete: () => {
        entranceDoneRef.current = true;
      },
    });

    tl.fromTo(
      header,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.75, ease: "expo.out" },
    );

    if (navLinksRef.current) {
      tl.fromTo(
        navLinksRef.current.children,
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, stagger: 0.05, ease: "power2.out" },
        "-=0.45",
      );
    }

    return () => {
      tl.kill();
    };
  }, []);

  useEffect(() => {
    const header = headerRef.current;
    if (!header || !entranceDoneRef.current) return;

    gsap.to(header, {
      y: navVisible ? 0 : "-100%",
      opacity: navVisible ? 1 : 0,
      duration: navVisible ? 0.55 : 0.38,
      ease: navVisible ? "expo.out" : "power3.inOut",
      overwrite: "auto",
    });
  }, [navVisible]);

  useEffect(() => {
    if (!logoRef.current) return;
    gsap.to(logoRef.current, {
      scale: scrolled ? 0.9 : 1,
      duration: 0.45,
      ease: "power2.out",
      overwrite: "auto",
    });
  }, [scrolled]);

  const navLinkClass = (to: string) =>
    cn(
      "block whitespace-nowrap px-3 py-1.5 font-store-body text-[11px] font-medium uppercase tracking-[0.14em] transition-colors duration-200",
      isActive(to)
        ? "text-[var(--store-red)]"
        : "text-white/85 hover:text-[var(--store-red-light)]",
    );

  const renderLink = (link: (typeof MAIN_NAV_LINKS)[number]) => {
    if ("hasDropdown" in link && link.hasDropdown) {
      return (
        <li key={link.label} ref={shopRef} className="relative">
          <button
            type="button"
            onClick={onShopToggle}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 font-store-body text-[11px] font-medium uppercase tracking-[0.14em] transition-colors duration-200",
              isActive(link.to) || isShopOpen
                ? "text-[var(--store-red)]"
                : "text-white/85 hover:text-[var(--store-red-light)]",
            )}
          >
            {link.label}
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-300",
                isShopOpen && "rotate-180",
              )}
            />
          </button>
          <StoreNavMegaMenu open={isShopOpen} onClose={onLinkClick} />
        </li>
      );
    }
    return (
      <li key={link.label}>
        <Link to={link.to} className={navLinkClass(link.to)} onClick={onLinkClick}>
          {link.label}
        </Link>
      </li>
    );
  };

  return (
    <>
      <div className="hidden lg:block" style={{ height: spacerHeight }} aria-hidden />
      <header
        ref={headerRef}
        className={cn(
          "fixed top-0 z-50 hidden w-full will-change-transform lg:block bg-[var(--store-ink)] transition-shadow duration-500",
          scrolled ? "shadow-[0_2px_20px_rgba(0,0,0,0.35)]" : "",
          !navVisible && "pointer-events-none",
        )}
      >
        <div className="absolute inset-x-0 bottom-0 h-px bg-[var(--store-red)]/25" aria-hidden />
        <div className="relative mx-auto max-w-[1440px] px-8 xl:px-14">
          {/* Search overlay */}
          <div
            className={cn(
              "absolute inset-x-8 top-1/2 z-30 mx-auto max-w-lg -translate-y-1/2 xl:inset-x-14 transition-all duration-300",
              searchOpen
                ? "pointer-events-auto opacity-100 translate-y-[-50%]"
                : "pointer-events-none opacity-0 translate-y-[-42%]",
            )}
          >
            <form
              onSubmit={onSearchSubmit}
              className="flex items-center overflow-hidden rounded-xl border border-[var(--store-red)] bg-white px-1 shadow-[0_4px_24px_rgba(0,0,0,0.10)]"
              aria-hidden={!searchOpen}
            >
              <Search className="ml-3 h-4 w-4 shrink-0 text-[var(--store-muted)]" aria-hidden />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search chicken, mutton, fish…"
                tabIndex={searchOpen ? 0 : -1}
                className="min-w-0 flex-1 bg-transparent px-3 py-3 font-store-body text-sm text-[var(--store-ink)] outline-none placeholder:text-[var(--store-muted)]"
                aria-label="Search products"
                aria-autocomplete="list"
              />
              <button
                type="button"
                onClick={onSearchClose}
                className="shrink-0 px-3 py-2 text-[var(--store-muted)] transition-colors hover:text-[var(--store-ink)]"
                aria-label="Close search"
                tabIndex={searchOpen ? 0 : -1}
              >
                <X className="h-4 w-4" />
              </button>
            </form>
            <StoreSearchSuggestions
              query={searchQuery}
              visible={showSuggestions}
              onNavigateProduct={onSuggestionProduct}
              onViewAll={onSuggestionViewAll}
            />
          </div>

          {/* Three-column layout: Left logo | Center nav | Right icons */}
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 py-3">
            {/* LEFT — Logo */}
            <div ref={logoRef} className="flex origin-left items-center justify-start">
              <StoreLogo variant="light" size="lg" tagline />
            </div>

            {/* CENTER — Nav links */}
            <nav
              className={cn(
                "flex items-center justify-center transition-opacity duration-300",
                searchOpen && "pointer-events-none opacity-0",
              )}
              aria-label="Main navigation"
              aria-hidden={searchOpen}
            >
              <ul ref={navLinksRef} className="flex items-center gap-0.5">
                {MAIN_NAV_LINKS.map(renderLink)}
              </ul>
            </nav>

            {/* RIGHT — Actions */}
            <div
              className={cn(
                "flex items-center justify-end gap-1 transition-opacity duration-300",
                searchOpen && "pointer-events-none opacity-0",
              )}
            >
              <button
                type="button"
                onClick={searchOpen ? onSearchClose : onSearchOpen}
                className={iconBtnClass}
                aria-label={searchOpen ? "Close search" : "Search"}
                aria-expanded={searchOpen}
              >
                <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </button>

              <Link
                to="/wishlist"
                onClick={onLinkClick}
                className={cn(iconBtnClass, isActive("/wishlist") && "text-[var(--store-red)]")}
                aria-label="Wishlist"
              >
                <Heart className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </Link>

              <button
                type="button"
                onClick={onCartToggle}
                className={cn(iconBtnClass, cartDrawerOpen && "text-[var(--store-red)]")}
                aria-label="Cart"
                aria-expanded={cartDrawerOpen}
              >
                <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.5} />
                <CartBadge count={cartCount} />
              </button>

              <button
                type="button"
                onClick={onProfileClick}
                className={iconBtnClass}
                aria-label={isLoggedIn ? "My account" : "Log in or sign up"}
              >
                <User className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

// ─── Mobile Top Bar ──────────────────────────────────────────────────────────

interface MobileTopBarProps {
  scrolled: boolean;
  navVisible: boolean;
  searchOpen: boolean;
  searchQuery: string;
  mobileSearchInputRef: React.RefObject<HTMLInputElement | null>;
  cartCount: number;
  menuOpen: boolean;
  cartDrawerOpen: boolean;
  onMenuToggle: () => void;
  onCartToggle: () => void;
  onSearchOpen: () => void;
  onSearchClose: () => void;
  onSearchChange: (q: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  showSuggestions: boolean;
  onSuggestionProduct: (slug: string) => void;
  onSuggestionViewAll: () => void;
}

function MobileTopBar({
  scrolled,
  navVisible,
  searchOpen,
  searchQuery,
  mobileSearchInputRef,
  cartCount,
  menuOpen,
  cartDrawerOpen,
  onMenuToggle,
  onCartToggle,
  onSearchOpen,
  onSearchClose,
  onSearchChange,
  onSearchSubmit,
  showSuggestions,
  onSuggestionProduct,
  onSuggestionViewAll,
}: MobileTopBarProps) {
  const topBarRef = useRef<HTMLDivElement>(null);
  const entranceDoneRef = useRef(false);
  const [spacerHeight, setSpacerHeight] = useState(0);

  useEffect(() => {
    const el = topBarRef.current;
    if (!el) return;
    const update = () => setSpacerHeight(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [searchOpen]);

  useEffect(() => {
    if (!topBarRef.current) return;
    const tween = gsap.fromTo(
      topBarRef.current,
      { y: -64, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.65,
        ease: "expo.out",
        delay: 0.08,
        onComplete: () => {
          entranceDoneRef.current = true;
        },
      },
    );
    return () => {
      tween.kill();
    };
  }, []);

  useEffect(() => {
    if (!topBarRef.current || !entranceDoneRef.current) return;
    gsap.to(topBarRef.current, {
      y: navVisible ? 0 : "-100%",
      opacity: navVisible ? 1 : 0,
      duration: navVisible ? 0.5 : 0.35,
      ease: navVisible ? "expo.out" : "power3.inOut",
      overwrite: "auto",
    });
  }, [navVisible]);

  return (
    <>
      <div className="lg:hidden" style={{ height: spacerHeight }} aria-hidden />
      <div
        ref={topBarRef}
        className={cn(
          "fixed top-0 z-50 w-full will-change-transform lg:hidden bg-[var(--store-ink)] transition-shadow duration-400",
          scrolled ? "shadow-[0_2px_16px_rgba(0,0,0,0.35)]" : "",
          !navVisible && "pointer-events-none",
        )}
      >
        {/* Default top bar — menu left, logo centered, actions right */}
        <div
          className={cn(
            "grid grid-cols-[1fr_auto_1fr] items-center px-4 py-2.5 transition-all duration-300",
            searchOpen && "hidden",
          )}
        >
          <div className="flex items-center justify-start">
            <button
              type="button"
              onClick={onMenuToggle}
              className={cn(iconBtnClass, menuOpen && "text-[var(--store-red)]")}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex items-center justify-center">
            <StoreLogo variant="light" size="md" />
          </div>

          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={onSearchOpen}
              className={iconBtnClass}
              aria-label="Search"
            >
              <Search className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={onCartToggle}
              className={cn(iconBtnClass, cartDrawerOpen && "text-[var(--store-red)]")}
              aria-label="Cart"
              aria-expanded={cartDrawerOpen}
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              <CartBadge count={cartCount} />
            </button>
          </div>
        </div>

        {/* Search bar — replaces top bar */}
        <div
          className={cn("px-4 py-3 transition-all duration-300", searchOpen ? "block" : "hidden")}
        >
          <form
            onSubmit={onSearchSubmit}
            className="flex items-center overflow-hidden rounded-xl border border-[var(--store-red)] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] px-1"
          >
            <Search className="ml-2 h-4 w-4 shrink-0 text-[var(--store-muted)]" aria-hidden />
            <input
              ref={mobileSearchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products…"
              enterKeyHint="search"
              className="min-w-0 flex-1 bg-transparent px-2 py-3 font-store-body text-sm text-[var(--store-ink)] outline-none placeholder:text-[var(--store-muted)]"
              aria-label="Search products"
              aria-autocomplete="list"
            />
            <button
              type="button"
              onClick={onSearchClose}
              className="shrink-0 px-3 py-2 text-[var(--store-muted)] transition-colors hover:text-[var(--store-ink)]"
              aria-label="Close search"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </form>
          <StoreSearchSuggestions
            query={searchQuery}
            visible={showSuggestions}
            onNavigateProduct={onSuggestionProduct}
            onViewAll={onSuggestionViewAll}
            className="static mt-2 border-x-0 shadow-none"
          />
        </div>
      </div>
    </>
  );
}

// ─── Main Navbar (orchestrator) ───────────────────────────────────────────────

export function StoreNavbar() {
  const [drawerView, setDrawerView] = useState<DrawerView>("none");
  const [searchOpen, setSearchOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  const shopRef = useRef<HTMLLIElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  const { count: cartCount, items, removeItem, setItemQty, onOpenCart } = useCart();
  const { isLoggedIn, logout } = useStoreAuth();
  const { openAuth, closeAuth } = useStoreAuthUi();
  const navigate = useNavigate();
  const location = useLocation();

  // ── Close all panels ────────────────────────────────────────────────────────
  const closeAll = useCallback(() => {
    setDrawerView("none");
    setSearchOpen(false);
    setIsShopOpen(false);
    closeAuth();
  }, [closeAuth]);

  // ── Search ──────────────────────────────────────────────────────────────────
  const openSearch = useCallback(() => {
    setDrawerView("none");
    setIsShopOpen(false);
    setSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => setSearchOpen(false), []);

  const handleSearchChange = useCallback((q: string) => setSearchQuery(q), []);

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      navigate(
        searchQuery.trim()
          ? `/collection?q=${encodeURIComponent(searchQuery.trim())}`
          : "/collection",
      );
      closeAll();
    },
    [navigate, searchQuery, closeAll],
  );

  // ── Drawer ──────────────────────────────────────────────────────────────────
  const toggleDrawer = useCallback((view: "menu" | "cart") => {
    setSearchOpen(false);
    setIsShopOpen(false);
    setDrawerView((cur) => (cur === view ? "none" : view));
  }, []);

  // ── Auth ────────────────────────────────────────────────────────────────────
  const openAuthModal = useCallback(
    (view: "login" | "signup") => {
      setDrawerView("none");
      setSearchOpen(false);
      setIsShopOpen(false);
      openAuth(view);
    },
    [openAuth],
  );

  const handleProfileClick = useCallback(() => {
    if (isLoggedIn) {
      navigate("/account");
      return;
    }
    openAuthModal("login");
  }, [isLoggedIn, navigate, openAuthModal]);

  // ── Side effects ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onOpenCart(() => {
      setSearchOpen(false);
      setIsShopOpen(false);
      setDrawerView("cart");
    });
    return unsub;
  }, [onOpenCart]);

  useEffect(() => {
    closeAll();
  }, [location.pathname, closeAll]);

  useEffect(() => {
    if (location.pathname === "/collection") {
      setSearchQuery(new URLSearchParams(location.search).get("q") ?? "");
      return;
    }
    setSearchQuery("");
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAll();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeAll]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (shopRef.current && !shopRef.current.contains(e.target as Node)) {
        setIsShopOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    const input = isDesktop ? searchInputRef.current : mobileSearchInputRef.current;
    const timer = window.setTimeout(() => input?.focus(), 80);
    return () => window.clearTimeout(timer);
  }, [searchOpen]);

  // Body scroll lock
  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 1023px)").matches;
    const shouldLock = drawerView !== "none" || (searchOpen && isMobile);
    if (!shouldLock) return;

    const lenis = window.__lenis;
    lenis?.stop();

    const scrollY = window.scrollY;
    const pathnameAtLock = location.pathname;
    Object.assign(document.body.style, {
      position: "fixed",
      top: `-${scrollY}px`,
      left: "0",
      right: "0",
      width: "100%",
      overflow: "hidden",
    });

    return () => {
      lenis?.start();
      Object.assign(document.body.style, {
        position: "",
        top: "",
        left: "",
        right: "",
        width: "",
        overflow: "",
      });
      window.scrollTo(0, location.pathname !== pathnameAtLock ? 0 : scrollY);
    };
  }, [drawerView, searchOpen, location.pathname]);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const subtotal = items.reduce((sum, it) => {
    return sum + (Number(String(it.price).replace(/[^\d.]/g, "")) || 0) * it.qty;
  }, 0);

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  const showSuggestions = searchOpen && searchQuery.trim().length >= 2;

  const handleSuggestionProduct = (slug: string) => {
    navigate(`/product/${slug}`);
    closeAll();
  };
  const handleSuggestionViewAll = () => {
    const q = searchQuery.trim();
    navigate(q ? `/collection?q=${encodeURIComponent(q)}` : "/collection");
    closeAll();
  };

  const isDrawerOpen = drawerView !== "none";
  const suppressNavHide = searchOpen || isDrawerOpen || isShopOpen;
  const navVisible = useNavbarScrollHide(suppressNavHide);

  return (
    <>
      {/* Desktop */}
      <DesktopNav
        scrolled={scrolled}
        navVisible={navVisible}
        searchOpen={searchOpen}
        searchQuery={searchQuery}
        isShopOpen={isShopOpen}
        shopRef={shopRef}
        searchInputRef={searchInputRef}
        cartCount={cartCount}
        isLoggedIn={isLoggedIn}
        isActive={isActive}
        onSearchOpen={openSearch}
        onSearchClose={closeSearch}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        onShopToggle={() => setIsShopOpen((o) => !o)}
        onCartToggle={() => toggleDrawer("cart")}
        onProfileClick={handleProfileClick}
        onLinkClick={closeAll}
        showSuggestions={showSuggestions}
        onSuggestionProduct={handleSuggestionProduct}
        onSuggestionViewAll={handleSuggestionViewAll}
        cartDrawerOpen={drawerView === "cart"}
      />

      {/* Mobile top bar */}
      <MobileTopBar
        scrolled={scrolled}
        navVisible={navVisible}
        searchOpen={searchOpen}
        searchQuery={searchQuery}
        mobileSearchInputRef={mobileSearchInputRef}
        cartCount={cartCount}
        menuOpen={drawerView === "menu"}
        cartDrawerOpen={drawerView === "cart"}
        onMenuToggle={() => toggleDrawer("menu")}
        onCartToggle={() => toggleDrawer("cart")}
        onSearchOpen={openSearch}
        onSearchClose={closeSearch}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        showSuggestions={showSuggestions}
        onSuggestionProduct={handleSuggestionProduct}
        onSuggestionViewAll={handleSuggestionViewAll}
      />

      {/* Backdrop */}
      {(isDrawerOpen || searchOpen) && (
        <button
          type="button"
          className={cn(
            "fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity",
            searchOpen && !isDrawerOpen && "lg:hidden",
          )}
          aria-label={searchOpen ? "Close search" : "Close drawer"}
          onClick={closeAll}
        />
      )}

      {/* Mobile menu drawer */}
      <StoreMobileMenu
        open={drawerView === "menu"}
        isLoggedIn={isLoggedIn}
        isActive={isActive}
        onClose={closeAll}
        onOpenAuth={openAuthModal}
        onLogout={logout}
      />

      {/* Cart drawer */}
      <StoreCartDrawer
        open={drawerView === "cart"}
        items={items}
        cartCount={cartCount}
        subtotal={subtotal}
        onClose={closeAll}
        onCheckout={() => {
          navigate("/checkout");
          closeAll();
        }}
        onContinueShopping={() => {
          navigate("/collection");
          closeAll();
        }}
        onRemoveItem={(id) => void removeItem(id)}
        onSetItemQty={(id, qty) => void setItemQty(id, qty)}
      />
    </>
  );
}
