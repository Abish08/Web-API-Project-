import type { HTMLAttributes, ReactNode } from "react";

type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "primary";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-green-100 text-green-900 ring-1 ring-green-200",
  warning: "bg-amber-100 text-amber-900 ring-1 ring-amber-200",
  danger: "bg-red-100 text-red-800 ring-1 ring-red-200",
  neutral: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  primary: "bg-green-100 text-green-950 ring-1 ring-green-200",
};

export function Badge({
  children,
  className = "",
  variant = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
