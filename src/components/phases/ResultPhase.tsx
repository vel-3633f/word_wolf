"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useGame } from "@/lib/game/context";

export function ResultPhase() {
  const { state, dispatch } = useGame();
  const wolf = state.players.find((p) => p.isWolf);

  const headline = (() => {
    switch (state.winner) {
      case "villagers":
        return "🎉 多数派(村人)の勝利！";
      case "wolf":
        return "🐺 ウルフの勝利！";
      case "humans":
        return "🎯 二人とも見抜きました！";
      case "fail":
        return "😅 読み違いがありました";
      default:
        return "結果";
    }
  })();

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col items-center gap-3 text-center">
        <div className="text-2xl font-bold">{headline}</div>
        {state.topic && (
          <div className="text-sm text-zinc-600 dark:text-zinc-300">
            テーマ:{" "}
            <span className="font-semibold">{state.topic.theme}</span>
          </div>
        )}
        {state.resultNarration && (
          <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-950 px-4 py-3 text-sm text-indigo-900 dark:text-indigo-100">
            🎙️ {state.resultNarration}
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-2">
        <div className="font-semibold">プレイヤー</div>
        <ul className="flex flex-col gap-2">
          {state.players.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-2xl bg-zinc-50 dark:bg-zinc-800 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {p.name}
                  {p.id === "ai" ? " 🤖" : ""}
                </span>
                {state.mode === "3p" && p.isWolf && (
                  <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                    ウルフ
                  </span>
                )}
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-300">
                {p.word}
              </div>
            </li>
          ))}
        </ul>
        {state.mode === "3p" && wolf && (
          <div className="text-xs text-zinc-500 mt-2">
            少数派ワード:{" "}
            <span className="font-semibold">{state.topic?.minorityWord}</span>
          </div>
        )}
      </Card>

      <Button onClick={() => dispatch({ type: "RESET" })} fullWidth>
        もう一度遊ぶ
      </Button>
    </div>
  );
}
