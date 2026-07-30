import type { InventoryRecord, InventoryAdjustment, Product } from "@/types/commerce.types";
import { generateId } from "@/lib/formatters";
import { APP_CONFIG } from "@/constants/app.constants";
import { fetchProducts } from "@/services/product-service";
import { formatWeightLabel } from "@/lib/store-product-detail";
import { api } from "@/services/api";

const THRESHOLDS_LS = "faithfulmeat_inv_thresholds_v1";
const HISTORY_LS = "faithfulmeat_inv_history_v1";
const MAX_HISTORY = 200;

/** Legacy buffer mutated only by `seed-service` mock path (no API inventory table). */
const legacyInventoryBuffer: InventoryRecord[] = [];

function readThresholds(): Record<string, number> {
  try {
    const raw = localStorage.getItem(THRESHOLDS_LS);
    if (!raw) return {};
    const o = JSON.parse(raw) as Record<string, number>;
    return o && typeof o === "object" ? o : {};
  } catch {
    return {};
  }
}

function writeThresholds(map: Record<string, number>): void {
  localStorage.setItem(THRESHOLDS_LS, JSON.stringify(map));
}

function readHistory(): InventoryAdjustment[] {
  try {
    const raw = localStorage.getItem(HISTORY_LS);
    if (!raw) return [];
    const arr = JSON.parse(raw) as InventoryAdjustment[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeHistory(entries: InventoryAdjustment[]): void {
  localStorage.setItem(HISTORY_LS, JSON.stringify(entries.slice(0, MAX_HISTORY)));
}

/**
 * One inventory row per active `ProductVariant` (stock lives in `stockQty` only).
 */
export function buildInventoryRecordsFromProducts(products: Product[]): InventoryRecord[] {
  const thresholds = readThresholds();
  const rows: InventoryRecord[] = [];

  for (const p of products) {
    if (p.status === "archived") continue;
    for (const v of p.variants) {
      if (!v.isActive) continue;
      rows.push({
        id: v.id,
        productId: p.id,
        variantId: v.id,
        quantity: v.stockQty,
        reservedQuantity: 0,
        threshold: thresholds[v.id] ?? APP_CONFIG.lowStockThreshold,
        warehouseLocation: "",
        lastUpdatedAt: p.updatedAt,
        productName: p.name,
        variantLabel: `${formatWeightLabel(v.weightGrams)} · ${v.sku}`,
        productSku: p.sku,
      });
    }
  }

  return rows.sort((a, b) => {
    const an = (a.productName ?? "").localeCompare(b.productName ?? "");
    if (an !== 0) return an;
    return (a.variantLabel ?? "").localeCompare(b.variantLabel ?? "");
  });
}

export const fetchInventory = async (): Promise<InventoryRecord[]> => {
  const products = await fetchProducts();
  return buildInventoryRecordsFromProducts(products);
};

/** Product-scoped stock rows derived from a loaded product (no extra fetch). */
export const getInventoryRowsForProduct = (product: Product): InventoryRecord[] =>
  buildInventoryRecordsFromProducts([product]);

export const adjustInventory = async (
  inventoryId: string,
  input: { type: "add" | "remove" | "set"; quantity: number; reason: string; createdBy: string }
): Promise<InventoryAdjustment> => {
  const products = await fetchProducts();
  let productId: string | null = null;
  let productName: string | undefined;
  let variantLabel: string | undefined;
  let previousQuantity = 0;

  for (const p of products) {
    const v = p.variants.find((x) => x.id === inventoryId);
    if (v) {
      productId = p.id;
      productName = p.name;
      variantLabel = `${formatWeightLabel(v.weightGrams)} · ${v.sku}`;
      previousQuantity = v.stockQty;
      break;
    }
  }

  if (!productId) {
    return Promise.reject(new Error("Variant not found"));
  }

  let newQuantity: number;
  switch (input.type) {
    case "add":
      newQuantity = previousQuantity + input.quantity;
      break;
    case "remove":
      newQuantity = Math.max(0, previousQuantity - input.quantity);
      break;
    case "set":
      newQuantity = input.quantity;
      break;
  }

  await api.patch(`/products/${productId}/variants/${inventoryId}/stock`, {
    stockQty: newQuantity,
  });

  const adjustment: InventoryAdjustment = {
    id: generateId(),
    inventoryId,
    productId: productId ?? undefined,
    productName,
    variantLabel,
    type: input.type,
    quantity: input.quantity,
    reason: input.reason,
    previousQuantity,
    newQuantity,
    createdAt: new Date().toISOString(),
    createdBy: input.createdBy,
  };

  const hist = readHistory();
  hist.unshift(adjustment);
  writeHistory(hist);

  return adjustment;
};

export const getAdjustmentHistory = async (inventoryId: string): Promise<InventoryAdjustment[]> =>
  Promise.resolve(
    readHistory()
      .filter((a) => a.inventoryId === inventoryId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  );

export const updateThreshold = async (inventoryId: string, threshold: number): Promise<InventoryRecord> => {
  const map = readThresholds();
  map[inventoryId] = threshold;
  writeThresholds(map);
  const rows = await fetchInventory();
  const r = rows.find((x) => x.id === inventoryId);
  if (!r) return Promise.reject(new Error("Not found"));
  return r;
};

/** @deprecated Used only by legacy `seed-service` mock path. */
export const getInventoryArray = (): InventoryRecord[] => legacyInventoryBuffer;

/** Sync snapshot for callers that already fetched products (e.g. notifications). */
export const getAllInventoryFromProducts = (products: Product[]): InventoryRecord[] =>
  buildInventoryRecordsFromProducts(products);
