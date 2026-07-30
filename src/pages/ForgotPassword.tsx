import { useState, type FormEvent } from "react";
import { Loader2, Mail } from "lucide-react";
import { Link } from "react-router-dom";
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
import { validateStoreEmail } from "@/lib/store-auth";
import { forgotPassword } from "@/services/store-auth-service";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const nextEmailError = validateStoreEmail(email, true);
    setEmailError(nextEmailError);
    if (nextEmailError) return;

    setIsSubmitting(true);

    try {
      const message = await forgotPassword(email);
      setFormSuccess(message);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StorePageShell>
      <StorePageContainer className={cn(storePageSectionClass, "mx-auto max-w-md")}>
        <StoreSectionTitle
          title="Reset password"
          subtitle="Enter your email and we will send you a link to reset your password."
        />

        <form
          onSubmit={handleSubmit}
          className={cn(storePanelClass, "mt-8 space-y-5 p-6 md:p-8")}
        >
          <div>
            <StoreFormLabel className="mb-2 block">Email</StoreFormLabel>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--store-muted)]"
                strokeWidth={1.5}
                aria-hidden
              />
              <StoreInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="py-3 pl-10"
                aria-invalid={Boolean(emailError)}
              />
            </div>
            {emailError ? (
              <p className="mt-1.5 font-store-body text-[11px] text-[#c45c5c]">{emailError}</p>
            ) : null}
          </div>

          {formError ? (
            <p className="rounded-md bg-[#fef2f2] px-3 py-2 font-store-body text-sm text-[#c45c5c]">
              {formError}
            </p>
          ) : null}

          {formSuccess ? (
            <p className="rounded-md bg-[var(--store-cream)] px-3 py-2 font-store-body text-sm text-[var(--store-ink)]">
              {formSuccess}
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
              "Send reset link"
            )}
          </StorePrimaryButton>
        </form>

        <p className="mt-8 text-center font-store-body text-sm text-[var(--store-muted)]">
          <Link
            to="/"
            className="font-semibold text-[var(--store-red)] transition-colors hover:text-[var(--store-red-dark)]"
          >
            Back to shop
          </Link>
        </p>
      </StorePageContainer>
    </StorePageShell>
  );
}
