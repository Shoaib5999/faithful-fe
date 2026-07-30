import React from "react";
import type { EmptyIllustrationType } from "@/types/component.types";

interface EmptyIllustrationProps {
  type: EmptyIllustrationType;
}

const illustrations: Record<EmptyIllustrationType, React.ReactNode> = {
  orders: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-16 w-16">
      <rect x="12" y="8" width="40" height="48" rx="4" />
      <line x1="20" y1="20" x2="44" y2="20" />
      <line x1="20" y1="28" x2="44" y2="28" />
      <line x1="20" y1="36" x2="36" y2="36" />
      <polyline points="28,48 32,44 36,48" />
    </svg>
  ),
  products: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-16 w-16">
      <rect x="8" y="16" width="48" height="40" rx="4" />
      <polyline points="8,24 32,8 56,24" />
      <line x1="32" y1="32" x2="32" y2="48" />
      <line x1="24" y1="40" x2="40" y2="40" />
    </svg>
  ),
  customers: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-16 w-16">
      <circle cx="32" cy="20" r="10" />
      <path d="M12 56c0-11 8.95-20 20-20s20 9 20 20" />
    </svg>
  ),
  inventory: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-16 w-16">
      <rect x="12" y="28" width="40" height="28" rx="3" />
      <rect x="20" y="12" width="24" height="16" rx="3" />
      <line x1="28" y1="42" x2="36" y2="42" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-16 w-16">
      <circle cx="28" cy="28" r="16" />
      <line x1="40" y1="40" x2="56" y2="56" strokeLinecap="round" />
      <line x1="20" y1="28" x2="36" y2="28" />
    </svg>
  ),
  generic: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-16 w-16">
      <rect x="8" y="8" width="48" height="48" rx="8" />
      <circle cx="32" cy="28" r="8" />
      <line x1="32" y1="40" x2="32" y2="48" />
    </svg>
  ),
};

export const EmptyIllustration: React.FC<EmptyIllustrationProps> = ({ type }) => {
  return (
    <div className="flex items-center justify-center rounded-xl bg-muted p-4 text-muted-foreground">
      {illustrations[type]}
    </div>
  );
};
