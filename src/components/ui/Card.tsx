import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl bg-white dark:bg-zinc-900 shadow-md p-6",
        className,
      )}
      {...rest}
    />
  );
}
