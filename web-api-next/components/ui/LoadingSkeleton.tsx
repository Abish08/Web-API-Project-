import type { HTMLAttributes } from "react";

type LoadingSkeletonProps = HTMLAttributes<HTMLDivElement> & {
  label?: string;
};

export function LoadingSkeleton({
  className = "",
  label = "Loading",
  ...props
}: LoadingSkeletonProps) {
  return (
    <div
      aria-label={label}
      role="status"
      className={`animate-pulse rounded-2xl bg-gradient-to-r from-green-50 via-emerald-100 to-green-50 ring-1 ring-green-100 ${className}`}
      {...props}
    />
  );
}
