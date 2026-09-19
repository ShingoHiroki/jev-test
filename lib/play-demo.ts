import { Chess } from "chess.js";
import {
  applyUci,
  colorFromTurn,
  getGameStatus,
  listLegalMoves,
  topMoves,
} from "./chess";
import { demoThinkDelayMs, pickDemoMove, sleep } from "./demo-engine";
import type { MoveResponse } from "./types";

export async function playDemoMove(
  fen: string,
  signal?: AbortSignal,
): Promise<MoveResponse> {
  const game = new Chess(fen);
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

  if (legalMoves.length > 1) {
    const seed = `${fen}:${legalMoves.length}`;
    await sleep(demoThinkDelayMs(seed), signal);
    chosen = pickDemoMove(legalMoves, seed);
    confidence = 0.55;
    probabilities = Object.fromEntries(
      legalMoves.map((move) => [
        move.uci,
        move.uci === chosen.uci ? 0.55 : 0.45 / (legalMoves.length - 1),
      ]),
    );
    model = "demo-engine";
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
    inputTokens: 0,
    legalMoveCount: legalMoves.length,
    status: getGameStatus(game),
  };
}
