import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown, ChevronUp, Loader2, X } from "lucide-react";
import {
  StoreFormLabel,
  StoreGhostButton,
  StoreInput,
  StoreModalPortal,
  StorePrimaryButton,
  storeFieldInputClass,
  storePanelClass,
  useStoreBodyScrollLock,
} from "@/components/storefront/storefront-ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getErrorMessage } from "@/lib/error";
import { cn } from "@/lib/utils";
import {
  createStoreAddress,
  updateStoreAddress,
  type StoreAddressApi,
} from "@/services/store-address-service";
import { useNotification } from "@/hooks/useNotification";

export type StoreAddressFormValues = {
  id?: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal: string;
  isDefault: boolean;
};

export const emptyStoreAddressForm = (): StoreAddressFormValues => ({
  label: "",
  name: "",
  line1: "",
  line2: "",
  city: "",
  state: "Maharashtra",
  postal: "",
  phone: "",
  isDefault: false,
});

export const storeAddressFormFromApi = (a: StoreAddressApi): StoreAddressFormValues => ({
  id: a.id,
  label: a.label,
  name: a.name,
  phone: a.phone,
  line1: a.line1,
  line2: a.line2 ?? "",
  city: a.city,
  state: a.state,
  postal: a.pincode,
  isDefault: a.isDefault,
});

type StoreAddressFormModalProps = {
  open: boolean;
  initial?: StoreAddressFormValues | null;
  onClose: () => void;
  onSaved: (address: StoreAddressApi) => void;
};

const modalScrollClass =
  "overflow-y-auto overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

function AddressField({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <StoreFormLabel className="block">{label}</StoreFormLabel>
      <div className="mt-1.5 sm:mt-2">{children}</div>
    </label>
  );
}

function StoreStateSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (state: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const [scrollHints, setScrollHints] = useState({ up: false, down: false });

  const states = useMemo(() => {
    if (value && !INDIAN_STATES.includes(value as (typeof INDIAN_STATES)[number])) {
      return [value, ...INDIAN_STATES];
    }
    return INDIAN_STATES;
  }, [value]);

  const updateScrollHints = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setScrollHints({
      up: scrollTop > 4,
      down: scrollTop + clientHeight < scrollHeight - 4,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(updateScrollHints);
    return () => cancelAnimationFrame(id);
  }, [open, states, updateScrollHints]);

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Select state"
          className={cn(
            storeFieldInputClass,
            "flex items-center justify-between gap-2 text-left",
            !value && "text-[var(--store-muted)]",
          )}
        >
          <span className="truncate">{value || "Select state"}</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-[var(--store-muted)]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className={cn(
          storePanelClass,
          "z-[70] w-[var(--radix-dropdown-menu-trigger-width)] overflow-hidden p-0 font-store-body text-[var(--store-ink)] shadow-[var(--store-shadow-md)]",
          "animate-none data-[state=closed]:animate-none data-[state=open]:animate-none",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100",
        )}
      >
        <div className="relative">
          {scrollHints.up ? (
            <div
              className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center bg-gradient-to-b from-white via-white/95 to-transparent pb-2 pt-1"
              aria-hidden
            >
              <ChevronUp className="h-3 w-3 text-[var(--store-muted)]" strokeWidth={2.5} />
            </div>
          ) : null}
          <div
            ref={listRef}
            data-lenis-prevent
            className={cn(
              "max-h-[min(280px,45dvh)] overflow-y-auto overscroll-contain p-1",
              modalScrollClass,
            )}
            onScroll={updateScrollHints}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {states.map((state) => (
              <DropdownMenuItem
                key={state}
                onSelect={() => onChange(state)}
                className="relative cursor-pointer rounded-md py-2 pl-8 pr-3 focus:bg-[var(--store-cream)] focus:text-[var(--store-ink)]"
              >
                <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
                  {value === state ? <Check className="h-4 w-4" /> : null}
                </span>
                {state}
              </DropdownMenuItem>
            ))}
          </div>
          {scrollHints.down ? (
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center bg-gradient-to-t from-white via-white/95 to-transparent pb-1 pt-2"
              aria-hidden
            >
              <ChevronDown className="h-3 w-3 text-[var(--store-muted)]" strokeWidth={2.5} />
            </div>
          ) : null}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function StoreAddressFormModal({
  open,
  initial,
  onClose,
  onSaved,
}: StoreAddressFormModalProps) {
  const { notify } = useNotification();
  const [form, setForm] = useState<StoreAddressFormValues>(emptyStoreAddressForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(initial ?? emptyStoreAddressForm());
  }, [open, initial]);

  useStoreBodyScrollLock(open);

  if (!open) return null;

  const isEdit = Boolean(form.id);

  const save = async () => {
    if (!form.state.trim()) {
      notify("Please select a state.", "error");
      return;
    }

    setSaving(true);
    try {
      const body = {
        label: form.label || "Home",
        name: form.name,
        phone: form.phone,
        line1: form.line1,
        line2: form.line2 || undefined,
        city: form.city,
        state: form.state,
        pincode: form.postal,
        isDefault: form.isDefault,
      };
      const saved = form.id
        ? await updateStoreAddress(form.id, body)
        : await createStoreAddress(body);
      notify(isEdit ? "Address updated." : "Address added.", "success");
      onSaved(saved);
      onClose();
    } catch (err) {
      notify(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <StoreModalPortal>
      <div
        className="fixed inset-0 z-[60] flex h-[100dvh] items-end justify-center bg-black/30 p-0 backdrop-blur-sm sm:items-center sm:p-4"
        onClick={onClose}
        role="presentation"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={cn(
            storePanelClass,
            "relative grid min-h-0 max-h-[min(92dvh,100vh)] w-full max-w-2xl grid-rows-[auto_1fr] overflow-hidden rounded-t-2xl sm:max-h-[min(90dvh,90vh)] sm:rounded-xl",
          )}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-black/10 bg-white px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6">
            <div className="min-w-0 pr-3">
              <p className="font-store-body text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--store-muted)] sm:text-xs">
                {isEdit ? "Edit address" : "New address"}
              </p>
              <h3 className="mt-0.5 text-lg font-bold uppercase tracking-wide text-[var(--store-ink)] sm:mt-1 sm:text-xl">
                Delivery details
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-md p-2 text-[var(--store-muted)] transition-colors hover:bg-[var(--store-cream)] hover:text-[var(--store-ink)]"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
            className="grid min-h-0 grid-rows-[1fr_auto] overflow-hidden"
          >
            <div
              data-lenis-prevent
              className={cn(
                "min-h-0 px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6",
                modalScrollClass,
              )}
            >
              <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-5">
                <AddressField label="Label">
                  <StoreInput
                    required
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    placeholder="Home, Office…"
                  />
                </AddressField>
                <AddressField label="Recipient name">
                  <StoreInput
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Full name"
                  />
                </AddressField>
                <AddressField label="Address line 1" className="sm:col-span-2">
                  <StoreInput
                    required
                    value={form.line1}
                    onChange={(e) => setForm({ ...form, line1: e.target.value })}
                    placeholder="Street, building"
                  />
                </AddressField>
                <AddressField label="Address line 2 (optional)" className="sm:col-span-2">
                  <StoreInput
                    value={form.line2}
                    onChange={(e) => setForm({ ...form, line2: e.target.value })}
                    placeholder="Landmark (optional)"
                  />
                </AddressField>
                <AddressField label="City">
                  <StoreInput
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Mumbai, Delhi…"
                  />
                </AddressField>
                <AddressField label="State">
                  <StoreStateSelect
                    value={form.state}
                    onChange={(state) => setForm({ ...form, state })}
                  />
                </AddressField>
                <AddressField label="PIN code">
                  <StoreInput
                    required
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={form.postal}
                    onChange={(e) => setForm({ ...form, postal: e.target.value.replace(/\D/g, "") })}
                    placeholder="400001"
                  />
                </AddressField>
                <AddressField label="Phone">
                  <StoreInput
                    required
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                    placeholder="9876543210"
                  />
                </AddressField>

                <label className="inline-flex cursor-pointer items-center gap-3 sm:col-span-2">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={form.isDefault}
                    onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                  />
                  <span
                    className={cn(
                      "relative h-5 w-10 shrink-0 rounded-full transition-colors",
                      form.isDefault ? "bg-[var(--store-ink)]" : "bg-black/15",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform",
                        form.isDefault && "translate-x-5",
                      )}
                    />
                  </span>
                  <span className="font-store-body text-xs leading-snug text-[var(--store-muted)] sm:text-sm">
                    Set as default shipping address
                  </span>
                </label>
              </div>
            </div>

            <div className="flex shrink-0 flex-col-reverse gap-2.5 border-t border-black/10 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:gap-3 sm:px-6 sm:py-4 md:px-8">
              <StoreGhostButton type="button" onClick={onClose} className="w-full sm:w-auto">
                Cancel
              </StoreGhostButton>
              <StorePrimaryButton
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 sm:w-auto"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Save address
              </StorePrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </StoreModalPortal>
  );
}
