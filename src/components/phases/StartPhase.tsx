"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useGame } from "@/lib/game/context";
import type { Mode, Player, Topic } from "@/lib/game/types";
import { shuffle } from "@/lib/utils";

export function StartPhase() {
  const { state, dispatch } = useGame();
  const [human1, setHuman1] = useState(state.human1Name);
  const [human2, setHuman2] = useState(state.human2Name);
  const [mode, setMode] = useState<Mode>(state.mode);
  const [gmGreeting, setGmGreeting] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  async function start() {
    setStarting(true);
    dispatch({ type: "SET_NAMES", human1, human2 });
    dispatch({ type: "SET_MODE", mode });
    dispatch({ type: "START_TOPIC_LOADING" });

    try {
      const [topicRes, gmRes] = await Promise.all([
        fetch("/api/topic", { method: "POST" }),
        fetch("/api/gm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scene: "opening" }),
        }),
      ]);
      const topic = (await topicRes.json()) as Topic;
      const gm = (await gmRes.json()) as { message: string };
      setGmGreeting(gm.message);

      const players = buildPlayers(mode, human1, human2, topic);
      dispatch({ type: "TOPIC_LOADED", topic, players });
    } catch (e) {
      console.error(e);
      dispatch({
        type: "SET_ERROR",
        error: "ゲームの開始に失敗しました。再試行してください。",
      });
      dispatch({ type: "SET_LOADING", loading: false });
      setStarting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="text-center flex flex-col gap-2">
        <div className="text-3xl font-bold tracking-tight">🐺 ワードウルフ</div>
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          AI ゲームマスターと一緒に遊ぼう
        </div>
        {gmGreeting && (
          <div className="mt-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950 px-4 py-3 text-sm text-indigo-900 dark:text-indigo-100">
            🎙️ {gmGreeting}
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-semibold">プレイヤー1の名前</label>
          <input
            value={human1}
            onChange={(e) => setHuman1(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2"
            maxLength={10}
          />
        </div>
        <div>
          <label className="text-sm font-semibold">プレイヤー2の名前</label>
          <input
            value={human2}
            onChange={(e) => setHuman2(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2"
            maxLength={10}
          />
        </div>

        <div>
          <div className="text-sm font-semibold mb-2">モード</div>
          <div className="grid grid-cols-1 gap-2">
            <ModeOption
              selected={mode === "3p"}
              onClick={() => setMode("3p")}
              title="3人モード（標準）"
              description="AIも一緒にプレイ。AIがウルフになることもある王道ルール"
            />
            <ModeOption
              selected={mode === "2p"}
              onClick={() => setMode("2p")}
              title="2人モード（変則）"
              description="二人で別々のワード。相手と同じワードかを当て合う"
            />
          </div>
        </div>

        <Button onClick={start} disabled={starting} fullWidth>
          {starting ? "準備中…" : "ゲームを始める"}
        </Button>
      </Card>
    </div>
  );
}

function ModeOption({
  selected,
  onClick,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-2xl border-2 px-4 py-3 text-left transition-colors " +
        (selected
          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950"
          : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800")
      }
    >
      <div className="font-semibold">{title}</div>
      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
        {description}
      </div>
    </button>
  );
}

function buildPlayers(
  mode: Mode,
  human1: string,
  human2: string,
  topic: Topic,
): Player[] {
  if (mode === "3p") {
    const ids = ["human1", "human2", "ai"] as const;
    const wolfIndex = Math.floor(Math.random() * 3);
    const players: Player[] = ids.map((id, i) => ({
      id,
      name: id === "human1" ? human1 : id === "human2" ? human2 : "AI",
      word: i === wolfIndex ? topic.minorityWord : topic.majorityWord,
      isWolf: i === wolfIndex,
    }));
    return shuffle(players);
  }

  // 2p mode: 50% same word, 50% different.
  const sameWord = Math.random() < 0.5;
  const human1Word = topic.majorityWord;
  const human2Word = sameWord ? topic.majorityWord : topic.minorityWord;
  const players: Player[] = [
    { id: "human1", name: human1, word: human1Word, isWolf: false },
    { id: "human2", name: human2, word: human2Word, isWolf: false },
  ];
  return players;
}
