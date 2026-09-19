import { choice, TypeSafeClient } from "@typesafe-ai/sdk";
import type { CandidateMove } from "./types";
import { describeCandidate, MAX_CHOICES } from "./chess";

export type JevDecision = {
  uci: string;
  confidence: number | null;
  probabilities: Record<string, number>;
  model: string;
  inputTokens: number;
};

type ChoiceAnswer = {
  choice?: string;
  confidence?: number;
  probabilities?: Record<string, number>;
};

function buildCriteria(moves: CandidateMove[]): Record<string, string> {
  const criteria: Record<string, string> = {};
  for (const move of moves.slice(0, MAX_CHOICES)) {
    criteria[move.uci] = describeCandidate(move);
  }
  return criteria;
}

function getTypeSafeKey(): string | undefined {
  const key = process.env.TYPESAFE_API_KEY?.trim();
  return key || undefined;
}

function getOpenRouterKey(): string | undefined {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  return key || undefined;
}

export function detectProvider(): "typesafe" | "openrouter" | "none" {
  if (getTypeSafeKey()) return "typesafe";
  if (getOpenRouterKey()) return "openrouter";
  return "none";
}

function buildState(args: {
  fen: string;
  sideToMove: "white" | "black";
  legalMoveCount: number;
}) {
  return {
    game: "standard chess",
    fen: args.fen,
    side_to_move: args.sideToMove,
    legal_move_count: args.legalMoveCount,
    note: `You are ${args.sideToMove}. Choose one legal move. Option keys are UCI (from square, to square, optional promotion piece).`,
  };
}

const MOVE_INSTRUCTIONS =
  "Choose the strongest legal chess move for the side to move. Prefer sound development, king safety, and material. Keys are UCI.";

async function decideWithTypeSafe(
  fen: string,
  sideToMove: "white" | "black",
  moves: CandidateMove[],
): Promise<JevDecision> {
  const client = new TypeSafeClient({
    apiKey: getTypeSafeKey(),
    timeout: 15000,
    retry: { maxRetries: 1 },
  });

  const criteria = buildCriteria(moves);
  const result = await client.systemOne({
    model: "jev-latest",
    state: buildState({ fen, sideToMove, legalMoveCount: moves.length }),
    questions: {
      move: choice(MOVE_INSTRUCTIONS, criteria),
    },
  });

  const answer = result.answers.move;
  return {
    uci: String(answer.choice),
    confidence: answer.confidence,
    probabilities: { ...answer.probabilities },
    model: result.model,
    inputTokens: result.usage.input_tokens,
  };
}

async function decideWithOpenRouter(
  fen: string,
  sideToMove: "white" | "black",
  moves: CandidateMove[],
): Promise<JevDecision> {
  const response = await fetch("https://openrouter.ai/api/alpha/decisions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getOpenRouterKey()}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://github.com/ShingoHiroki/jev-test",
      "X-OpenRouter-Title": "Jev Chess Watch",
    },
    body: JSON.stringify({
      model: "typesafe/jev-1.13",
      state: buildState({ fen, sideToMove, legalMoveCount: moves.length }),
      questions: {
        move: {
          type: "choice",
          instructions: MOVE_INSTRUCTIONS,
          criteria: buildCriteria(moves),
        },
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenRouter Jev 呼び出しに失敗しました (${response.status}): ${detail}`);
  }

  const payload = (await response.json()) as {
    model?: string;
    answers?: { move?: ChoiceAnswer };
    usage?: { input_tokens?: number };
  };
  const answer = payload.answers?.move;
  if (!answer?.choice) {
    throw new Error("Jev が指し手を返しませんでした");
  }

  return {
    uci: answer.choice,
    confidence: answer.confidence ?? null,
    probabilities: answer.probabilities ?? {},
    model: payload.model ?? "typesafe/jev-1.13",
    inputTokens: payload.usage?.input_tokens ?? 0,
  };
}

export async function decideJevMove(args: {
  fen: string;
  sideToMove: "white" | "black";
  moves: CandidateMove[];
}): Promise<JevDecision> {
  const provider = detectProvider();
  if (provider === "typesafe") {
    return decideWithTypeSafe(args.fen, args.sideToMove, args.moves);
  }
  if (provider === "openrouter") {
    return decideWithOpenRouter(args.fen, args.sideToMove, args.moves);
  }
  throw new Error("TYPESAFE_API_KEY または OPENROUTER_API_KEY を設定してください");
}
