import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useMemo } from "react";
import type { Review, ReviewStatus } from "@/types/cms.types";
import { useNotification } from "@/hooks/useNotification";
import { useModal } from "@/hooks/useModal";
import { fetchReviews, approveReview, rejectReview, deleteReview } from "@/services/review-service";
import React from "react";

const REVIEWS_QK = ["reviews"] as const;

export const useReview = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | "all">("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const { notify } = useNotification();
  const { openModal } = useModal();

  const { data: reviews = [], isPending, isError, error } = useQuery({
    queryKey: REVIEWS_QK,
    queryFn: fetchReviews,
  });

  React.useEffect(() => {
    if (isError && error) notify(error instanceof Error ? error.message : "Failed to load reviews", "error");
  }, [isError, error, notify]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        r.productName.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      const matchesRating = ratingFilter === "all" || r.rating === Number(ratingFilter);
      return matchesSearch && matchesStatus && matchesRating;
    });
  }, [reviews, search, statusFilter, ratingFilter]);

  const statusCounts = useMemo(
    () => ({
      pending: reviews.filter((r) => r.status === "pending").length,
      approved: reviews.filter((r) => r.status === "approved").length,
      rejected: reviews.filter((r) => r.status === "rejected").length,
    }),
    [reviews]
  );

  const handleApprove = useCallback(
    async (id: string) => {
      try {
        await approveReview(id);
        await queryClient.invalidateQueries({ queryKey: REVIEWS_QK });
        notify("Review approved", "success");
      } catch (err: unknown) {
        notify(err instanceof Error ? err.message : "Failed to approve review", "error");
        throw err;
      }
    },
    [queryClient, notify]
  );

  const handleReject = useCallback(
    async (id: string) => {
      try {
        await rejectReview(id);
        await queryClient.invalidateQueries({ queryKey: REVIEWS_QK });
        notify("Review rejected", "success");
      } catch (err: unknown) {
        notify(err instanceof Error ? err.message : "Failed to reject review", "error");
        throw err;
      }
    },
    [queryClient, notify]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteReview(id);
        await queryClient.invalidateQueries({ queryKey: REVIEWS_QK });
        notify("Review deleted", "success");
      } catch (err: unknown) {
        notify(err instanceof Error ? err.message : "Failed to delete review", "error");
      }
    },
    [queryClient, notify]
  );

  const confirmDelete = useCallback(
    (review: Review) => {
      openModal("ConfirmAction", {
        title: "Delete Review",
        description: `Are you sure you want to delete this review by "${review.customerName}"?`,
        variant: "destructive",
        onConfirm: () => handleDelete(review.id),
      });
    },
    [openModal, handleDelete]
  );

  return {
    reviews,
    filteredReviews,
    statusCounts,
    isLoading: isPending,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    ratingFilter,
    setRatingFilter,
    handleApprove,
    handleReject,
    handleDelete,
    confirmDelete,
  };
};
