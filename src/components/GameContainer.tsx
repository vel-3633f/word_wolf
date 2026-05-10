"use client";

import { useGame } from "@/lib/game/context";
import { StartPhase } from "@/components/phases/StartPhase";
import { TopicPhase } from "@/components/phases/TopicPhase";
import { RevealPhase } from "@/components/phases/RevealPhase";
import { DiscussionPhase } from "@/components/phases/DiscussionPhase";
import { VotePhase } from "@/components/phases/VotePhase";
import { ResultPhase } from "@/components/phases/ResultPhase";
import { Toast } from "@/components/ui/Toast";

export function GameContainer() {
  const { state, dispatch } = useGame();

  return (
    <div className="mx-auto max-w-md w-full px-4 py-6 flex flex-col gap-4">
      {state.error && (
        <Toast
          message={state.error}
          variant="error"
          onClose={() => dispatch({ type: "SET_ERROR", error: null })}
        />
      )}
      {(() => {
        switch (state.phase) {
          case "start":
            return <StartPhase />;
          case "topic":
            return <TopicPhase />;
          case "reveal":
            return <RevealPhase />;
          case "discussion":
            return <DiscussionPhase />;
          case "vote":
            return <VotePhase />;
          case "result":
            return <ResultPhase />;
        }
      })()}
    </div>
  );
}
