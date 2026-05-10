"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { HoldToReveal } from "@/components/ui/HoldToReveal";
import { PlayerHandoff } from "@/components/ui/PlayerHandoff";
import { useGame } from "@/lib/game/context";

export function RevealPhase() {
  const { state, dispatch } = useGame();
  const [confirmed, setConfirmed] = useState(false);

  const player = state.players[state.currentRevealIndex];
  if (!player) return null;

  // AIプレイヤーの番は自動でスキップ表示
  if (player.id === "ai") {
    return (
      <Card className="flex flex-col items-center gap-4 text-center">
        <div className="text-sm text-zinc-500">
          {state.currentRevealIndex + 1} / {state.players.length} 人目
        </div>
        <div className="text-2xl font-bold">🤖 AI</div>
        <p className="text-zinc-600 dark:text-zinc-300 text-sm">
          AI は自分のワードを確認しました。
        </p>
        <Button
          onClick={() => {
            setConfirmed(false);
            dispatch({ type: "NEXT_REVEAL" });
          }}
          fullWidth
        >
          次へ
        </Button>
      </Card>
    );
  }

  if (!confirmed) {
    return (
      <PlayerHandoff
        playerName={player.name}
        description="この画面以降は、他の人に見えないようご注意ください。"
        onConfirm={() => setConfirmed(true)}
      />
    );
  }

  return (
    <Card className="flex flex-col gap-5">
      <div className="text-sm text-zinc-500 text-center">
        {state.currentRevealIndex + 1} / {state.players.length} 人目
      </div>
      <div className="text-center text-xl font-bold">
        {player.name} さんのワード
      </div>
      <HoldToReveal word={player.word} />
      <p className="text-xs text-zinc-500 text-center">
        ボタンを長押ししている間だけワードが表示されます
      </p>
      <Button
        onClick={() => {
          setConfirmed(false);
          dispatch({ type: "NEXT_REVEAL" });
        }}
        fullWidth
      >
        確認した
      </Button>
    </Card>
  );
}
