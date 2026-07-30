import { api } from "@/services/api";

export type UploadResult = {
  url: string;
  publicId: string;
  storageKey: string;
  originalName?: string;
  size?: number;
  mimetype?: string;
};

export type UploadMultipleResult = {
  files: UploadResult[];
  count: number;
};

type ApiUploadPayload = UploadResult & { storageKey?: string };

const postFile = async (endpoint: string, field: string, file: File): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append(field, file);
  const data = await api.post<ApiUploadPayload>(endpoint, formData);
  return {
    ...data,
    storageKey: data.storageKey ?? data.publicId,
  };
};

export type ListedAsset = {
  url: string;
  storageKey: string;
  publicId: string;
  bytes?: number;
  createdAt?: string;
};

type ListAssetsResponse = {
  resources: Array<{
    url: string;
    publicId: string;
    bytes?: number;
    createdAt?: string;
  }>;
  nextCursor: string | null;
};

export const listUploadAssets = async (
  folder: string,
  options?: { maxResults?: number; nextCursor?: string },
): Promise<{ resources: ListedAsset[]; nextCursor: string | null }> => {
  const data = await api.get<ListAssetsResponse>("/upload/assets", {
    folder,
    maxResults: options?.maxResults ?? 100,
    nextCursor: options?.nextCursor,
  });

  const resources = (data.resources ?? []).map((item) => ({
    url: item.url,
    storageKey: item.publicId,
    publicId: item.publicId,
    bytes: item.bytes,
    createdAt: item.createdAt,
  }));

  return { resources, nextCursor: data.nextCursor ?? null };
};

export const listAllUploadAssets = async (folder: string): Promise<ListedAsset[]> => {
  const all: ListedAsset[] = [];
  let cursor: string | undefined;

  do {
    const page = await listUploadAssets(folder, { maxResults: 100, nextCursor: cursor });
    all.push(...page.resources);
    cursor = page.nextCursor ?? undefined;
  } while (cursor);

  return all;
};

export const deleteUploadAsset = (storageKey: string) =>
  api.deleteWithBody<{ deleted: string }>("/upload/asset", { storageKey });

export const uploadBannerImage = (file: File) =>
  postFile("/upload/banner", "image", file);

export const uploadBannerImages = async (files: File[]): Promise<UploadResult[]> => {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));
  const data = await api.post<UploadMultipleResult>("/upload/banners", formData);
  return (data.files ?? []).map((item) => ({
    ...item,
    storageKey: item.storageKey ?? item.publicId,
  }));
};

export const uploadBrandLogo = (file: File) =>
  postFile("/upload/logo", "image", file);

export const uploadSliderImage = (file: File) =>
  postFile("/upload/slider", "image", file);

export const uploadProductImage = (file: File) =>
  postFile("/upload/product", "image", file);

export const uploadCategoryImage = (file: File) =>
  postFile("/upload/category", "image", file);

export const uploadCutTypeImage = (file: File) =>
  postFile("/upload/cut-type", "image", file);

export const uploadGeneralMedia = (file: File) =>
  postFile("/upload/media", "file", file);
