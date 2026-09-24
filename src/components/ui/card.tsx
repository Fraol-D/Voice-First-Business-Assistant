import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={`rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6 ${className}`}
      {...props}
    />
  );
}
