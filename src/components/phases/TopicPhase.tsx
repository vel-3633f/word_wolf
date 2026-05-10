"use client";

import { Card } from "@/components/ui/Card";
import { useGame } from "@/lib/game/context";

export function TopicPhase() {
  const { state } = useGame();
  return (
    <Card className="flex flex-col items-center gap-4 py-12 text-center">
      <div className="text-2xl">🤔</div>
      <div className="text-lg font-semibold">
        {state.loadingMessage || "お題を考えています…"}
      </div>
      <div className="size-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </Card>
  );
}
