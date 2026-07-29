import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-white via-white to-emerald-50/70 shadow-[0_14px_35px_rgba(15,81,45,0.08)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
