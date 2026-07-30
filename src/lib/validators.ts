export const isValidEmail = (value: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

export const isValidPhone = (value: string): boolean => {
  return /^\+?[\d\s-()]{7,15}$/.test(value);
};

export const isValidHex = (value: string): boolean => {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
};

export const isValidUrl = (value: string): boolean => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

export const isValidSlug = (value: string): boolean => {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
};

export const isRequired = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

export const isPositiveNumber = (value: number): boolean => {
  return typeof value === "number" && !isNaN(value) && value > 0;
};

export const isWithinRange = (value: number, min: number, max: number): boolean => {
  return typeof value === "number" && !isNaN(value) && value >= min && value <= max;
};
