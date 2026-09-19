import { Chess, type Move, type Square } from "chess.js";
import type { CandidateMove, Color, GameStatus } from "./types";

export const STARTING_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const MAX_CHOICES = 255;

export function parseUci(uci: string): {
  from: Square;
  to: Square;
  promotion?: string;
} {
  const from = uci.slice(0, 2) as Square;
  const to = uci.slice(2, 4) as Square;
  const promotion = uci.length > 4 ? uci.slice(4, 5) : undefined;
  return { from, to, promotion };
}

export function toUci(move: Move): string {
  return `${move.from}${move.to}${move.promotion ?? ""}`;
}

export function colorFromTurn(turn: "w" | "b"): Color {
  return turn === "w" ? "white" : "black";
}

export function describeCandidate(move: CandidateMove): string {
  const flags = [
    move.capture ? "capture" : null,
    move.promotion ? `promote to ${move.promotion}` : null,
    move.check ? "check" : null,
  ].filter(Boolean);

  const extra = flags.length > 0 ? ` [${flags.join(", ")}]` : "";
  return `SAN ${move.san}${extra}`;
}

export function listLegalMoves(game: Chess): CandidateMove[] {
  return game.moves({ verbose: true }).map((move) => ({
    uci: toUci(move),
    san: move.san,
    capture: Boolean(move.captured),
    check: move.san.includes("+") || move.san.includes("#"),
    promotion: move.promotion,
  }));
}

function movePriority(move: CandidateMove): number {
  return (
    (move.promotion ? 8 : 0) +
    (move.check ? 4 : 0) +
    (move.capture ? 2 : 0)
  );
}

export function selectCandidateMoves(moves: CandidateMove[]): CandidateMove[] {
  if (moves.length <= MAX_CHOICES) {
    return [...moves].sort((a, b) => a.uci.localeCompare(b.uci));
  }

  return [...moves]
    .sort((a, b) => {
      const byPriority = movePriority(b) - movePriority(a);
      if (byPriority !== 0) return byPriority;
      return a.uci.localeCompare(b.uci);
    })
    .slice(0, MAX_CHOICES);
}

export function applyUci(game: Chess, uci: string): Move {
  const { from, to, promotion } = parseUci(uci);
  return game.move({ from, to, promotion });
}

export function getGameStatus(game: Chess): GameStatus {
  if (game.isCheckmate()) {
    return { type: "checkmate", winner: colorFromTurn(game.turn() === "w" ? "b" : "w") };
  }
  if (game.isStalemate()) {
    return { type: "draw", reason: "ステイルメイト" };
  }
  if (game.isThreefoldRepetition()) {
    return { type: "draw", reason: "千日手" };
  }
  if (game.isInsufficientMaterial()) {
    return { type: "draw", reason: "駒不足" };
  }
  if (game.isDraw()) {
    return { type: "draw", reason: "引き分け" };
  }
  return { type: "in_progress", inCheck: game.inCheck() };
}

export function resolveChosenMove(
  chosenUci: string | undefined,
  legalMoves: CandidateMove[],
  probabilities: Record<string, number> = {},
): CandidateMove {
  const exact = legalMoves.find((move) => move.uci === chosenUci);
  if (exact) return exact;

  const ranked = [...legalMoves].sort(
    (a, b) => (probabilities[b.uci] ?? 0) - (probabilities[a.uci] ?? 0),
  );
  return ranked[0] ?? legalMoves[0];
}

export function topMoves(
  legalMoves: CandidateMove[],
  probabilities: Record<string, number>,
  limit = 3,
) {
  return [...legalMoves]
    .map((move) => ({
      uci: move.uci,
      san: move.san,
      probability: probabilities[move.uci] ?? 0,
    }))
    .sort((a, b) => b.probability - a.probability)
    .slice(0, limit);
}
