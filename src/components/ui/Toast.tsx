"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

export function Toast({
  message,
  onClose,
  variant = "info",
}: {
  message: string;
  onClose: () => void;
  variant?: "info" | "error";
}) {
  useEffect(() => {
    const id = setTimeout(onClose, 4000);
    return () => clearTimeout(id);
  }, [onClose]);

  return (
    <div
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%]",
        "rounded-2xl px-4 py-3 text-sm font-medium shadow-lg",
        variant === "error"
          ? "bg-rose-600 text-white"
          : "bg-zinc-900 text-white",
      )}
      role="status"
    >
      {message}
    </div>
  );
}
