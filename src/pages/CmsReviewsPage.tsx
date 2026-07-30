import React from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PermissionGate } from "@/components/common/PermissionGate";
import { DataTableOne } from "@/components/ui/data-table";
import type { DataTableOneColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { useReview } from "@/hooks/useReview";
import { useModal } from "@/hooks/useModal";
import { formatDate, truncateText } from "@/lib/formatters";
import type { Review, ReviewStatus } from "@/types/cms.types";
import type { ColorVariant } from "@/types/common.types";
import { Star, ShieldCheck } from "lucide-react";

const STATUS_COLOR: Record<string, ColorVariant> = { pending: "yellow", approved: "green", rejected: "red" };

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-3.5 w-3.5 ${i < rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
    ))}
  </div>
);

const CmsReviewsPage: React.FC = () => {
  const {
    filteredReviews, statusCounts, search, setSearch,
    statusFilter, setStatusFilter, ratingFilter, setRatingFilter,
    handleApprove, handleReject, confirmDelete,
  } = useReview();
  const { openModal } = useModal();

  const columns: DataTableOneColumn<Review>[] = [
    { key: "product", header: "Product", render: (r) => r.productName, sortable: true, sortValue: (r) => r.productName },
    { key: "customer", header: "Customer", render: (r) => r.customerName },
    { key: "rating", header: "Rating", render: (r) => <StarRating rating={r.rating} /> },
    { key: "title", header: "Title", render: (r) => truncateText(r.title, 40) },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} colorMap={STATUS_COLOR} /> },
    {
      key: "verified", header: "Verified", render: (r) => r.isVerifiedPurchase ? <ShieldCheck className="h-4 w-4 text-green-600" /> : null,
    },
    { key: "date", header: "Date", render: (r) => <span className="text-muted-foreground">{formatDate(r.createdAt)}</span> },
    {
      key: "actions", header: "",hideable: false, render: (r) => (
        <div className="flex gap-1 justify-end">
          {(r.status === "pending" || r.status === "rejected") && (
            <PermissionGate moduleKey="cms_reviews" operation="edit">
              <Button variant="ghost" size="sm" className="text-green-600" onClick={(e) => {
                e.stopPropagation();
                openModal("ConfirmAction", { title: "Approve Review", description: "Approve this review?", onConfirm: () => handleApprove(r.id) });
              }}>Approve</Button>
            </PermissionGate>
          )}
          {(r.status === "pending" || r.status === "approved") && (
            <PermissionGate moduleKey="cms_reviews" operation="edit">
              <Button variant="ghost" size="sm" className="text-destructive" onClick={(e) => {
                e.stopPropagation();
                openModal("ConfirmAction", { title: "Reject Review", description: "Reject this review?", onConfirm: () => handleReject(r.id) });
              }}>Reject</Button>
            </PermissionGate>
          )}
          <PermissionGate moduleKey="cms_reviews" operation="delete">
            <Button variant="ghost" size="sm" className="text-destructive" onClick={(e) => { e.stopPropagation(); confirmDelete(r); }}>Delete</Button>
          </PermissionGate>
        </div>
      ),
    },
  ];

  return (
    <PageWrapper>
      <PageHeader
        title="Reviews"
        subtitle={`${statusCounts.pending} pending · ${statusCounts.approved} approved · ${statusCounts.rejected} rejected`}
      />
      <div className="mt-4">
        <DataTableOne
          columns={columns}
          data={filteredReviews}
          keyExtractor={(r) => r.id}
          emptyMessage="No reviews found"
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search reviews..."
          filters={[
            {
              key: "status", label: "Status", value: statusFilter,
              options: [
                { label: "Pending", value: "pending" }, { label: "Approved", value: "approved" }, { label: "Rejected", value: "rejected" },
              ],
              onChange: (v) => setStatusFilter(v as ReviewStatus | "all"),
            },
            {
              key: "rating", label: "Ratings", value: ratingFilter,
              options: [
                { label: "5 Stars", value: "5" }, { label: "4 Stars", value: "4" },
                { label: "3 Stars", value: "3" }, { label: "2 Stars", value: "2" }, { label: "1 Star", value: "1" },
              ],
              onChange: setRatingFilter,
            },
          ]}
        />
      </div>
    </PageWrapper>
  );
};

export default CmsReviewsPage;
