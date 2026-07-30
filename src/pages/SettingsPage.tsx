import React from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { PermissionGate } from "@/components/common/PermissionGate";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnitsSection } from "@/pages/settings/UnitsSection";
import { BrandsSection } from "@/pages/settings/BrandsSection";
import { CategoriesSection } from "@/pages/settings/CategoriesSection";
import { AttributesSection } from "@/pages/settings/AttributesSection";
import { OrderStatusesSection } from "@/pages/settings/OrderStatusesSection";
import { TaxClassesSection } from "@/pages/settings/TaxClassesSection";
import { CurrenciesSection } from "@/pages/settings/CurrenciesSection";
import { PaymentModesSection } from "@/pages/settings/PaymentModesSection";
import { ShippingSection } from "@/pages/settings/ShippingSection";
import { CutTypesSection } from "@/pages/settings/CutTypesSection";

const SETTINGS_TABS = [
  { value: "units", label: "Units" },
  { value: "brands", label: "Brands" },
  { value: "categories", label: "Categories" },
  { value: "cut-types", label: "Cut Types" },
  // { value: "attributes", label: "Attributes" },
  // { value: "order-statuses", label: "Order Statuses" },
  { value: "tax-classes", label: "Tax Classes" },
  { value: "payment-modes", label: "Payment Modes" },
  { value: "shipping", label: "Shipping" },
  { value: "currency", label: "Currency" },
];

const SettingsPage: React.FC = () => (
  <PageWrapper>
    <PermissionGate moduleKey="settings" operation="manage" fallback={<EmptyState title="Access Denied" description="You do not have permission to access this section." />}>
      <PageHeader title="Settings" subtitle="Manage your master configuration data" />
      <Tabs defaultValue="units" className="mt-4">
        <TabsList className="w-full justify-start overflow-x-auto scrollbar-hide gap-1 bg-transparent h-auto p-0 border-b border-border rounded-none">
          {SETTINGS_TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-2"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="units" className="mt-6"><UnitsSection /></TabsContent>
        <TabsContent value="brands" className="mt-6"><BrandsSection /></TabsContent>
        <TabsContent value="categories" className="mt-6"><CategoriesSection /></TabsContent>
        <TabsContent value="cut-types" className="mt-6"><CutTypesSection /></TabsContent>
        {/* <TabsContent value="attributes" className="mt-6"><AttributesSection /></TabsContent> */}
        {/* <TabsContent value="order-statuses" className="mt-6"><OrderStatusesSection /></TabsContent> */}
        <TabsContent value="tax-classes" className="mt-6"><TaxClassesSection /></TabsContent>
        <TabsContent value="payment-modes" className="mt-6"><PaymentModesSection /></TabsContent>
        <TabsContent value="shipping" className="mt-6"><ShippingSection /></TabsContent>
        <TabsContent value="currency" className="mt-6"><CurrenciesSection /></TabsContent>
      </Tabs>
    </PermissionGate>
  </PageWrapper>
);

export default SettingsPage;