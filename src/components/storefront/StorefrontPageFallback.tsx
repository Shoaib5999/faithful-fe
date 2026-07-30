export function StorefrontPageFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-white">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--store-ink)] border-t-transparent"
        role="status"
        aria-label="Loading page"
      />
    </div>
  );
}
