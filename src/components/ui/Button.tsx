"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-teal-700 text-white active:bg-teal-800 disabled:bg-neutral-300",
  secondary:
    "bg-white text-teal-700 border-2 border-teal-700 active:bg-teal-50 disabled:border-neutral-300 disabled:text-neutral-400",
  danger: "bg-red-600 text-white active:bg-red-700 disabled:bg-neutral-300",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`min-h-14 w-full rounded-xl px-6 text-lg font-semibold shadow-sm transition-colors disabled:cursor-not-allowed disabled:shadow-none ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
