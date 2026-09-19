import {
  applyUci,
  colorFromTurn,
  getGameStatus,
  listLegalMoves,
  resolveChosenMove,
  selectCandidateMoves,
  topMoves,
} from "./chess";
import { Chess } from "chess.js";
import { decideJevMove } from "./jev";
import { playDemoMove } from "./play-demo";
import type { EngineMode, MoveResponse } from "./types";

export async function playNextMove(args: {
  fen: string;
  mode: EngineMode;
}): Promise<MoveResponse> {
  if (args.mode === "demo") {
    return playDemoMove(args.fen);
  }

  const game = new Chess(args.fen);
  const statusBefore = getGameStatus(game);
  if (statusBefore.type !== "in_progress") {
    throw new Error("対局はすでに終了しています");
  }

  const legalMoves = listLegalMoves(game);
  if (legalMoves.length === 0) {
    throw new Error("合法手がありません");
  }

  const color = colorFromTurn(game.turn());
  const started = performance.now();

  let chosen = legalMoves[0];
  let confidence: number | null = 1;
  let probabilities: Record<string, number> = { [chosen.uci]: 1 };
  let model = "forced-move";
  let inputTokens = 0;

  if (legalMoves.length > 1) {
    const candidates = selectCandidateMoves(legalMoves);
    const decision = await decideJevMove({
      fen: args.fen,
      sideToMove: color,
      moves: candidates,
    });
    chosen = resolveChosenMove(decision.uci, legalMoves, decision.probabilities);
    confidence = decision.confidence;
    probabilities = decision.probabilities;
    model = decision.model;
    inputTokens = decision.inputTokens;
  }

  const latencyMs = Math.max(0, Math.round(performance.now() - started));
  const played = applyUci(game, chosen.uci);

  return {
    uci: chosen.uci,
    san: played.san,
    fenAfter: game.fen(),
    color,
    latencyMs,
    confidence,
    probability: probabilities[chosen.uci] ?? null,
    topMoves: topMoves(legalMoves, probabilities),
    model,
    inputTokens,
    legalMoveCount: legalMoves.length,
    status: getGameStatus(game),
  };
}
