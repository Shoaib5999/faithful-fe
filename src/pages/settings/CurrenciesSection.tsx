import React from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCurrency } from "@/hooks/useCurrency";
import { useModal } from "@/hooks/useModal";
import { Plus, Pencil, Trash2 } from "lucide-react";

export const CurrenciesSection: React.FC = () => {
  const { currencies, confirmDelete } = useCurrency();
  const { openModal } = useModal();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Currency" 
      // actions={
      // <Button size="sm" onClick={() => openModal("CurrencyCreateEdit", {})}>
      //   <Plus className="mr-1 h-4 w-4" /> Add Currency
      // </Button>
      // } 
      />
      {currencies.length === 0 ? (
        <EmptyState title="No currencies" description="Add your first currency" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currencies.map((currency) => (
            <SectionCard key={currency.id}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary text-lg font-bold shrink-0">
                  {currency.symbol}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{currency.code}</span>
                    {currency.isDefault && <Badge variant="secondary">Default</Badge>}
                    {currency.isActive && <Badge variant="outline">Active</Badge>}
                  </div>
                  <span className="text-sm text-muted-foreground">{currency.name}</span>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Position: {currency.symbolPosition} · Dec: &quot;{currency.decimalSeparator}&quot; · Thou: &quot;{currency.thousandSeparator}&quot;
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => openModal("CurrencyCreateEdit", { currency })}><Pencil className="h-4 w-4" /></Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button variant="ghost" size="icon" disabled={currency.isDefault} onClick={() => confirmDelete(currency)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </span>
                    </TooltipTrigger>
                    {currency.isDefault && <TooltipContent>Cannot delete the default currency</TooltipContent>}
                  </Tooltip>
                </div>
              </div>
            </SectionCard>
          ))}
        </div>
      )}
    </div>
  );
};