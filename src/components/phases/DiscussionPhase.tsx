"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Timer } from "@/components/ui/Timer";
import { useGame } from "@/lib/game/context";

export function DiscussionPhase() {
  const { state, dispatch } = useGame();
  const [aiLoading, setAiLoading] = useState(false);

  const aiPlayer = state.players.find((p) => p.id === "ai");
  const showAiInterject = state.mode === "3p" && !!aiPlayer;

  async function fetchAiUtterance() {
    if (!aiPlayer || !state.topic) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/interjection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aiIsWolf: aiPlayer.isWolf,
          aiWord: aiPlayer.word,
          topicTheme: state.topic.theme,
          recentTalkLog: state.aiUtterances.slice(-3),
        }),
      });
      const data = (await res.json()) as { utterance: string };
      dispatch({ type: "ADD_AI_UTTERANCE", utterance: data.utterance });
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col items-center gap-3 text-center">
        <div className="text-sm text-zinc-500">議論タイム</div>
        <Timer
          onZero={() => {
            dispatch({ type: "PAUSE_DISCUSSION" });
          }}
        />
        <div className="text-xs text-zinc-500">
          自分のワードを直接言わず、相手のワードを推理しよう
        </div>
        <div className="flex gap-2 w-full mt-2">
          {state.discussionRunning ? (
            <Button
              variant="secondary"
              onClick={() => dispatch({ type: "PAUSE_DISCUSSION" })}
              fullWidth
            >
              一時停止
            </Button>
          ) : state.discussionSeconds > 0 ? (
            <Button
              variant="secondary"
              onClick={() => dispatch({ type: "RESUME_DISCUSSION" })}
              fullWidth
            >
              再開
            </Button>
          ) : null}
          <Button
            onClick={() => dispatch({ type: "END_DISCUSSION" })}
            fullWidth
          >
            投票へ進む
          </Button>
        </div>
      </Card>

      {showAiInterject && (
        <Card className="flex flex-col gap-3">
          <div className="font-semibold">🤖 AIの発言</div>
          {state.aiUtterances.length === 0 ? (
            <div className="text-sm text-zinc-500">
              ボタンを押すと AI が一言コメントします
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {state.aiUtterances.map((u, i) => (
                <li
                  key={i}
                  className="rounded-2xl bg-indigo-50 dark:bg-indigo-950 px-3 py-2 text-sm text-indigo-900 dark:text-indigo-100"
                >
                  {u}
                </li>
              ))}
            </ul>
          )}
          <Button
            variant="secondary"
            onClick={fetchAiUtterance}
            disabled={aiLoading}
            fullWidth
          >
            {aiLoading ? "AIが考え中…" : "AIに一言もらう"}
          </Button>
        </Card>
      )}
    </div>
  );
}
