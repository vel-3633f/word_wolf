"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function HoldToReveal({ word }: { word: string }) {
  const [revealed, setRevealed] = useState(false);

  const show = () => setRevealed(true);
  const hide = () => setRevealed(false);

  return (
    <button
      type="button"
      onPointerDown={show}
      onPointerUp={hide}
      onPointerLeave={hide}
      onPointerCancel={hide}
      onContextMenu={(e) => e.preventDefault()}
      className={cn(
        "relative w-full aspect-[5/3] rounded-3xl overflow-hidden",
        "flex items-center justify-center select-none touch-manipulation",
        "transition-colors",
        revealed
          ? "bg-indigo-50 dark:bg-indigo-950"
          : "bg-zinc-900 dark:bg-zinc-800",
      )}
    >
      {revealed ? (
        <div className="text-5xl font-bold text-indigo-700 dark:text-indigo-200">
          {word}
        </div>
      ) : (
        <div className="text-zinc-200 text-lg font-medium text-center px-4">
          長押ししている間だけ表示
          <br />
          <span className="text-zinc-400 text-sm">指を離すと隠れます</span>
        </div>
      )}
    </button>
  );
}
