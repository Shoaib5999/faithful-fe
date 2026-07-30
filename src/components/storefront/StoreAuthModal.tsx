import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail, User, X } from "lucide-react";
import {
  StoreFormLabel,
  StoreInput,
  StoreModalPortal,
  StorePrimaryButton,
  storePanelClass,
  useStoreBodyScrollLock,
} from "@/components/storefront/storefront-ui";
import { getStoreGoogleAuthUrl } from "@/constants/store-auth.constants";
import { useStoreAuth } from "@/context/StoreAuthContext";
import { useNotification } from "@/hooks/useNotification";
import { validateStoreEmail, validateStoreName, validateStorePassword } from "@/lib/store-auth";
import {
  loginStoreWithEmail,
  registerStoreWithEmail,
  resendVerificationEmail,
  forgotPassword,
} from "@/services/store-auth-service";
import { cn } from "@/lib/utils";

type StoreAuthModalProps = {
  open: boolean;
  onClose: () => void;
  initialView?: AuthView;
};

type AuthView = "login" | "signup" | "forgot";

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

const COPY: Record<AuthView, { title: string; subtitle: string; submit: string }> = {
  login: {
    title: "Welcome back",
    subtitle: "Sign in to your account to continue",
    submit: "Sign in",
  },
  signup: {
    title: "Create account",
    subtitle: "Enter your details to create your account",
    submit: "Create account",
  },
  forgot: {
    title: "Reset password",
    subtitle: "We will email you a link to reset your password",
    submit: "Send reset link",
  },
};

const compactInputClass = "py-3 pl-10 pr-3 text-sm placeholder:text-[var(--store-muted)]/60";

function AuthField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
  autoComplete,
  trailing,
  className,
}: {
  id: string;
  label?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon: typeof Mail;
  error?: string;
  autoComplete?: string;
  trailing?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {label ? <StoreFormLabel className="mb-2 block">{label}</StoreFormLabel> : null}
      <div className="relative">
        <Icon
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--store-muted)]"
          strokeWidth={1.5}
          aria-hidden
        />
        <StoreInput
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={cn(compactInputClass, trailing ? "pr-9" : undefined)}
          aria-invalid={Boolean(error)}
        />
        {trailing ? (
          <div className="absolute right-0.5 top-1/2 -translate-y-1/2">{trailing}</div>
        ) : null}
      </div>
      {error ? (
        <p className="mt-1 font-store-body text-[11px] leading-snug text-[#c45c5c]">{error}</p>
      ) : null}
    </div>
  );
}

function PasswordToggle({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="rounded p-1.5 text-[var(--store-muted)] transition-colors hover:text-[var(--store-ink)]"
      aria-label={visible ? "Hide password" : "Show password"}
    >
      {visible ? (
        <EyeOff className="h-4 w-4" strokeWidth={1.5} />
      ) : (
        <Eye className="h-4 w-4" strokeWidth={1.5} />
      )}
    </button>
  );
}

export function StoreAuthModal({ open, onClose, initialView = "login" }: StoreAuthModalProps) {
  const { completeAuth } = useStoreAuth();
  const { notify } = useNotification();
  const [view, setView] = useState<AuthView>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setView("login");
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFieldErrors({});
    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (!open) {
      resetForm();
      return;
    }

    setView(initialView);
    setFieldErrors({});
    setFormError(null);
    setFormSuccess(null);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, initialView]);

  useStoreBodyScrollLock(open);

  if (!open) return null;

  const copy = COPY[view];

  const handleGoogleLogin = () => {
    sessionStorage.setItem(
      "faithfulmeat.auth_return",
      `${window.location.pathname}${window.location.search}`,
    );
    window.location.href = getStoreGoogleAuthUrl();
  };

  const validateFields = (): boolean => {
    const errors: FieldErrors = {};
    const emailError = validateStoreEmail(email, true);
    if (emailError) errors.email = emailError;

    if (view === "signup") {
      const nameError = validateStoreName(name, true);
      if (nameError) errors.name = nameError;

      const passwordError = validateStorePassword(password, { forSignup: true });
      if (passwordError) errors.password = passwordError;

      if (!confirmPassword) {
        errors.confirmPassword = "Please confirm your password.";
      } else if (confirmPassword !== password) {
        errors.confirmPassword = "Passwords do not match.";
      }
    } else if (view === "login") {
      const passwordError = validateStorePassword(password);
      if (passwordError) errors.password = passwordError;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!validateFields()) return;

    setIsSubmitting(true);

    try {
      if (view === "forgot") {
        const message = await forgotPassword(email);
        setFormSuccess(message);
        return;
      }

      if (view === "signup") {
        const result = await registerStoreWithEmail(name, email, password);
        notify(
          result.message ??
            "Account created. Please check your email to verify your account before signing in.",
          "success",
        );
        switchView("login");
        return;
      }

      const customer = await loginStoreWithEmail(email, password);
      completeAuth(customer);
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setFormError(message);
      if (view === "login" && message.toLowerCase().includes("verify your email")) {
        setFormSuccess(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchView = (next: AuthView) => {
    setView(next);
    setFieldErrors({});
    setFormError(null);
    setFormSuccess(null);
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <StoreModalPortal>
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="store-auth-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
      />

      <div
        className={cn(
          storePanelClass,
          "relative z-10 flex max-h-[min(92vh,640px)] w-full max-w-[520px] flex-col overflow-hidden rounded-xl shadow-[var(--store-shadow-lg)]",
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-[var(--store-muted)] transition-colors hover:bg-[var(--store-cream)] hover:text-[var(--store-ink)]"
          aria-label="Close"
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>

        <div className="shrink-0 border-b border-black/10 px-6 pb-5 pt-7 text-center md:px-8 md:pt-8">
          <h2
            id="store-auth-title"
            className=" text-xl font-bold tracking-wide text-[var(--store-ink)] md:text-2xl"
          >
            {copy.title}
          </h2>
          <p className="mt-2 font-store-body text-sm text-[var(--store-muted)]">{copy.subtitle}</p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 md:px-8 md:py-6">
          {view !== "forgot" ? (
            <>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex w-full items-center justify-center gap-2.5 rounded-md border border-black/15 bg-white px-4 py-3 font-store-body text-sm font-medium text-[var(--store-ink)] transition-colors hover:bg-[var(--store-cream)]"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt=""
                  className="h-4 w-4"
                />
                Continue with Google
              </button>

              <div className="my-4 flex items-center gap-2.5">
                <div className="h-px flex-1 bg-black/10" />
                <span className="shrink-0 font-store-body text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--store-muted)]">
                  Or continue with email
                </span>
                <div className="h-px flex-1 bg-black/10" />
              </div>
            </>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            {view === "signup" ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <AuthField
                  id="store-auth-name"
                  label="Full name"
                  value={name}
                  onChange={setName}
                  placeholder="Full name"
                  icon={User}
                  error={fieldErrors.name}
                  autoComplete="name"
                />
                <AuthField
                  id="store-auth-email"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="Email address"
                  icon={Mail}
                  error={fieldErrors.email}
                  autoComplete="email"
                />
              </div>
            ) : (
              <AuthField
                id="store-auth-email"
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="Enter your email"
                icon={Mail}
                error={fieldErrors.email}
                autoComplete="email"
              />
            )}

            {view !== "forgot" ? (
              view === "signup" ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <StoreFormLabel className="mb-2 block">Password</StoreFormLabel>
                      <AuthField
                        id="store-auth-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={setPassword}
                        placeholder="Password"
                        icon={Lock}
                        error={fieldErrors.password}
                        autoComplete="new-password"
                        trailing={
                          <PasswordToggle
                            visible={showPassword}
                            onToggle={() => setShowPassword((v) => !v)}
                          />
                        }
                      />
                    </div>
                    <AuthField
                      id="store-auth-confirm-password"
                      label="Confirm password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      placeholder="Confirm"
                      icon={Lock}
                      error={fieldErrors.confirmPassword}
                      autoComplete="new-password"
                      trailing={
                        <PasswordToggle
                          visible={showConfirmPassword}
                          onToggle={() => setShowConfirmPassword((v) => !v)}
                        />
                      }
                    />
                  </div>
                  <p className="font-store-body text-[11px] leading-snug text-[var(--store-muted)]">
                    8+ characters with uppercase, lowercase, and number
                  </p>
                </div>
              ) : (
                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <StoreFormLabel>Password</StoreFormLabel>
                    <button
                      type="button"
                      onClick={() => switchView("forgot")}
                      className="font-store-body text-[11px] font-medium text-[var(--store-red)] transition-colors hover:text-[var(--store-red-dark)]"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <AuthField
                    id="store-auth-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={setPassword}
                    placeholder="Enter your password"
                    icon={Lock}
                    error={fieldErrors.password}
                    autoComplete="current-password"
                    trailing={
                      <PasswordToggle
                        visible={showPassword}
                        onToggle={() => setShowPassword((v) => !v)}
                      />
                    }
                  />
                </div>
              )
            ) : null}

            {formError ? (
              <div className="rounded-md bg-[#fef2f2] px-3 py-2 font-store-body text-sm text-[#c45c5c]">
                <p>{formError}</p>
                {view === "login" && formError.toLowerCase().includes("verify your email") ? (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={async () => {
                      const emailError = validateStoreEmail(email, true);
                      if (emailError) {
                        setFieldErrors({ email: emailError });
                        return;
                      }
                      setIsSubmitting(true);
                      try {
                        const message = await resendVerificationEmail(email);
                        setFormSuccess(message);
                        setFormError(null);
                      } catch (err) {
                        setFormError(
                          err instanceof Error
                            ? err.message
                            : "Could not resend verification email.",
                        );
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    className="mt-2 cursor-pointer font-semibold text-[var(--store-red)] underline underline-offset-2"
                  >
                    Resend verification email
                  </button>
                ) : null}
              </div>
            ) : null}

            {formSuccess ? (
              <p className="rounded-md bg-[var(--store-cream)] px-3 py-2 font-store-body text-sm text-[var(--store-ink)]">
                {formSuccess}
              </p>
            ) : null}

            <StorePrimaryButton type="submit" disabled={isSubmitting} className="w-full py-3">
              {isSubmitting ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Please wait…
                </span>
              ) : (
                copy.submit
              )}
            </StorePrimaryButton>
          </form>

          <p className="mt-5 text-center font-store-body text-sm text-[var(--store-muted)]">
            {view === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchView("signup")}
                  className="font-semibold text-[var(--store-red)] transition-colors hover:text-[var(--store-red-dark)]"
                >
                  Sign up
                </button>
              </>
            ) : view === "signup" ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchView("login")}
                  className="font-semibold text-[var(--store-red)] transition-colors hover:text-[var(--store-red-dark)]"
                >
                  Sign in
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => switchView("login")}
                className="font-semibold text-[#b8954a] transition-colors hover:text-[#9a7a3c]"
              >
                Back to sign in
              </button>
            )}
          </p>
        </div>
      </div>
    </div>
    </StoreModalPortal>
  );
}
