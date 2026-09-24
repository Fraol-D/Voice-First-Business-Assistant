import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "accent" | "ghost";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "border border-border-strong bg-background text-foreground hover:bg-surface-strong",
  accent: "bg-accent text-accent-foreground hover:bg-accent/90",
  ghost: "text-muted hover:bg-surface-strong hover:text-foreground",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
