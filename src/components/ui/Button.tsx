"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  fullWidth?: boolean;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-indigo-300",
  secondary:
    "bg-zinc-800 text-white hover:bg-zinc-700 active:bg-zinc-900 disabled:bg-zinc-400",
  ghost:
    "bg-transparent text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200 dark:text-zinc-200 dark:hover:bg-zinc-800",
  danger:
    "bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-700",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", fullWidth, className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-base font-semibold transition-colors select-none touch-manipulation",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400",
        "disabled:cursor-not-allowed",
        fullWidth && "w-full",
        variants[variant],
        className,
      )}
      {...rest}
    />
  );
});
