import { describe, expect, it } from "vitest";
import { Chess } from "chess.js";
import {
  MAX_CHOICES,
  applyUci,
  describeCandidate,
  getGameStatus,
  listLegalMoves,
  resolveChosenMove,
  selectCandidateMoves,
  toUci,
} from "@/lib/chess";
import { pickDemoMove } from "@/lib/demo-engine";
import { playNextMove } from "@/lib/play";
import { summarizeTiming } from "@/lib/timing";
import type { CandidateMove, PlyRecord } from "@/lib/types";

describe("chess helpers", () => {
  it("lists legal starting moves as UCI", () => {
    const game = new Chess();
    const moves = listLegalMoves(game);
    expect(moves.length).toBe(20);
    expect(moves.some((move) => move.uci === "e2e4")).toBe(true);
    expect(toUci(game.moves({ verbose: true }).find((move) => move.san === "e4")!)).toBe("e2e4");
  });

  it("applies a UCI move and reports checkmate", () => {
    const game = new Chess();
    applyUci(game, "f2f3");
    applyUci(game, "e7e5");
    applyUci(game, "g2g4");
    applyUci(game, "d8h4");
    expect(getGameStatus(game)).toEqual({ type: "checkmate", winner: "black" });
  });

  it("caps candidate moves at 255 while keeping checks and captures", () => {
    const moves: CandidateMove[] = Array.from({ length: 260 }, (_, index) => ({
      uci: `a1${String(index).padStart(3, "0")}`,
      san: `X${index}`,
      capture: index === 259,
      check: index === 258,
    }));
    const selected = selectCandidateMoves(moves);
    expect(selected).toHaveLength(MAX_CHOICES);
    expect(selected.some((move) => move.capture)).toBe(true);
    expect(selected.some((move) => move.check)).toBe(true);
  });

  it("falls back to the highest-probability legal move", () => {
    const legal: CandidateMove[] = [
      { uci: "e2e4", san: "e4", capture: false, check: false },
      { uci: "d2d4", san: "d4", capture: false, check: false },
    ];
    expect(resolveChosenMove("zzzz", legal, { e2e4: 0.1, d2d4: 0.8 }).uci).toBe("d2d4");
  });

  it("describes captures and promotions", () => {
    expect(
      describeCandidate({
        uci: "e7e8q",
        san: "e8=Q",
        capture: false,
        check: true,
        promotion: "q",
      }),
    ).toContain("promote to q");
  });
});

describe("demo engine", () => {
  it("always returns a legal move for the same seed", () => {
    const game = new Chess();
    const legal = listLegalMoves(game);
    const first = pickDemoMove(legal, "start");
    const second = pickDemoMove(legal, "start");
    expect(legal.map((move) => move.uci)).toContain(first.uci);
    expect(first.uci).toBe(second.uci);
  });
});

describe("timing summary", () => {
  it("averages white and black decision times separately", () => {
    const plies: PlyRecord[] = [
      {
        ply: 1,
        color: "white",
        san: "e4",
        uci: "e2e4",
        latencyMs: 100,
        confidence: 0.8,
        probability: 0.5,
        topMoves: [],
        model: "demo-engine",
      },
      {
        ply: 2,
        color: "black",
        san: "e5",
        uci: "e7e5",
        latencyMs: 300,
        confidence: 0.7,
        probability: 0.4,
        topMoves: [],
        model: "demo-engine",
      },
      {
        ply: 3,
        color: "white",
        san: "Nf3",
        uci: "g1f3",
        latencyMs: 200,
        confidence: 0.6,
        probability: 0.3,
        topMoves: [],
        model: "demo-engine",
      },
    ];
    expect(summarizeTiming(plies)).toMatchObject({
      count: 3,
      whiteAvgMs: 150,
      blackAvgMs: 300,
      maxMs: 300,
      totalMs: 600,
    });
  });
});

describe("playNextMove demo", () => {
  it("returns a legal SAN move and a later FEN", async () => {
    const result = await playNextMove({
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      mode: "demo",
    });
    const game = new Chess();
    expect(game.moves()).toContain(result.san);
    expect(result.fenAfter).not.toBe(game.fen());
    expect(result.color).toBe("white");
    expect(result.latencyMs).toBeGreaterThan(0);
    expect(result.model).toBe("demo-engine");
  });
});
