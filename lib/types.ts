export type Color = "white" | "black";
export type EngineMode = "jev" | "demo";

export type CandidateMove = {
  uci: string;
  san: string;
  capture: boolean;
  check: boolean;
  promotion?: string;
};

export type RankedMove = {
  uci: string;
  san: string;
  probability: number;
};

export type GameStatus =
  | { type: "in_progress"; inCheck: boolean }
  | { type: "checkmate"; winner: Color }
  | { type: "draw"; reason: string };

export type MoveRequest = {
  fen: string;
  mode: EngineMode;
};

export type MoveResponse = {
  uci: string;
  san: string;
  fenAfter: string;
  color: Color;
  latencyMs: number;
  confidence: number | null;
  probability: number | null;
  topMoves: RankedMove[];
  model: string;
  inputTokens: number;
  legalMoveCount: number;
  status: GameStatus;
};

export type PlyRecord = {
  ply: number;
  color: Color;
  san: string;
  uci: string;
  latencyMs: number;
  confidence: number | null;
  probability: number | null;
  topMoves: RankedMove[];
  model: string;
};

export type TimingSummary = {
  count: number;
  whiteCount: number;
  blackCount: number;
  whiteAvgMs: number;
  blackAvgMs: number;
  maxMs: number;
  totalMs: number;
};

export type HealthResponse = {
  provider: "typesafe" | "openrouter" | "none";
};
