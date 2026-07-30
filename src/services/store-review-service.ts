import { storeApiFetch } from "@/services/store-api";

export type ReviewEligibility = {
  canReview: boolean;
  alreadyReviewed: boolean;
  reason: string | null;
  eligibleOrders: { orderId: string; orderedAt: string }[];
};

export const fetchReviewEligibility = async (
  productId: string,
): Promise<ReviewEligibility> => {
  const { data } = await storeApiFetch(`/reviews/eligibility/${productId}`, {
    auth: true,
  });
  return data as ReviewEligibility;
};

export const submitProductReview = async (payload: {
  productId: string;
  orderId?: string;
  rating: number;
  title?: string;
  comment: string;
}): Promise<void> => {
  await storeApiFetch("/reviews", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
};
