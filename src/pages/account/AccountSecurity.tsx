import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Lock, Eye, EyeOff, Save, Loader2 } from "lucide-react";
import {
  StoreFormLabel,
  StoreInput,
  StorePrimaryButton,
  StoreSectionTitle,
} from "@/components/storefront/storefront-ui";
import { useStoreAuth } from "@/context/StoreAuthContext";
import { useStoreAuthUi } from "@/context/StoreAuthUiContext";
import { validateStorePassword } from "@/lib/store-auth";
import { changePassword } from "@/services/store-auth-service";

function PasswordField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);

  return (
    <label className="block">
      <span className="flex items-center gap-2">
        <StoreFormLabel>{label}</StoreFormLabel>
        <Lock className="h-3 w-3 text-[#6b6b6b]" />
      </span>
      <div className="relative mt-2">
        <StoreInput
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] hover:text-[#1a1a1a]"
          aria-label="Toggle password visibility"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </label>
  );
}

export default function AccountSecurity() {
  const { logout } = useStoreAuth();
  const { openAuth } = useStoreAuthUi();
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [fieldErrors, setFieldErrors] = useState<{
    current?: string;
    next?: string;
    confirm?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const errors: typeof fieldErrors = {};

    if (!pw.current) {
      errors.current = "Current password is required.";
    }

    const nextError = validateStorePassword(pw.next, { forSignup: true });
    if (nextError) errors.next = nextError;

    if (!pw.confirm) {
      errors.confirm = "Please confirm your new password.";
    } else if (pw.confirm !== pw.next) {
      errors.confirm = "Passwords do not match.";
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);

    try {
      const message = await changePassword(pw.current, pw.next);
      logout();
      setPw({ current: "", next: "", confirm: "" });
      setFieldErrors({});
      setFormSuccess(message);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Could not update password. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <StoreSectionTitle title="Security" subtitle="Update your account password." />

      <p className="mb-4 font-store-body text-sm text-[#6b6b6b]">
        Forgot your current password?{" "}
        <Link
          to="/forgot-password"
          className="font-semibold text-[#b8954a] transition-colors hover:text-[#9a7a3c]"
        >
          Request a reset link
        </Link>
      </p>

      <form
        onSubmit={handleSubmit}
        className="border border-black/10 p-6 md:p-8"
      >
        <div className="grid max-w-xl grid-cols-1 gap-5">
          <div>
            <PasswordField
              label="Current password"
              value={pw.current}
              onChange={(v) => setPw({ ...pw, current: v })}
            />
            {fieldErrors.current ? (
              <p className="mt-1 font-store-body text-[11px] text-[#c45c5c]">{fieldErrors.current}</p>
            ) : null}
          </div>
          <div>
            <PasswordField
              label="New password"
              value={pw.next}
              onChange={(v) => setPw({ ...pw, next: v })}
            />
            {fieldErrors.next ? (
              <p className="mt-1 font-store-body text-[11px] text-[#c45c5c]">{fieldErrors.next}</p>
            ) : null}
          </div>
          <div>
            <PasswordField
              label="Confirm new password"
              value={pw.confirm}
              onChange={(v) => setPw({ ...pw, confirm: v })}
            />
            {fieldErrors.confirm ? (
              <p className="mt-1 font-store-body text-[11px] text-[#c45c5c]">{fieldErrors.confirm}</p>
            ) : null}
          </div>
        </div>

        <p className="mt-4 max-w-lg font-store-body text-sm text-[#6b6b6b]">
          Use at least 8 characters with uppercase, lowercase, and a number.
        </p>

        {formError ? (
          <p className="mt-4 rounded-md bg-[#fef2f2] px-2.5 py-1.5 font-store-body text-xs text-[#c45c5c]">
            {formError}
          </p>
        ) : null}

        {formSuccess ? (
          <p className="mt-4 rounded-md bg-[#f5f1ea] px-2.5 py-1.5 font-store-body text-xs text-[#1a1a1a]">
            {formSuccess}{" "}
            <button
              type="button"
              onClick={() => openAuth("login")}
              className="font-semibold text-[#b8954a] hover:text-[#9a7a3c]"
            >
              Sign in
            </button>
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-end gap-4">
          <StorePrimaryButton
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {isSubmitting ? "Updating…" : "Update password"}
          </StorePrimaryButton>
        </div>
      </form>
    </div>
  );
}
