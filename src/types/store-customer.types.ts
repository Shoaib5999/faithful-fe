export type StoreCustomer = {
  name: string;
  phone: string;
  email: string;
  address: string;
};

export type StoreAuthMode = "login" | "signup";

export type StoreCustomerField = keyof StoreCustomer;

export type StoreCustomerFieldErrors = Partial<Record<StoreCustomerField, string>>;

export type StoreAuthFormInput = {
  name: string;
  phone: string;
  email: string;
  address: string;
};
