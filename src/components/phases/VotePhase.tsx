"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PlayerHandoff } from "@/components/ui/PlayerHandoff";
import { decideAiVote } from "@/lib/game/ai-player";
import { useGame } from "@/lib/game/context";
import type { PlayerId } from "@/lib/game/types";

export function VotePhase() {
  const { state, dispatch } = useGame();

  if (state.mode === "3p") return <ThreePlayerVote />;
  return <TwoPlayerVote />;

  function ThreePlayerVote() {
    const humans = state.players.filter((p) => p.id !== "ai");
    const [voterIndex, setVoterIndex] = useState(0);
    const [confirmed, setConfirmed] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const voter = humans[voterIndex];

    async function castAndAdvance(target: PlayerId) {
      dispatch({ type: "CAST_VOTE", voter: voter.id, target });
      const next = voterIndex + 1;
      if (next < humans.length) {
        setVoterIndex(next);
        setConfirmed(false);
      } else {
        // すべての人間が投票済み → AIの投票を決定して結果へ
        await finishVoting({
          ...state.votes,
          [voter.id]: target,
        });
      }
    }

    async function finishVoting(
      voteMap: Partial<Record<PlayerId, PlayerId>>,
    ) {
      setSubmitting(true);
      const aiTarget = decideAiVote(state.players);
      const finalVotes: Record<PlayerId, PlayerId> = {
        ...voteMap,
        ai: aiTarget,
      } as Record<PlayerId, PlayerId>;

      // 投票集計
      const tally: Partial<Record<PlayerId, number>> = {};
      for (const t of Object.values(finalVotes)) {
        tally[t] = (tally[t] ?? 0) + 1;
      }
      const maxCount = Math.max(...Object.values(tally) as number[]);
      const top = (Object.entries(tally) as [PlayerId, number][]).filter(
        ([, c]) => c === maxCount,
      );
      // 同点ならランダム
      const votedOut =
        top[Math.floor(Math.random() * top.length)][0] as PlayerId;

      const wolf = state.players.find((p) => p.isWolf)!;
      const winner = votedOut === wolf.id ? "villagers" : "wolf";
      const votedPlayer = state.players.find((p) => p.id === votedOut)!;

      dispatch({ type: "CAST_VOTE", voter: "ai", target: aiTarget });

      // GMの解説を取得
      try {
        const res = await fetch("/api/verdict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "3p",
            winner,
            majorityWord: state.topic!.majorityWord,
            minorityWord: state.topic!.minorityWord,
            theme: state.topic!.theme,
            wolfName: wolf.name,
            votedName: votedPlayer.name,
          }),
        });
        const data = (await res.json()) as { narration: string };
        dispatch({ type: "TO_RESULT", winner, narration: data.narration });
      } catch (e) {
        console.error(e);
        dispatch({
          type: "TO_RESULT",
          winner,
          narration:
            winner === "villagers"
              ? `村人勝利！ウルフは${wolf.name}でした。`
              : `ウルフ${wolf.name}の勝利！見事騙し切りました。`,
        });
      } finally {
        setSubmitting(false);
      }
    }

    if (submitting) {
      return (
        <Card className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="text-lg font-semibold">集計中…</div>
          <div className="size-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </Card>
      );
    }

    if (!confirmed) {
      return (
        <PlayerHandoff
          playerName={voter.name}
          description="他の人に画面が見えないようご注意ください。"
          onConfirm={() => setConfirmed(true)}
        />
      );
    }

    return (
      <Card className="flex flex-col gap-4">
        <div className="text-sm text-zinc-500 text-center">
          {voterIndex + 1} / {humans.length} 人目
        </div>
        <div className="text-center text-xl font-bold">
          {voter.name} さん、ウルフは誰？
        </div>
        <div className="flex flex-col gap-2">
          {state.players
            .filter((p) => p.id !== voter.id)
            .map((p) => (
              <Button
                key={p.id}
                variant="secondary"
                onClick={() => castAndAdvance(p.id)}
                fullWidth
              >
                {p.name} {p.id === "ai" ? "🤖" : ""}
              </Button>
            ))}
        </div>
      </Card>
    );
  }

  function TwoPlayerVote() {
    const [voterIndex, setVoterIndex] = useState(0);
    const [confirmed, setConfirmed] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const voter = state.players[voterIndex];

    async function castAndAdvance(guess: "same" | "different") {
      dispatch({ type: "CAST_GUESS", voter: voter.id, guess });
      const next = voterIndex + 1;
      if (next < state.players.length) {
        setVoterIndex(next);
        setConfirmed(false);
      } else {
        await finishGuessing({
          ...state.twoPlayerGuesses,
          [voter.id]: guess,
        });
      }
    }

    async function finishGuessing(
      guesses: Partial<Record<PlayerId, "same" | "different">>,
    ) {
      setSubmitting(true);
      const [p1, p2] = state.players;
      const actualSame = p1.word === p2.word;
      const expected: "same" | "different" = actualSame ? "same" : "different";
      const h1Correct = guesses[p1.id] === expected;
      const h2Correct = guesses[p2.id] === expected;
      const winner: "humans" | "fail" = h1Correct && h2Correct ? "humans" : "fail";

      try {
        const res = await fetch("/api/verdict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "2p",
            winner,
            majorityWord: state.topic!.majorityWord,
            minorityWord: state.topic!.minorityWord,
            theme: state.topic!.theme,
            human1: { name: p1.name, word: p1.word },
            human2: { name: p2.name, word: p2.word },
            guesses: { human1Correct: h1Correct, human2Correct: h2Correct },
          }),
        });
        const data = (await res.json()) as { narration: string };
        dispatch({ type: "TO_RESULT", winner, narration: data.narration });
      } catch (e) {
        console.error(e);
        dispatch({
          type: "TO_RESULT",
          winner,
          narration:
            winner === "humans"
              ? "二人ともお見事！正解です。"
              : "残念！読み違いがありました。",
        });
      } finally {
        setSubmitting(false);
      }
    }

    if (submitting) {
      return (
        <Card className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="text-lg font-semibold">集計中…</div>
          <div className="size-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </Card>
      );
    }

    if (!confirmed) {
      return (
        <PlayerHandoff
          playerName={voter.name}
          description="他の人に画面が見えないようご注意ください。"
          onConfirm={() => setConfirmed(true)}
        />
      );
    }

    return (
      <Card className="flex flex-col gap-4">
        <div className="text-sm text-zinc-500 text-center">
          {voterIndex + 1} / {state.players.length} 人目
        </div>
        <div className="text-center text-xl font-bold">
          {voter.name} さん、相手のワードは？
        </div>
        <p className="text-sm text-zinc-500 text-center">
          相手は自分と同じワードを引いた？それとも違う？
        </p>
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => castAndAdvance("same")}
            fullWidth
          >
            同じワード
          </Button>
          <Button
            variant="secondary"
            onClick={() => castAndAdvance("different")}
            fullWidth
          >
            違うワード
          </Button>
        </div>
      </Card>
    );
  }
}
