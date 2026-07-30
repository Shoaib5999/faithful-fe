import React, { useEffect, useMemo, useRef, useState } from "react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useModal } from "@/hooks/useModal";
import { useNotification } from "@/hooks/useNotification";
import { useProduct } from "@/hooks/useProduct";
import { useMasterData } from "@/hooks/useMasterData";
import { SearchSelector } from "@/components/common/SearchSelector";
import { NumberInput } from "@/components/common/NumberInput";
import { RichTextEditor } from "@/components/common/RichTextEditor";
import { InlineAlert } from "@/components/common/InlineAlert";
import { TagInput } from "@/components/common/TagInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { flattenCategoryOptions } from "@/services/category-service";
import { generateId } from "@/lib/formatters";
import { generateVariantSku, suggestNextVariantSize } from "@/lib/variant-sku";
import { getErrorMessage } from "@/lib/error";
import {
  buildProductTags,
  parseProductTags,
  PRODUCT_BADGE_OPTIONS,
  type ProductBadge,
  type ProductCreateInput,
  type ProductUpdateInput,
} from "@/lib/product-api";
import {
  resolveDefaultBrandId,
  resolveDefaultCategoryId,
  resolveDefaultTaxClassId,
} from "@/lib/product-form-defaults";
import {
  addProductVariant,
  deleteProductImage,
  deleteProductVariant,
  updateProduct,
  updateProductVariant,
  uploadProductImages,
} from "@/services/product-service";
import { ProductStorefrontFields } from "@/components/admin/ProductStorefrontFields";
import { HIGHLIGHT_TAG_PRESETS } from "@/constants/product-detail.constants";
import { DEFAULT_NEW_PRODUCT_STOREFRONT_META } from "@/lib/product-storefront-meta";
import type { ProductStorefrontMeta } from "@/types/product-storefront-meta";
import type {
  Product,
  ProductImage,
  ProductStatus,
  ProductVariant,
} from "@/types/commerce.types";
import type { FormErrors } from "@/types/master.types";
import { Loader2, Plus, Trash2, Upload, X } from "lucide-react";

const MAX_PRODUCT_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_PRODUCT_IMAGES = 8;
const PRODUCT_IMAGE_ACCEPT = "image/*";

const formatFileSizeMb = (bytes: number): string =>
  `${(bytes / (1024 * 1024)).toFixed(1)}MB`;

type VariantDraft = {
  id: string;
  isNew?: boolean;
  weightGrams: number;
  price: number;
  compareAtPrice: number;
  stockQty: number;
  sku: string;
  skuTouched?: boolean;
};

type PendingImage = {
  id: string;
  file: File;
  previewUrl: string;
};

const emptyVariant = (productName = "", weightGrams = 250): VariantDraft => ({
  id: generateId(),
  isNew: true,
  weightGrams,
  price: 0,
  compareAtPrice: 0,
  stockQty: 0,
  sku: productName.trim() ? generateVariantSku(productName, weightGrams) : "",
  skuTouched: false,
});

const mapExistingVariants = (variants: ProductVariant[]): VariantDraft[] =>
  variants
    .filter((v) => v.isActive)
    .map((v) => ({
      id: v.id,
      isNew: false,
      weightGrams: v.weightGrams,
      price: v.price,
      compareAtPrice: v.compareAtPrice ?? 0,
      stockQty: v.stockQty,
      sku: v.sku,
      skuTouched: true,
    }));

export const ProductCreateEditModal: React.FC = () => {
  const { closeModal, payload } = useModal();
  const { notify } = useNotification();
  const { handleCreate, isMutating, reloadProducts } = useProduct();
  const { brands, categories, taxClasses } = useMasterData();

  const existing = payload.product as Product | undefined;
  const isEdit = Boolean(existing);

  const parsedTags = useMemo(
    () => parseProductTags(existing?.tags),
    [existing?.tags],
  );

  const [name, setName] = useState(existing?.name ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [brandId, setBrandId] = useState<string | null>(existing?.brandId ?? null);
  const [categoryId, setCategoryId] = useState<string | null>(existing?.categoryId ?? null);
  const [taxClassId, setTaxClassId] = useState<string | null>(existing?.taxClassId ?? null);
  const [status, setStatus] = useState<ProductStatus>(existing?.status ?? "active");
  const [sortOrder, setSortOrder] = useState<number>(existing?.sortOrder ?? 0);
  const [cutTypes, setCutTypes] = useState(parsedTags.cutTypes);
  const [badge, setBadge] = useState<ProductBadge | "none">(
    parsedTags.badge ?? "none",
  );
  const [userTags, setUserTags] = useState<string[]>(parsedTags.userTags);
  const [storefrontMeta, setStorefrontMeta] = useState<ProductStorefrontMeta>(
    existing?.storefrontMeta ?? { ...DEFAULT_NEW_PRODUCT_STOREFRONT_META },
  );

  const [variants, setVariants] = useState<VariantDraft[]>(
    isEdit && existing?.variants?.length
      ? mapExistingVariants(existing.variants)
      : [emptyVariant()],
  );
  const [existingImages, setExistingImages] = useState<ProductImage[]>(
    existing?.images ?? [],
  );
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      pendingImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [pendingImages]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [tab, setTab] = useState("basic");
  const [isSaving, setIsSaving] = useState(false);

  const originalVariantIds = useMemo(
    () => new Set((existing?.variants ?? []).map((v) => v.id)),
    [existing?.variants],
  );

  const categoryOptions = useMemo(
    () => flattenCategoryOptions(categories),
    [categories],
  );

  const handleCategoryChange = (nextCategoryId: string | null) => {
    setCategoryId(nextCategoryId);
  };

  const brandOptions = useMemo(
    () => brands.map((b) => ({ label: b.name, value: b.id })),
    [brands],
  );

  const taxOptions = useMemo(
    () => taxClasses.map((t) => ({ label: t.name, value: t.id })),
    [taxClasses],
  );

  const shouldAutoGenerateSku = (variant: VariantDraft): boolean => {
    if (variant.skuTouched) return false;
    if (!isEdit) return true;
    return Boolean(variant.isNew);
  };

  const applyAutoSku = (variant: VariantDraft, productName: string): VariantDraft => {
    if (!shouldAutoGenerateSku(variant) || !productName.trim()) return variant;
    return {
      ...variant,
      sku: generateVariantSku(productName, variant.weightGrams),
    };
  };

  useEffect(() => {
    if (isEdit) return;
    if (brandId === null && brands.length > 0) {
      const id = resolveDefaultBrandId(brands);
      if (id) setBrandId(id);
    }
    if (categoryId === null && categories.length > 0) {
      const id = resolveDefaultCategoryId(categories);
      if (id) setCategoryId(id);
    }
    if (taxClassId === null && taxClasses.length > 0) {
      const id = resolveDefaultTaxClassId(taxClasses);
      if (id) setTaxClassId(id);
    }
  }, [isEdit, brands, categories, taxClasses, brandId, categoryId, taxClassId]);

  useEffect(() => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    setVariants((prev) => prev.map((variant) => applyAutoSku(variant, trimmedName)));
  }, [name, isEdit]);

  const addVariant = () => {
    setVariants((prev) => {
      const nextSize = suggestNextVariantSize(prev.map((v) => v.weightGrams));
      return [...prev, emptyVariant(name, nextSize)];
    });
  };

  const updateVariant = (
    id: string,
    field: keyof Omit<VariantDraft, "id" | "skuTouched">,
    val: number | string,
  ) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v;
        const next = { ...v, [field]: val };
        if (field === "sku") {
          return { ...next, skuTouched: true };
        }
        if (field === "weightGrams" && shouldAutoGenerateSku(v) && name.trim()) {
          return {
            ...next,
            sku: generateVariantSku(name, Number(val)),
          };
        }
        return next;
      }),
    );
  };

  const removeVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const enableCustomSku = (id: string) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, skuTouched: true } : v)),
    );
  };

  const totalImageCount = existingImages.length + pendingImages.length;
  const atImageLimit = totalImageCount >= MAX_PRODUCT_IMAGES;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files;
    if (!picked?.length) return;

    const remainingSlots = MAX_PRODUCT_IMAGES - totalImageCount;
    const accepted: PendingImage[] = [];

    for (const file of Array.from(picked)) {
      if (accepted.length >= remainingSlots) break;

      if (file.type.startsWith("image/") === false && file.type !== "") {
        continue;
      }

      if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
        notify(
          `${file.name} is ${formatFileSizeMb(file.size)}. Max ${formatFileSizeMb(MAX_PRODUCT_IMAGE_BYTES)} per image.`,
          "error",
        );
        continue;
      }

      accepted.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    if (accepted.length === 0) {
      notify("No valid images selected. Use JPEG, PNG, WebP, or GIF under 10MB.", "error");
      return;
    }

    if (accepted.length < picked.length) {
      notify(`Only ${MAX_PRODUCT_IMAGES} images allowed per product`, "error");
    }

    setPendingImages((prev) => [...prev, ...accepted]);
    notify(
      accepted.length === 1 ? "1 image added" : `${accepted.length} images added`,
      "success",
    );

    e.target.value = "";
  };

  const openImagePicker = () => {
    imageInputRef.current?.click();
  };

  const handleRemovePendingImage = (id: string) => {
    setPendingImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleRemoveExistingImage = async (imageId: string) => {
    if (!existing) return;
    setDeletingImageId(imageId);
    try {
      await deleteProductImage(existing.id, imageId);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      await reloadProducts();
    } catch (err) {
      notify(getErrorMessage(err), "error");
    } finally {
      setDeletingImageId(null);
    }
  };

  const validateVariants = (): string | undefined => {
    if (variants.length === 0) {
      return "At least one variant is required";
    }
    const invalid = variants.find(
      (v) =>
        !v.sku.trim() ||
        v.price <= 0 ||
        v.weightGrams <= 0 ||
        (v.compareAtPrice > 0 && v.compareAtPrice <= v.price),
    );
    if (invalid) {
      return "Each variant needs SKU, weight (g), price > 0, and compare price must be higher than price when set";
    }
    const sizes = variants.map((v) => v.weightGrams);
    if (new Set(sizes).size !== sizes.length) {
      return "Each variant must have a unique weight (g). Duplicate weights produce the same SKU.";
    }
    const skus = variants.map((v) => v.sku.trim().toUpperCase());
    if (new Set(skus).size !== skus.length) {
      return "Variant SKUs must be unique — use a different size (ml) or set a custom SKU";
    }
    return undefined;
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!name.trim()) e.name = "Name is required";
    if (!categoryId) e.categoryId = "Category is required";
    if (cutTypes.length === 0) {
      e.cutType = "Select at least one cut type";
    }

    const variantError = validateVariants();
    if (variantError) e.variants = variantError;

    setErrors(e);
    if (Object.keys(e).length > 0) {
      if (e.variants) setTab("variants");
      else if (e.cutType) setTab("storefront");
      else setTab("basic");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate() || !categoryId) return;

    const badgeValue = badge === "none" ? null : badge;
    const imageFiles = pendingImages.map((img) => img.file);

    setIsSaving(true);
    try {
      if (isEdit && existing) {
        const updateInput: ProductUpdateInput = {
          name,
          description,
          categoryId,
          brandId,
          taxClassId,
          status,
          cutTypes,
          tags: buildProductTags(cutTypes, badgeValue, userTags),
          storefrontMeta,
          sortOrder,
        };
        await updateProduct(existing.id, updateInput);

        const currentVariantIds = new Set(
          variants.filter((v) => !v.isNew).map((v) => v.id),
        );
        for (const id of originalVariantIds) {
          if (!currentVariantIds.has(id)) {
            await deleteProductVariant(existing.id, id);
          }
        }
        for (const v of variants) {
          const payload = {
            weightGrams: v.weightGrams,
            price: v.price,
            compareAtPrice:
              v.compareAtPrice > v.price ? v.compareAtPrice : null,
            stockQty: v.stockQty,
            sku: v.sku,
          };
          if (v.isNew) {
            await addProductVariant(existing.id, payload);
          } else {
            await updateProductVariant(existing.id, v.id, payload);
          }
        }

        if (imageFiles.length > 0) {
          const uploaded = await uploadProductImages(existing.id, imageFiles);
          setExistingImages((prev) => [...prev, ...uploaded]);
          setPendingImages([]);
        }

        await reloadProducts();
        notify(
          imageFiles.length > 0
            ? `Product updated with ${imageFiles.length} image(s)`
            : "Product updated successfully",
          "success",
        );
      } else {
        const createInput: ProductCreateInput = {
          name,
          description,
          categoryId,
          brandId,
          taxClassId,
          status,
          cutTypes,
          badge: badgeValue,
          tags: userTags,
          storefrontMeta,
          sortOrder,
          variants: variants.map((v) => ({
            weightGrams: v.weightGrams,
            price: v.price,
            compareAtPrice:
              v.compareAtPrice > v.price ? v.compareAtPrice : null,
            stockQty: v.stockQty,
            sku: v.sku,
          })),
        };
        await handleCreate(createInput, imageFiles);
      }
      closeModal();
    } catch (err) {
      notify(getErrorMessage(err), "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ResponsiveModal
      open
      onOpenChange={() => closeModal()}
      title={isEdit ? "Edit Product" : "Create Product"}
      className="sm:max-w-4xl"
    >
      <div className="flex flex-col gap-4 p-1">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="variants">Variants</TabsTrigger>
            <TabsTrigger value="storefront">Storefront</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="flex flex-col gap-4 md:col-span-2">
                <div className="flex flex-col gap-1.5">
                  <Label>Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Chicken Curry Cut"
                  />
                  {errors.name && <InlineAlert type="error" message={errors.name} />}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>Description</Label>
                  <RichTextEditor
                    content={description}
                    onChange={setDescription}
                    placeholder="Product description for the storefront..."
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label>Collection badge</Label>
                    <Select
                      value={badge}
                      onValueChange={(v) =>
                        setBadge(v as ProductBadge | "none")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {PRODUCT_BADGE_OPTIONS.map((option) => (
                          <SelectItem key={option.slug} value={option.slug}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Best sellers → home bestsellers grid. New Arrivals → new arrivals carousel.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>Highlight tags (PDP badges)</Label>
                  <TagInput
                    tags={userTags}
                    onChange={setUserTags}
                    placeholder="e.g. Celebrity Fav, Bestseller"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {HIGHLIGHT_TAG_PRESETS.map((preset) => {
                      const active = userTags.includes(preset);
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() =>
                            setUserTags(
                              active
                                ? userTags.filter((tag) => tag !== preset)
                                : [...userTags, preset],
                            )
                          }
                          className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                            active
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-muted/40 text-muted-foreground hover:border-primary/40"
                          }`}
                        >
                          {preset}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Shown as badges on the product page next to freshness tags. Cut type is on the
                    Storefront tab.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Brand</Label>
                  <SearchSelector
                    options={brandOptions}
                    value={brandId}
                    onChange={setBrandId}
                    placeholder="Optional"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>Category</Label>
                  <SearchSelector
                    options={categoryOptions}
                    value={categoryId}
                    onChange={handleCategoryChange}
                    placeholder="Select category"
                  />
                  {errors.categoryId && (
                    <InlineAlert type="error" message={errors.categoryId} />
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>Tax class</Label>
                  <SearchSelector
                    options={taxOptions}
                    value={taxClassId}
                    onChange={setTaxClassId}
                    placeholder="Optional"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>Display order</Label>
                  <NumberInput
                    value={sortOrder}
                    onChange={setSortOrder}
                    min={0}
                    step={1}
                  />
                  <p className="text-xs text-muted-foreground">
                    Controls homepage and carousel order within category. Lower numbers appear first.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>Status</Label>
                  <Select
                    value={status}
                    onValueChange={(v) => setStatus(v as ProductStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active (visible in shop)</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="storefront" className="mt-4">
            <ProductStorefrontFields
              meta={storefrontMeta}
              onChange={setStorefrontMeta}
              cutTypes={cutTypes}
              onCutTypesChange={setCutTypes}
            />
            {errors.cutType && (
              <div className="mt-3">
                <InlineAlert type="error" message={errors.cutType} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="variants" className="mt-4">
            <div className="flex flex-col gap-3">
              {errors.variants && (
                <InlineAlert type="error" message={errors.variants} />
              )}

              <div className="hidden gap-2 px-1 text-xs text-muted-foreground sm:grid sm:grid-cols-[1fr_72px_96px_96px_72px_36px]">
                <span>SKU</span>
                <span>Weight (g)</span>
                <span>Price (₹)</span>
                <span>Compare (₹)</span>
                <span>Stock</span>
                <span />
              </div>

              {variants.map((v) => {
                const isAutoSku = shouldAutoGenerateSku(v);
                return (
                <div
                  key={v.id}
                  className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-[1fr_72px_96px_96px_72px_36px] sm:border-0 sm:p-0"
                >
                  <div className="flex flex-col gap-1 sm:col-span-1">
                    <Input
                      value={v.sku}
                      onChange={(e) => updateVariant(v.id, "sku", e.target.value)}
                      placeholder={name.trim() ? "FTM-CHICKENCURRY-1000G" : "Enter product name first"}
                      disabled={isAutoSku}
                      className={isAutoSku ? "bg-muted text-muted-foreground" : undefined}
                    />
                    {isAutoSku ? (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] text-muted-foreground">Auto-generated</span>
                        <button
                          type="button"
                          onClick={() => enableCustomSku(v.id)}
                          className="text-[10px] font-medium text-primary hover:underline"
                        >
                          Custom SKU
                        </button>
                      </div>
                    ) : null}
                  </div>
                  <NumberInput
                    value={v.weightGrams}
                    onChange={(val) => updateVariant(v.id, "weightGrams", val)}
                    min={1}
                  />
                  <NumberInput
                    value={v.price}
                    onChange={(val) => updateVariant(v.id, "price", val)}
                    min={0}
                    prefix="₹"
                  />
                  <NumberInput
                    value={v.compareAtPrice}
                    onChange={(val) => updateVariant(v.id, "compareAtPrice", val)}
                    min={0}
                    prefix="₹"
                  />
                  <NumberInput
                    value={v.stockQty}
                    onChange={(val) => updateVariant(v.id, "stockQty", val)}
                    min={0}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeVariant(v.id)}
                    disabled={variants.length === 1}
                    className="justify-self-end"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              );
              })}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addVariant}
                className="w-fit"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add size variant
              </Button>

              <InlineAlert
                type="info"
                message="SKUs auto-generate from product name and weight (e.g. FTM-CHICKENCURRY-1000G). Use Custom SKU to override. Compare price powers the discount badge on the storefront."
              />
            </div>
          </TabsContent>

          <TabsContent value="media" className="mt-4">
            <div className="flex flex-col gap-3">
              <Label>
                Product images ({totalImageCount}/{MAX_PRODUCT_IMAGES})
              </Label>
              <input
                ref={imageInputRef}
                type="file"
                accept={PRODUCT_IMAGE_ACCEPT}
                multiple
                tabIndex={-1}
                className="pointer-events-none fixed left-[-9999px] h-px w-px opacity-0"
                onChange={handleImageSelect}
              />
              <div className="flex flex-wrap gap-3">
                {existingImages.map((img) => (
                  <div
                    key={img.id}
                    className="relative h-24 w-24 overflow-hidden rounded-md border border-border"
                  >
                    <img
                      src={img.url}
                      alt={img.altText}
                      className="h-full w-full object-cover"
                    />
                    {img.isPrimary && (
                      <span className="absolute left-1 top-1 rounded bg-primary px-1 text-[10px] text-primary-foreground">
                        Primary
                      </span>
                    )}
                    <button
                      type="button"
                      className="absolute right-1 top-1 rounded-full bg-background/80 p-0.5 disabled:opacity-50"
                      disabled={deletingImageId === img.id || isSaving}
                      onClick={() => void handleRemoveExistingImage(img.id)}
                    >
                      {deletingImageId === img.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                ))}
                {pendingImages.map((img, index) => (
                  <div
                    key={img.id}
                    className="relative h-24 w-24 overflow-hidden rounded-md border border-border"
                  >
                    <img
                      src={img.previewUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    {existingImages.length === 0 && index === 0 && (
                      <span className="absolute left-1 top-1 rounded bg-primary px-1 text-[10px] text-primary-foreground">
                        Primary
                      </span>
                    )}
                    {existingImages.length > 0 && (
                      <span className="absolute left-1 top-1 rounded bg-muted px-1 text-[10px] text-muted-foreground">
                        New
                      </span>
                    )}
                    <button
                      type="button"
                      className="absolute right-1 top-1 rounded-full bg-background/80 p-0.5 disabled:opacity-50"
                      disabled={isSaving}
                      onClick={() => handleRemovePendingImage(img.id)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {!atImageLimit && (
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={openImagePicker}
                    className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border text-muted-foreground transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Upload className="h-5 w-5" />
                    <span className="text-[10px]">Add</span>
                  </button>
                )}
              </div>
              {!atImageLimit && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  disabled={isSaving}
                  onClick={openImagePicker}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose from gallery
                </Button>
              )}
              <InlineAlert
                type="info"
                message="Pick images above, then save. Upload runs when you click Save."
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isMutating || isSaving}
          >
            {(isMutating || isSaving) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isEdit
              ? pendingImages.length > 0
                ? `Save + ${pendingImages.length} image(s)`
                : "Save changes"
              : pendingImages.length > 0
                ? `Create + ${pendingImages.length} image(s)`
                : "Create product"}
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );
};
