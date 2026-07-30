import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, MapPin, Pencil, Trash2, Star, Loader2 } from "lucide-react";
import { StoreAddressFormModal, storeAddressFormFromApi } from "@/components/storefront/StoreAddressFormModal";
import { StoreConfirmModal } from "@/components/storefront/StoreConfirmModal";
import {
  StorePrimaryButton,
  StoreSectionTitle,
  storePanelClass,
} from "@/components/storefront/storefront-ui";
import { getErrorMessage } from "@/lib/error";
import { cn } from "@/lib/utils";
import {
  deleteStoreAddress,
  fetchStoreAddresses,
  setDefaultStoreAddress,
  type StoreAddressApi,
} from "@/services/store-address-service";
import { useNotification } from "@/hooks/useNotification";

export default function AccountAddresses() {
  const { notify } = useNotification();
  const queryClient = useQueryClient();
  const { data: addresses = [], isPending } = useQuery({
    queryKey: ["addresses", "mine"],
    queryFn: fetchStoreAddresses,
  });

  const [editing, setEditing] = useState<StoreAddressApi | "new" | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<StoreAddressApi | null>(null);
  const [deleting, setDeleting] = useState(false);

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ["addresses", "mine"] });

  const setDefault = async (id: string) => {
    try {
      await setDefaultStoreAddress(id);
      notify("Default address updated.", "success");
      invalidate();
    } catch (e) {
      notify(getErrorMessage(e), "error");
    }
  };

  const remove = async () => {
    if (!addressToDelete) return;

    setDeleting(true);
    try {
      await deleteStoreAddress(addressToDelete.id);
      notify("Address removed.", "success");
      invalidate();
      setAddressToDelete(null);
    } catch (e) {
      notify(getErrorMessage(e), "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <StoreSectionTitle
          title="Addresses"
          subtitle="Manage where your orders are delivered."
          className="mb-0"
        />
        <StorePrimaryButton
          type="button"
          onClick={() => setEditing("new")}
          className="inline-flex shrink-0 items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          New address
        </StorePrimaryButton>
      </div>

      {isPending ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--store-muted)]" aria-hidden />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <article
              key={address.id}
              className={cn(
                storePanelClass,
                "group relative p-5 transition-[border-color,box-shadow] duration-200 md:p-6",
                address.isDefault
                  ? "border-[var(--store-red)] bg-[#fffdf8] shadow-[var(--store-shadow-sm)]"
                  : "hover:border-black/20 hover:shadow-[var(--store-shadow-sm)]",
              )}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <MapPin className="h-4 w-4 text-[var(--store-red)]" />
                  <span className="font-store-body text-xs font-semibold uppercase tracking-wide text-[var(--store-muted)]">
                    {address.label}
                  </span>
                  {address.isDefault ? (
                    <span className="inline-flex items-center gap-1 rounded-sm bg-[var(--store-ink)] px-2 py-0.5 font-store-body text-[9px] font-semibold uppercase tracking-wide text-white">
                      <Star className="h-2.5 w-2.5 fill-white" />
                      Default
                    </span>
                  ) : null}
                </div>
                <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => setEditing(address)}
                    aria-label="Edit address"
                    className="rounded-md p-2 text-[var(--store-muted)] transition-colors hover:bg-[var(--store-cream)]/50 hover:text-[var(--store-ink)]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddressToDelete(address)}
                    aria-label="Delete address"
                    className="rounded-md p-2 text-[var(--store-muted)] transition-colors hover:bg-red-50 hover:text-[#c45c5c]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <p className="font-store-body text-sm font-semibold text-[var(--store-ink)]">{address.name}</p>
              <p className="mt-2 font-store-body text-sm leading-relaxed text-[var(--store-muted)]">
                {address.line1}
                {address.line2 ? (
                  <>
                    <br />
                    {address.line2}
                  </>
                ) : null}
                <br />
                {address.city}, {address.state} {address.pincode}
              </p>
              <p className="mt-2 font-store-body text-sm text-[var(--store-muted)]">{address.phone}</p>

              {!address.isDefault ? (
                <button
                  type="button"
                  onClick={() => void setDefault(address.id)}
                  className="mt-4 font-store-body text-xs font-semibold uppercase tracking-[0.12em] text-[var(--store-red)] transition-colors hover:text-[var(--store-ink)]"
                >
                  Set as default
                </button>
              ) : null}
            </article>
          ))}

          <button
            type="button"
            onClick={() => setEditing("new")}
            className={cn(
              storePanelClass,
              "flex min-h-[200px] flex-col items-center justify-center gap-3 border-dashed p-8 transition-colors hover:border-[var(--store-red)] hover:bg-[var(--store-cream)]/30",
            )}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-md border border-black/15 bg-[var(--store-cream)]/50">
              <Plus className="h-4 w-4 text-[var(--store-muted)]" />
            </span>
            <span className="font-store-body text-xs font-semibold uppercase tracking-[0.12em] text-[var(--store-muted)]">
              Add another address
            </span>
          </button>
        </div>
      )}

      <StoreAddressFormModal
        open={editing !== null}
        initial={editing && editing !== "new" ? storeAddressFormFromApi(editing) : null}
        onClose={() => setEditing(null)}
        onSaved={() => invalidate()}
      />

      <StoreConfirmModal
        open={addressToDelete !== null}
        subtitle="Delete address"
        title={addressToDelete?.label ?? "Address"}
        description={`Are you sure you want to delete this address? This action cannot be undone.`}
        confirmLabel="Delete address"
        cancelLabel="Keep address"
        destructive
        confirming={deleting}
        onClose={() => {
          if (!deleting) setAddressToDelete(null);
        }}
        onConfirm={() => void remove()}
      />
    </div>
  );
}
