import type { HTMLAttributes, ReactNode } from "react";

type PageContainerProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  as?: "main" | "section" | "div";
};

export function PageContainer({
  children,
  className = "",
  as: Component = "main",
  ...props
}: PageContainerProps) {
  return (
    <Component className={`mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 ${className}`} {...props}>
      {children}
    </Component>
  );
}
