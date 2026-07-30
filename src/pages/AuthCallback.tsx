import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { StorePageShell } from "@/components/storefront/StorePageShell";
import { useStoreAuth } from "@/context/StoreAuthContext";
import { completeStoreGoogleSession } from "@/services/store-auth-service";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeAuth } = useStoreAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const authError = searchParams.get("error");
    if (authError) {
      setError("Google sign-in was cancelled or failed. Please try again.");
      return;
    }

    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (!accessToken || !refreshToken) {
      setError("Sign-in link is invalid or expired. Please try again.");
      return;
    }

    let cancelled = false;

    const finish = async () => {
      try {
        const customer = await completeStoreGoogleSession(accessToken, refreshToken);
        if (cancelled) return;
        completeAuth(customer);
        const returnTo = sessionStorage.getItem("faithfulmeat.auth_return") ?? "/";
        sessionStorage.removeItem("faithfulmeat.auth_return");
        navigate(returnTo, { replace: true });
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Could not complete sign-in. Please try again.",
        );
      }
    };

    void finish();

    return () => {
      cancelled = true;
    };
  }, [searchParams, navigate, completeAuth]);

  return (
    <StorePageShell showFooter={false}>
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-20 text-center">
        {error ? (
          <>
            <p className="font-store-body text-sm text-[#c45c5c]">{error}</p>
            <Link
              to="/"
              className="mt-6 inline-block bg-[#1a1a1a] px-6 py-2.5 font-store-body text-xs font-semibold uppercase tracking-[0.14em] text-white"
            >
              Back to shop
            </Link>
          </>
        ) : (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-[#6b6b6b]" />
            <p className="mt-4 font-store-body text-sm text-[#6b6b6b]">Signing you in…</p>
          </>
        )}
      </div>
    </StorePageShell>
  );
}
