import {
  STORE_AUTH_ADDRESS_MAX,
  STORE_AUTH_ADDRESS_MIN,
  STORE_AUTH_PLACEHOLDER_NAMES,
  STORE_AUTH_EMAIL_MAX,
  STORE_AUTH_EMAIL_REGEX,
  STORE_AUTH_NAME_MAX,
  STORE_AUTH_NAME_MIN,
  STORE_AUTH_NAME_REGEX,
  STORE_AUTH_PHONE_DIGITS,
  STORE_AUTH_PHONE_REGEX,
  STORE_AUTH_STORAGE_KEY,
  STORE_AUTH_STORAGE_KEY_LEGACY,
} from "@/constants/store-auth.constants";
import type {
  StoreAuthFormInput,
  StoreAuthMode,
  StoreCustomer,
  StoreCustomerFieldErrors,
} from "@/types/store-customer.types";

export const EMPTY_STORE_CUSTOMER: StoreCustomer = {
  name: "",
  phone: "",
  email: "",
  address: "",
};

export const coerceStoreString = (value: unknown): string => {
  if (value == null) return "";
  const trimmed = String(value).trim();
  if (trimmed === "null" || trimmed === "undefined") return "";
  return trimmed;
};

export const normalizeStorePhone = (value: unknown): string =>
  coerceStoreString(value).replace(/\D/g, "").slice(-STORE_AUTH_PHONE_DIGITS);

export const isPlaceholderStoreName = (name: unknown): boolean => {
  const trimmed = coerceStoreString(name);
  if (!trimmed) return false;
  return STORE_AUTH_PLACEHOLDER_NAMES.some(
    (placeholder) => placeholder.toLowerCase() === trimmed.toLowerCase(),
  );
};

/** For profile/auth form inputs — hides legacy placeholder strings only */
export const toProfileFormName = (name: unknown): string => {
  const trimmed = coerceStoreString(name);
  return isPlaceholderStoreName(trimmed) ? "" : trimmed;
};

export const sanitizeStoredName = (name: unknown): string => {
  const trimmed = coerceStoreString(name);
  return isPlaceholderStoreName(trimmed) ? "" : trimmed;
};

export const pickStoreCustomerName = (...candidates: Array<unknown>): string => {
  for (const candidate of candidates) {
    const name = sanitizeStoredName(candidate);
    if (name) return name;
  }
  return "";
};

export const formatStorePhone = (phone: string): string => {
  const digits = normalizeStorePhone(phone);
  return digits ? `+91 ${digits}` : "";
};

export const getCustomerFirstName = (name: unknown): string => {
  const trimmed = sanitizeStoredName(name);
  if (!trimmed) return "there";
  return trimmed.split(/\s+/)[0] ?? trimmed;
};

const readNameFromRecord = (record: Record<string, unknown>): string =>
  sanitizeStoredName(
    record.name ?? record.fullName ?? record.full_name ?? record.displayName,
  );

/** Build a customer record for storage — preserves real names */
export const buildStoreCustomer = (input: {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  address?: unknown;
}): StoreCustomer | null => {
  const phone = normalizeStorePhone(input.phone);
  const email = coerceStoreString(input.email).toLowerCase();
  const name = sanitizeStoredName(input.name);

  if (!phone && !email) return null;

  return {
    name,
    phone,
    email,
    address: coerceStoreString(input.address),
  };
};

export const normalizeStoreCustomer = (raw: unknown): StoreCustomer | null => {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  return buildStoreCustomer({
    name: readNameFromRecord(record),
    phone: record.phone,
    email: record.email,
    address: record.address,
  });
};

export const validateStoreName = (name: unknown, isRequired = true): string | null => {
  const trimmed = coerceStoreString(name);

  if (!trimmed) {
    return isRequired ? "Full name is required." : null;
  }

  if (trimmed.length < STORE_AUTH_NAME_MIN) {
    return `Name must be at least ${STORE_AUTH_NAME_MIN} characters.`;
  }

  if (trimmed.length > STORE_AUTH_NAME_MAX) {
    return `Name must be under ${STORE_AUTH_NAME_MAX} characters.`;
  }

  if (!STORE_AUTH_NAME_REGEX.test(trimmed)) {
    return "Name can only include letters, spaces, and . ' -";
  }

  return null;
};

export const validateStorePhone = (phone: unknown, isRequired = true): string | null => {
  const digits = normalizeStorePhone(phone);

  if (!digits) {
    return isRequired ? "Mobile number is required." : null;
  }

  if (!STORE_AUTH_PHONE_REGEX.test(digits)) {
    return `Enter a valid ${STORE_AUTH_PHONE_DIGITS}-digit Indian mobile number.`;
  }

  return null;
};

/** Signup: 8+ chars, upper, lower, digit. Login: backend min 6. */
export const validateStorePassword = (
  password: unknown,
  options: { forSignup?: boolean } = {},
): string | null => {
  const value = coerceStoreString(password);
  if (!value) return "Password is required.";

  if (options.forSignup) {
    if (value.length < 8) {
      return "Password must be at least 8 characters.";
    }
    if (!/[A-Z]/.test(value)) {
      return "Include at least one uppercase letter.";
    }
    if (!/[a-z]/.test(value)) {
      return "Include at least one lowercase letter.";
    }
    if (!/\d/.test(value)) {
      return "Include at least one number.";
    }
    return null;
  }

  if (value.length < 6) {
    return "Password must be at least 6 characters.";
  }

  return null;
};

export const validateStoreEmail = (email: unknown, isRequired = true): string | null => {
  const trimmed = coerceStoreString(email).toLowerCase();

  if (!trimmed) {
    return isRequired ? "Email address is required." : null;
  }

  if (trimmed.length > STORE_AUTH_EMAIL_MAX) {
    return `Email must be under ${STORE_AUTH_EMAIL_MAX} characters.`;
  }

  if (!STORE_AUTH_EMAIL_REGEX.test(trimmed)) {
    return "Enter a valid email address.";
  }

  return null;
};

export const validateStoreAddress = (address: unknown, isRequired = true): string | null => {
  const trimmed = coerceStoreString(address);

  if (!trimmed) {
    return isRequired ? "Delivery address is required." : null;
  }

  if (trimmed.length < STORE_AUTH_ADDRESS_MIN) {
    return `Address must be at least ${STORE_AUTH_ADDRESS_MIN} characters.`;
  }

  if (trimmed.length > STORE_AUTH_ADDRESS_MAX) {
    return `Address must be under ${STORE_AUTH_ADDRESS_MAX} characters.`;
  }

  return null;
};

export const validateStoreAuthForm = (
  input: StoreAuthFormInput,
  mode: StoreAuthMode,
  existing: StoreCustomer | null = null,
): { isValid: boolean; errors: StoreCustomerFieldErrors; customer: StoreCustomer | null } => {
  const errors: StoreCustomerFieldErrors = {};
  const isSignup = mode === "signup";
  const isNameRequired = isSignup;

  const nameError = validateStoreName(input.name, isNameRequired);
  const phoneError = validateStorePhone(input.phone, true);
  const emailError = validateStoreEmail(input.email, isSignup);
  const addressError = validateStoreAddress(input.address, isSignup);

  if (nameError) errors.name = nameError;
  if (phoneError) errors.phone = phoneError;
  if (emailError) errors.email = emailError;
  if (addressError) errors.address = addressError;

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors, customer: null };
  }

  const phone = normalizeStorePhone(input.phone);
  const enteredName = sanitizeStoredName(input.name);
  const resolvedName = isSignup
    ? enteredName
    : pickStoreCustomerName(
        existing?.phone === phone ? existing.name : "",
        enteredName,
      );

  return {
    isValid: true,
    errors: {},
    customer: buildStoreCustomer({
      name: resolvedName,
      phone,
      email: input.email,
      address: input.address,
    }),
  };
};

export const validateStoreCustomerProfile = (
  input: StoreCustomer,
): { isValid: boolean; errors: StoreCustomerFieldErrors; customer: StoreCustomer | null } => {
  const errors: StoreCustomerFieldErrors = {};

  const nameError = validateStoreName(input.name, false);
  const phoneError = validateStorePhone(input.phone, false);
  const emailError = validateStoreEmail(input.email, false);
  const addressError = validateStoreAddress(input.address, false);

  if (nameError) errors.name = nameError;
  if (phoneError) errors.phone = phoneError;
  if (emailError) errors.email = emailError;
  if (addressError) errors.address = addressError;

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors, customer: null };
  }

  const customer = buildStoreCustomer({
    name: coerceStoreString(input.name),
    phone: input.phone,
    email: input.email,
    address: input.address,
  });

  if (!customer && Object.keys(errors).length === 0) {
    return {
      isValid: false,
      errors: { email: "Add an email or mobile number to save your profile." },
      customer: null,
    };
  }

  return { isValid: Boolean(customer), errors, customer };
};

export const pickPhoneFromAddresses = (
  addresses: Array<{ phone?: string; isDefault?: boolean }>,
): string => {
  const preferred =
    addresses.find((address) => address.isDefault) ?? addresses[0];
  return preferred?.phone ? normalizeStorePhone(preferred.phone) : "";
};

export const mergeStoreCustomerPhoneFromAddresses = (
  customer: StoreCustomer,
  addresses: Array<{ phone?: string; isDefault?: boolean }>,
): StoreCustomer => {
  if (normalizeStorePhone(customer.phone)) return customer;

  const phone = pickPhoneFromAddresses(addresses);
  if (!phone) return customer;

  return buildStoreCustomer({ ...customer, phone }) ?? customer;
};

export const mergeStoreCustomerOnLogin = (
  submitted: StoreCustomer,
  existing: StoreCustomer | null,
): StoreCustomer => {
  const phone = normalizeStorePhone(submitted.phone);
  const base = buildStoreCustomer({ ...submitted, phone });
  if (!base) return submitted;

  if (!existing || existing.phone !== phone) {
    return base;
  }

  return buildStoreCustomer({
    name: pickStoreCustomerName(existing.name, submitted.name),
    phone,
    email: submitted.email || existing.email,
    address: submitted.address || existing.address,
  }) ?? base;
};

export const getStoreCustomer = (): StoreCustomer | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw =
      localStorage.getItem(STORE_AUTH_STORAGE_KEY) ??
      localStorage.getItem(STORE_AUTH_STORAGE_KEY_LEGACY);

    if (!raw) return null;

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const customer = normalizeStoreCustomer(parsed);
    if (!customer) return null;

    const rawName = coerceStoreString(
      parsed.name ?? parsed.fullName ?? parsed.full_name ?? parsed.displayName,
    );

    if (
      isPlaceholderStoreName(rawName) ||
      !localStorage.getItem(STORE_AUTH_STORAGE_KEY) ||
      rawName !== customer.name
    ) {
      saveStoreCustomer(customer);
      localStorage.removeItem(STORE_AUTH_STORAGE_KEY_LEGACY);
    }

    return customer;
  } catch {
    return null;
  }
};

export const saveStoreCustomer = (customer: StoreCustomer): void => {
  const built = buildStoreCustomer(customer);
  if (!built) return;
  localStorage.setItem(STORE_AUTH_STORAGE_KEY, JSON.stringify(built));
};

export const clearStoreCustomer = (): void => {
  localStorage.removeItem(STORE_AUTH_STORAGE_KEY);
  localStorage.removeItem(STORE_AUTH_STORAGE_KEY_LEGACY);
};

export const isValidStorePhone = (digits: string): boolean =>
  STORE_AUTH_PHONE_REGEX.test(normalizeStorePhone(digits));

export const isValidMockOtp = (otp: string): boolean =>
  /^\d{6}$/.test(otp.replace(/\D/g, ""));
