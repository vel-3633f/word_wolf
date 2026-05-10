import type { Action, GameState } from "./types";

export const initialState: GameState = {
  mode: "3p",
  phase: "start",
  players: [],
  topic: null,
  currentRevealIndex: 0,
  revealedThisTurn: false,
  votes: {},
  twoPlayerGuesses: {},
  discussionSeconds: 180,
  discussionRunning: false,
  aiUtterances: [],
  human1Name: "プレイヤー1",
  human2Name: "プレイヤー2",
  loading: false,
  loadingMessage: "",
  error: null,
  resultNarration: null,
  winner: null,
};

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "SET_NAMES":
      return { ...state, human1Name: action.human1, human2Name: action.human2 };
    case "SET_MODE":
      return { ...state, mode: action.mode };
    case "START_TOPIC_LOADING":
      return {
        ...state,
        phase: "topic",
        loading: true,
        loadingMessage: "AI GMがお題を考えています…",
        error: null,
      };
    case "TOPIC_LOADED":
      return {
        ...state,
        phase: "reveal",
        loading: false,
        loadingMessage: "",
        topic: action.topic,
        players: action.players,
        currentRevealIndex: 0,
        revealedThisTurn: false,
        votes: {},
        twoPlayerGuesses: {},
        aiUtterances: [],
        resultNarration: null,
        winner: null,
      };
    case "BEGIN_REVEAL":
      return { ...state, phase: "reveal" };
    case "TOGGLE_REVEAL":
      return { ...state, revealedThisTurn: action.revealed };
    case "NEXT_REVEAL": {
      const next = state.currentRevealIndex + 1;
      if (next >= state.players.length) {
        return {
          ...state,
          phase: "discussion",
          discussionRunning: true,
          revealedThisTurn: false,
        };
      }
      return {
        ...state,
        currentRevealIndex: next,
        revealedThisTurn: false,
      };
    }
    case "START_DISCUSSION":
      return {
        ...state,
        phase: "discussion",
        discussionSeconds: action.seconds,
        discussionRunning: true,
      };
    case "TICK":
      if (!state.discussionRunning) return state;
      if (state.discussionSeconds <= 0)
        return { ...state, discussionRunning: false };
      return { ...state, discussionSeconds: state.discussionSeconds - 1 };
    case "PAUSE_DISCUSSION":
      return { ...state, discussionRunning: false };
    case "RESUME_DISCUSSION":
      return { ...state, discussionRunning: true };
    case "END_DISCUSSION":
      return {
        ...state,
        phase: "vote",
        discussionRunning: false,
        votes: {},
        twoPlayerGuesses: {},
      };
    case "ADD_AI_UTTERANCE":
      return {
        ...state,
        aiUtterances: [...state.aiUtterances, action.utterance],
      };
    case "CAST_VOTE":
      return {
        ...state,
        votes: { ...state.votes, [action.voter]: action.target },
      };
    case "CAST_GUESS":
      return {
        ...state,
        twoPlayerGuesses: {
          ...state.twoPlayerGuesses,
          [action.voter]: action.guess,
        },
      };
    case "TO_RESULT":
      return {
        ...state,
        phase: "result",
        winner: action.winner,
        resultNarration: action.narration,
        loading: false,
      };
    case "RESET":
      return {
        ...initialState,
        human1Name: state.human1Name,
        human2Name: state.human2Name,
        mode: state.mode,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.loading,
        loadingMessage: action.message ?? "",
      };
    case "SET_ERROR":
      return { ...state, error: action.error };
    default:
      return state;
  }
}
