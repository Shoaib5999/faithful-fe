import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { StorePageShell } from "@/components/storefront/StorePageShell";
import { RevealTitle } from "@/components/storefront/motion/RevealTitle";
import {
  StorePageContainer,
  StorePrimaryLink,
  storePageSectionClass,
  storePanelClass,
} from "@/components/storefront/storefront-ui";
import { cn } from "@/lib/utils";
import { getApiBaseUrl } from "@/config/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification link is invalid.");
      return;
    }

    const verify = async () => {
      try {
        const response = await fetch(
          `${getApiBaseUrl()}/auth/verify-email?token=${encodeURIComponent(token)}`,
        );
        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
          setStatus((prev) => {
            if (prev === "success") return prev;
            return "error";
          });
          setMessage((prev) => {
            if (prev && prev.includes("verified successfully")) return prev;
            return (
              (body as { message?: string }).message ??
              "Verification link is invalid or has expired."
            );
          });
          return;
        }
        setStatus("success");
        setMessage(
          (body as { message?: string }).message ??
            "Email verified successfully. You can now sign in.",
        );
      } catch {
        setStatus("error");
        setMessage("Could not verify your email. Please try again later.");
      }
    };

    void verify();
  }, [token]);

  return (
    <StorePageShell>
      <StorePageContainer
        className={cn(
          storePageSectionClass,
          "flex min-h-[55vh] flex-col items-center justify-center text-center",
        )}
      >
        <div className={cn(storePanelClass, "mx-auto max-w-lg px-8 py-16 md:px-12 md:py-20")}>
          {status === "loading" && (
            <>
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--store-muted)]" />
              <p className="mt-4 font-store-body text-sm text-[var(--store-muted)]">
                Verifying your email…
              </p>
            </>
          )}
          {status === "success" && (
            <>
              <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 className="h-7 w-7 text-[#2d8a4e]" />
              </span>
              <RevealTitle
                as="h1"
                className=" text-2xl font-bold uppercase text-[var(--store-ink)]"
              >
                Email verified
              </RevealTitle>
              <p className="mx-auto mt-3 max-w-sm font-store-body text-sm leading-relaxed text-[var(--store-muted)]">
                {message}
              </p>
              <StorePrimaryLink to="/" className="mt-8 px-10">
                Continue shopping
              </StorePrimaryLink>
            </>
          )}
          {status === "error" && (
            <>
              <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#fef2f2]">
                <XCircle className="h-7 w-7 text-[#c45c5c]" />
              </span>
              <RevealTitle
                as="h1"
                className=" text-2xl font-bold uppercase text-[var(--store-ink)]"
              >
                Verification failed
              </RevealTitle>
              <p className="mx-auto mt-3 max-w-sm font-store-body text-sm leading-relaxed text-[var(--store-muted)]">
                {message}
              </p>
              <Link
                to="/"
                className="mt-8 inline-block font-store-body text-sm font-semibold text-[var(--store-red)] underline-offset-2 transition-colors hover:text-[var(--store-red-dark)] hover:underline"
              >
                Back to home
              </Link>
            </>
          )}
        </div>
      </StorePageContainer>
    </StorePageShell>
  );
}
