// SkeletonCard — Prime jaisa shimmer loading
export function SkeletonCard({ size = "md" }) {
  const widths = { sm: "w-40 sm:w-44", md: "w-48 sm:w-56", lg: "w-56 sm:w-64" };
  return (
    <div className={`${widths[size]} flex-shrink-0`}>
      <div className="aspect-video rounded-prime skeleton" />
      <div className="mt-1.5 h-2.5 w-3/4 rounded skeleton" />
    </div>
  );
}
