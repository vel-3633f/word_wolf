export type Mode = "2p" | "3p";

export type Phase =
  | "start"
  | "topic"
  | "reveal"
  | "discussion"
  | "vote"
  | "result";

export type PlayerId = "human1" | "human2" | "ai";

export type Player = {
  id: PlayerId;
  name: string;
  word: string;
  isWolf: boolean;
};

export type Topic = {
  majorityWord: string;
  minorityWord: string;
  theme: string;
};

export type GameState = {
  mode: Mode;
  phase: Phase;
  players: Player[];
  topic: Topic | null;
  currentRevealIndex: number;
  revealedThisTurn: boolean;
  votes: Partial<Record<PlayerId, PlayerId>>;
  twoPlayerGuesses: Partial<Record<PlayerId, "same" | "different">>;
  discussionSeconds: number;
  discussionRunning: boolean;
  aiUtterances: string[];
  human1Name: string;
  human2Name: string;
  loading: boolean;
  loadingMessage: string;
  error: string | null;
  resultNarration: string | null;
  winner: "villagers" | "wolf" | "humans" | "fail" | null;
};

export type Action =
  | { type: "SET_NAMES"; human1: string; human2: string }
  | { type: "SET_MODE"; mode: Mode }
  | { type: "START_TOPIC_LOADING" }
  | {
      type: "TOPIC_LOADED";
      topic: Topic;
      players: Player[];
    }
  | { type: "BEGIN_REVEAL" }
  | { type: "TOGGLE_REVEAL"; revealed: boolean }
  | { type: "NEXT_REVEAL" }
  | { type: "START_DISCUSSION"; seconds: number }
  | { type: "TICK" }
  | { type: "PAUSE_DISCUSSION" }
  | { type: "RESUME_DISCUSSION" }
  | { type: "END_DISCUSSION" }
  | { type: "ADD_AI_UTTERANCE"; utterance: string }
  | { type: "CAST_VOTE"; voter: PlayerId; target: PlayerId }
  | { type: "CAST_GUESS"; voter: PlayerId; guess: "same" | "different" }
  | {
      type: "TO_RESULT";
      winner: GameState["winner"];
      narration: string;
    }
  | { type: "RESET" }
  | { type: "SET_LOADING"; loading: boolean; message?: string }
  | { type: "SET_ERROR"; error: string | null };
