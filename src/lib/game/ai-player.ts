import type { Player, PlayerId } from "./types";
import { pickRandom } from "../utils";

export function decideAiVote(players: Player[]): PlayerId {
  const candidates = players.filter((p) => p.id !== "ai").map((p) => p.id);
  return pickRandom(candidates);
}
