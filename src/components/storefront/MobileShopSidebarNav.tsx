import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import {
  MOBILE_SHOP_EXPANDABLE,
  MOBILE_SHOP_LINKS,
} from "@/constants/storefront.constants";
import { cn } from "@/lib/utils";

type MobileShopSidebarNavProps = {
  onNavigate: () => void;
};

export function MobileShopSidebarNav({ onNavigate }: MobileShopSidebarNavProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <div className="space-y-1">
      {MOBILE_SHOP_EXPANDABLE.map((section) => {
        const isOpen = openId === section.id;
        return (
          <div key={section.id} className="border-b border-black/8 last:border-b-0">
            <button
              type="button"
              onClick={() => toggle(section.id)}
              className="flex w-full items-center justify-between py-2.5 text-left font-store-body text-sm font-normal tracking-wide text-[#6b6b6b]"
              aria-expanded={isOpen}
            >
              {section.label}
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-[#6b6b6b] transition-transform duration-200",
                  isOpen && "rotate-180",
                )}
              />
            </button>
            {isOpen && (
              <ul className="space-y-0.5 pb-3 pl-1">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      onClick={onNavigate}
                      className="block rounded-sm py-2 pl-3 font-store-body text-sm text-[#6b6b6b] transition-colors hover:bg-[#f5f1ea] hover:text-[#1a1a1a]"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}

      {MOBILE_SHOP_LINKS.map((link) => (
        <Link
          key={link.label}
          to={link.to}
          onClick={onNavigate}
          className="block border-b border-black/8 py-2.5 font-store-body text-sm font-normal tracking-wide text-[#6b6b6b] last:border-b-0 hover:bg-[#f5f1ea] hover:text-[#1a1a1a]"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
