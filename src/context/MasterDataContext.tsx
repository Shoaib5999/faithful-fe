import React, { createContext, useState, useEffect, useCallback, useMemo } from "react";
import type { Unit, Brand, Category, Attribute, OrderStatus, TaxClass, Currency } from "@/types/master.types";
import type { PaymentMode } from "@/types/commerce.types";
import { fetchUnits } from "@/services/unit-service";
import { fetchBrands } from "@/services/brand-service";
import { fetchCategories } from "@/services/category-service";
import { fetchAttributes } from "@/services/attribute-service";
import { fetchOrderStatuses } from "@/services/order-status-service";
import { fetchTaxClasses } from "@/services/tax-class-service";
import { fetchCurrencies } from "@/services/currency-service";
import { fetchAdminPaymentModes } from "@/services/payment-mode-service";

interface MasterDataStore {
  units: Unit[];
  brands: Brand[];
  categories: Category[];
  attributes: Attribute[];
  orderStatuses: OrderStatus[];
  taxClasses: TaxClass[];
  currencies: Currency[];
  paymentModes: PaymentMode[];
  isLoading: boolean;
}

interface MasterDataContextValue extends MasterDataStore {
  setUnits: (units: Unit[]) => void;
  setBrands: (brands: Brand[]) => void;
  setCategories: (categories: Category[]) => void;
  setAttributes: (attributes: Attribute[]) => void;
  setOrderStatuses: (orderStatuses: OrderStatus[]) => void;
  setTaxClasses: (taxClasses: TaxClass[]) => void;
  setCurrencies: (currencies: Currency[]) => void;
  setPaymentModes: (paymentModes: PaymentMode[]) => void;
}

export const MasterDataContext = createContext<MasterDataContextValue | null>(null);

export const MasterDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [orderStatuses, setOrderStatuses] = useState<OrderStatus[]>([]);
  const [taxClasses, setTaxClasses] = useState<TaxClass[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchUnits(),
      fetchBrands(),
      fetchCategories(),
      fetchAttributes(),
      fetchOrderStatuses(),
      fetchTaxClasses(),
      fetchCurrencies(),
      fetchAdminPaymentModes(),
    ]).then(([u, b, c, a, os, tc, cu, pm]) => {
      setUnits(u);
      setBrands(b);
      setCategories(c);
      setAttributes(a);
      setOrderStatuses(os);
      setTaxClasses(tc);
      setCurrencies(cu);
      setPaymentModes(pm);
      setIsLoading(false);
    }).catch((err) => {
      console.error("Master data load failed:", err);
      setIsLoading(false);
    });
  }, []);

  const stableSetUnits = useCallback((v: Unit[]) => setUnits(v), []);
  const stableSetBrands = useCallback((v: Brand[]) => setBrands(v), []);
  const stableSetCategories = useCallback((v: Category[]) => setCategories(v), []);
  const stableSetAttributes = useCallback((v: Attribute[]) => setAttributes(v), []);
  const stableSetOrderStatuses = useCallback((v: OrderStatus[]) => setOrderStatuses(v), []);
  const stableSetTaxClasses = useCallback((v: TaxClass[]) => setTaxClasses(v), []);
  const stableSetCurrencies = useCallback((v: Currency[]) => setCurrencies(v), []);
  const stableSetPaymentModes = useCallback((v: PaymentMode[]) => setPaymentModes(v), []);

  const value = useMemo<MasterDataContextValue>(
    () => ({
      units,
      brands,
      categories,
      attributes,
      orderStatuses,
      taxClasses,
      currencies,
      paymentModes,
      isLoading,
      setUnits: stableSetUnits,
      setBrands: stableSetBrands,
      setCategories: stableSetCategories,
      setAttributes: stableSetAttributes,
      setOrderStatuses: stableSetOrderStatuses,
      setTaxClasses: stableSetTaxClasses,
      setCurrencies: stableSetCurrencies,
      setPaymentModes: stableSetPaymentModes,
    }),
    [
      units,
      brands,
      categories,
      attributes,
      orderStatuses,
      taxClasses,
      currencies,
      paymentModes,
      isLoading,
      stableSetUnits,
      stableSetBrands,
      stableSetCategories,
      stableSetAttributes,
      stableSetOrderStatuses,
      stableSetTaxClasses,
      stableSetCurrencies,
      stableSetPaymentModes,
    ],
  );

  return (
    <MasterDataContext.Provider value={value}>
      {children}
    </MasterDataContext.Provider>
  );
};
