import { clsx } from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
}

export function Button({ className, variant = "secondary", icon, children, ...props }: ButtonProps) {
  return (
    <button className={clsx("button", variant, className)} {...props}>
      {icon}
      {children}
    </button>
  );
}
