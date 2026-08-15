"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "quiet";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-[#176b5b] text-[#fffdf7] shadow-[0_5px_0_#0c5146] hover:bg-[#126052] active:translate-y-1 active:shadow-none disabled:translate-y-0 disabled:bg-[#b9c5c0] disabled:shadow-none",
  secondary:
    "border-2 border-[#176b5b] bg-[#fffdf7] text-[#176b5b] hover:bg-[#e8f3ee] active:bg-[#dceee7] disabled:border-[#b9c5c0] disabled:text-[#899590]",
  danger:
    "bg-[#b8473d] text-[#fffdf7] shadow-[0_5px_0_#8e3029] hover:bg-[#a43c33] active:translate-y-1 active:shadow-none disabled:translate-y-0 disabled:bg-[#c9b9b6] disabled:shadow-none",
  quiet:
    "bg-transparent text-[#526762] hover:bg-[#ebe8de] active:bg-[#e1ded4] disabled:text-[#a3aca8]",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`min-h-14 w-full rounded-2xl px-6 text-base font-semibold transition duration-150 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
