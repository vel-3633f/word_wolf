"use client";

import { useEffect } from "react";
import { useGame } from "@/lib/game/context";

export function Timer({ onZero }: { onZero?: () => void }) {
  const { state, dispatch } = useGame();
  const { discussionSeconds, discussionRunning } = state;

  useEffect(() => {
    if (!discussionRunning) return;
    const id = setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => clearInterval(id);
  }, [discussionRunning, dispatch]);

  useEffect(() => {
    if (discussionSeconds <= 0 && discussionRunning) {
      onZero?.();
    }
  }, [discussionSeconds, discussionRunning, onZero]);

  const m = Math.floor(discussionSeconds / 60);
  const s = discussionSeconds % 60;

  return (
    <div className="text-6xl font-mono font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
      {m}:{s.toString().padStart(2, "0")}
    </div>
  );
}
