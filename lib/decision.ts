import type { PlyRecord, RankedMove } from "./types";

export type DecisionJson = {
  model: string;
  answers: {
    move: {
      choice: string;
      confidence: number | null;
      probabilities: Record<string, number>;
    };
  };
  usage: {
    input_tokens: number;
  };
};

export function toDecisionJson(ply: PlyRecord): DecisionJson {
  return {
    model: ply.model,
    answers: {
      move: {
        choice: ply.uci,
        confidence: ply.confidence,
        probabilities: ply.probabilities,
      },
    },
    usage: {
      input_tokens: ply.inputTokens,
    },
  };
}

export function rankedProbabilities(ply: PlyRecord, limit = 8): RankedMove[] {
  const sanByUci = new Map(ply.topMoves.map((move) => [move.uci, move.san]));
  return Object.entries(ply.probabilities)
    .map(([uci, probability]) => ({
      uci,
      san: sanByUci.get(uci) ?? uci,
      probability,
    }))
    .sort((a, b) => b.probability - a.probability || a.uci.localeCompare(b.uci))
    .slice(0, limit);
}
