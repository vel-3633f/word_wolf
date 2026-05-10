import { GameProvider } from "@/lib/game/context";
import { GameContainer } from "@/components/GameContainer";

export default function Home() {
  return (
    <main className="flex flex-1 min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <GameProvider>
        <GameContainer />
      </GameProvider>
    </main>
  );
}
