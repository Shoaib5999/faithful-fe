import type { Review, ReviewApiRow, ReviewsListApiData, ReviewStatus } from "@/types/cms.types";
import { api } from "@/services/api";

let reviewsCache: Review[] = [];

const refreshCache = (list: Review[]) => {
  reviewsCache = list;
};

const mapStatus = (s: string): ReviewStatus => {
  const u = s.toUpperCase();
  if (u === "APPROVED") return "approved";
  if (u === "REJECTED") return "rejected";
  return "pending";
};

const parseReviewRow = (row: ReviewApiRow): Review => ({
  id: row.id,
  productId: row.productId,
  productName: row.product?.name ?? "",
  customerId: row.user?.id ?? null,
  customerName: row.user?.name?.trim() || row.user?.email || "Customer",
  rating: row.rating,
  title: row.title ?? "",
  body: row.comment ?? "",
  status: mapStatus(row.status),
  isVerifiedPurchase: Boolean(row.orderId),
  createdAt:
    typeof row.createdAt === "string"
      ? row.createdAt
      : new Date(row.createdAt as unknown as Date).toISOString(),
});

export const fetchReviews = async (): Promise<Review[]> => {
  const merged: Review[] = [];
  let page = 1;
  const limit = 100;
  for (;;) {
    const data = await api.get<ReviewsListApiData>("/reviews", { page, limit });
    merged.push(...data.reviews.map(parseReviewRow));
    if (page >= data.totalPages || data.reviews.length === 0) break;
    page += 1;
  }
  refreshCache(merged);
  return merged;
};

export const approveReview = async (id: string): Promise<void> => {
  await api.patch<ReviewApiRow>(`/reviews/${id}/moderate`, { action: "APPROVED" });
};

export const rejectReview = async (id: string, rejectedReason?: string): Promise<void> => {
  await api.patch<ReviewApiRow>(`/reviews/${id}/moderate`, {
    action: "REJECTED",
    rejectedReason,
  });
};

export const deleteReview = async (id: string): Promise<void> => {
  await api.delete(`/reviews/${id}`);
};

export const getAllReviews = (): Review[] => [...reviewsCache];
