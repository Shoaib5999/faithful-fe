import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { StorePageShell } from "@/components/storefront/StorePageShell";
import {
  StoreFormLabel,
  StoreInput,
  StorePageContainer,
  StorePrimaryButton,
  StoreSectionTitle,
  storePageSectionClass,
  storePanelClass,
} from "@/components/storefront/storefront-ui";
import { cn } from "@/lib/utils";
import { useStoreAuthUi } from "@/context/StoreAuthUiContext";
import { validateStorePassword } from "@/lib/store-auth";
import { resetPassword, verifyResetToken } from "@/services/store-auth-service";

type TokenStatus = "verifying" | "invalid" | "valid";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const { openAuth } = useStoreAuthUi();
  const token = searchParams.get("token")?.trim() ?? "";

  const [tokenStatus, setTokenStatus] = useState<TokenStatus>("verifying");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [confirmError, setConfirmError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenStatus("invalid");
      return;
    }

    let cancelled = false;

    const verify = async () => {
      setTokenStatus("verifying");
      try {
        const result = await verifyResetToken(token);
        if (cancelled) return;
        setTokenStatus(result.valid ? "valid" : "invalid");
      } catch {
        if (cancelled) return;
        setTokenStatus("invalid");
      }
    };

    void verify();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const nextPasswordError = validateStorePassword(password, { forSignup: true });
    let nextConfirmError: string | undefined;

    if (!confirmPassword) {
      nextConfirmError = "Please confirm your password.";
    } else if (confirmPassword !== password) {
      nextConfirmError = "Passwords do not match.";
    }

    setPasswordError(nextPasswordError);
    setConfirmError(nextConfirmError);

    if (nextPasswordError || nextConfirmError || !token) return;

    setIsSubmitting(true);

    try {
      const message = await resetPassword(token, password);
      setPassword("");
      setConfirmPassword("");
      setFormSuccess(message);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Could not reset password. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StorePageShell>
      <StorePageContainer className={cn(storePageSectionClass, "mx-auto max-w-lg")}>
        <StoreSectionTitle
          title="Set a new password"
          subtitle="Choose a strong password for your account."
        />

        {tokenStatus === "verifying" ? (
          <div className={cn(storePanelClass, "mt-10 flex flex-col items-center justify-center px-6 py-16 text-center")}>
            <Loader2 className="h-8 w-8 animate-spin text-[var(--store-muted)]" />
            <p className="mt-4 font-store-body text-sm text-[var(--store-muted)]">
              Verifying your reset link…
            </p>
          </div>
        ) : null}

        {tokenStatus === "invalid" ? (
          <div className={cn(storePanelClass, "mt-8 border-red-100 bg-[#fef2f2] p-6 md:p-8")}>
            <p className="font-store-body text-sm text-[#c45c5c]">
              This reset link is invalid or has expired. Request a new link from the sign-in page.
            </p>
            <button
              type="button"
              onClick={() => openAuth("login")}
              className="mt-4 font-store-body text-sm font-semibold text-[var(--store-red)] transition-colors hover:text-[var(--store-red-dark)]"
            >
              Back to sign in
            </button>
          </div>
        ) : null}

        {tokenStatus === "valid" && !formSuccess ? (
          <form
            onSubmit={handleSubmit}
            className={cn(storePanelClass, "mt-8 space-y-5 p-6 md:p-8")}
          >
            <div>
              <StoreFormLabel className="mb-2 block">New password</StoreFormLabel>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--store-muted)]"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <StoreInput
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password"
                  autoComplete="new-password"
                  className="py-3 pl-10 pr-11"
                  aria-invalid={Boolean(passwordError)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1.5 text-[var(--store-muted)] hover:text-[var(--store-ink)]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                  ) : (
                    <Eye className="h-4 w-4" strokeWidth={1.5} />
                  )}
                </button>
              </div>
              {passwordError ? (
                <p className="mt-1.5 font-store-body text-[11px] text-[#c45c5c]">{passwordError}</p>
              ) : null}
            </div>

            <div>
              <StoreFormLabel className="mb-2 block">Confirm password</StoreFormLabel>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--store-muted)]"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <StoreInput
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  className="py-3 pl-10 pr-11"
                  aria-invalid={Boolean(confirmError)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1.5 text-[var(--store-muted)] hover:text-[var(--store-ink)]"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                  ) : (
                    <Eye className="h-4 w-4" strokeWidth={1.5} />
                  )}
                </button>
              </div>
              {confirmError ? (
                <p className="mt-1.5 font-store-body text-[11px] text-[#c45c5c]">{confirmError}</p>
              ) : null}
            </div>

            <p className="font-store-body text-[11px] leading-snug text-[var(--store-muted)]">
              8+ characters with uppercase, lowercase, and number
            </p>

            {formError ? (
              <p className="rounded-md bg-[#fef2f2] px-3 py-2 font-store-body text-sm text-[#c45c5c]">
                {formError}
              </p>
            ) : null}

            <StorePrimaryButton
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Please wait…
                </span>
              ) : (
                "Update password"
              )}
            </StorePrimaryButton>
          </form>
        ) : null}

        {formSuccess ? (
          <div className={cn(storePanelClass, "mt-8 space-y-4 p-6 md:p-8")}>
            <p className="rounded-md bg-[var(--store-cream)] px-3 py-2 font-store-body text-sm text-[var(--store-ink)]">
              {formSuccess}
            </p>
            <button
              type="button"
              onClick={() => openAuth("login")}
              className="font-store-body text-sm font-semibold text-[var(--store-red)] transition-colors hover:text-[var(--store-red-dark)]"
            >
              Sign in
            </button>
          </div>
        ) : null}
      </StorePageContainer>
    </StorePageShell>
  );
}
