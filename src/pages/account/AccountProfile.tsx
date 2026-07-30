import { useEffect, useState } from "react";
import { CheckCircle2, Save } from "lucide-react";
import {
  StoreFormLabel,
  StoreInput,
  StorePrimaryButton,
  StoreSectionTitle,
} from "@/components/storefront/storefront-ui";
import { useStoreAuth } from "@/context/StoreAuthContext";
import { mapProfileToStoreCustomer, updateStoreProfile } from "@/services/store-auth-service";
import {
  coerceStoreString,
  EMPTY_STORE_CUSTOMER,
  formatStorePhone,
  normalizeStorePhone,
  sanitizeStoredName,
  validateStoreCustomerProfile,
} from "@/lib/store-auth";
import type { StoreCustomer, StoreCustomerFieldErrors } from "@/types/store-customer.types";

function ProfileField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <StoreFormLabel className="block">{label}</StoreFormLabel>
      <div className="mt-2">{children}</div>
      {error ? (
        <p className="mt-1.5 font-store-body text-[11px] text-[#c45c5c]" role="alert">
          {error}
        </p>
      ) : null}
    </label>
  );
}

export default function AccountProfile() {
  const { customer, updateCustomer } = useStoreAuth();
  const [form, setForm] = useState<StoreCustomer>(customer ?? EMPTY_STORE_CUSTOMER);
  const [fieldErrors, setFieldErrors] = useState<StoreCustomerFieldErrors>({});
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!customer) return;
    setForm({
      name: sanitizeStoredName(customer.name),
      phone: customer.phone,
      email: coerceStoreString(customer.email),
      address: "",
    });
  }, [customer]);

  const updateField = <K extends keyof StoreCustomer>(key: K, value: StoreCustomer[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setSaveError(null);
  };

  return (
    <div>
      <StoreSectionTitle
        title="Profile"
        subtitle="Keep your name, email, and mobile number up to date for orders and account updates."
      />

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setSaveError(null);

          const payload: StoreCustomer = {
            ...form,
            phone: normalizeStorePhone(form.phone),
            address: "",
          };

          const { isValid, errors, customer: normalized } = validateStoreCustomerProfile(payload);

          if (!isValid || !normalized) {
            setFieldErrors(errors);
            setSaveError("Please fix the highlighted fields.");
            return;
          }

          setIsSaving(true);

          try {
            const profile = await updateStoreProfile(normalized.name);
            const updated = mapProfileToStoreCustomer(profile, {
              ...normalized,
              phone: normalized.phone,
              address: "",
            });
            updateCustomer(updated);
            setForm({
              name: sanitizeStoredName(updated.name),
              phone: updated.phone,
              email: updated.email,
              address: "",
            });
            setFieldErrors({});
            setSaved(true);
            window.setTimeout(() => setSaved(false), 2200);
          } catch (err) {
            setSaveError(
              err instanceof Error ? err.message : "Could not save profile. Please try again.",
            );
          } finally {
            setIsSaving(false);
          }
        }}
        className="border border-black/10 p-6 md:p-8"
      >
        {saveError ? (
          <p className="mb-4 font-store-body text-sm text-[#c45c5c]" role="alert">
            {saveError}
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <ProfileField label="Full name" error={fieldErrors.name}>
            <StoreInput
              placeholder="Your full name"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              aria-invalid={Boolean(fieldErrors.name)}
            />
          </ProfileField>

          <ProfileField label="Email" error={fieldErrors.email}>
            <StoreInput
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              aria-invalid={Boolean(fieldErrors.email)}
            />
          </ProfileField>

          <ProfileField label="Mobile number" error={fieldErrors.phone}>
            <div className="flex overflow-hidden rounded-md border border-black/15 bg-white focus-within:border-[#b8954a]">
              <span className="flex items-center border-r border-black/10 bg-[#fafafa] px-3 font-store-body text-sm text-[#6b6b6b]">
                +91
              </span>
              <StoreInput
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="10-digit mobile number"
                value={form.phone}
                onChange={(e) => updateField("phone", normalizeStorePhone(e.target.value))}
                aria-invalid={Boolean(fieldErrors.phone)}
                className="border-0 focus-visible:ring-0"
              />
            </div>
            {form.phone ? (
              <p className="mt-1.5 font-store-body text-[11px] text-[#6b6b6b]">
                Saved as {formatStorePhone(form.phone)}
              </p>
            ) : null}
          </ProfileField>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-4">
          {saved ? (
            <span className="inline-flex items-center gap-1.5 font-store-body text-xs text-[#2d8a4e]">
              <CheckCircle2 className="h-4 w-4" />
              Saved
            </span>
          ) : null}
          <StorePrimaryButton
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2"
          >
            <Save className="h-3.5 w-3.5" />
            {isSaving ? "Saving…" : "Save changes"}
          </StorePrimaryButton>
        </div>
      </form>
    </div>
  );
}
