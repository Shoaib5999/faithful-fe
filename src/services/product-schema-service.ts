import type { ProductTypeSchema, TieredPrice } from "@/types/product-schema.types";
import { generateId } from "@/lib/formatters";

let schemas: ProductTypeSchema[] = [];

export const fetchProductSchemas = (): Promise<ProductTypeSchema[]> => Promise.resolve([...schemas]);

export const getSchemaForCategory = (categoryId: string): ProductTypeSchema | undefined =>
  schemas.find((s) => s.categoryId === categoryId);

export const createProductSchema = (input: Omit<ProductTypeSchema, "id">): Promise<ProductTypeSchema> => {
  const schema: ProductTypeSchema = { ...input, id: generateId() };
  schemas.push(schema);
  return Promise.resolve(schema);
};

export const updateProductSchema = (id: string, input: Partial<Omit<ProductTypeSchema, "id">>): Promise<ProductTypeSchema> => {
  const idx = schemas.findIndex((s) => s.id === id);
  if (idx === -1) return Promise.reject(new Error("Schema not found"));
  schemas[idx] = { ...schemas[idx], ...input };
  return Promise.resolve(schemas[idx]);
};

export const deleteProductSchema = (id: string): Promise<void> => {
  schemas = schemas.filter((s) => s.id !== id);
  return Promise.resolve();
};

export const generateTieredPriceId = (): string => generateId();

export const getSchemaArray = (): ProductTypeSchema[] => schemas;
