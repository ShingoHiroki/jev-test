import type { CandidateMove } from "./types";

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let n = Math.imul(t ^ (t >>> 15), 1 | t);
    n ^= n + Math.imul(n ^ (n >>> 7), 61 | n);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}

function scoreMove(move: CandidateMove, random: number): number {
  return (
    (move.promotion ? 6 : 0) +
    (move.check ? 3 : 0) +
    (move.capture ? 2 : 0) +
    random
  );
}

export function pickDemoMove(
  legalMoves: CandidateMove[],
  seed: string,
): CandidateMove {
  if (legalMoves.length === 0) {
    throw new Error("合法手がありません");
  }

  const random = mulberry32(hashSeed(seed));
  let best = legalMoves[0];
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const move of legalMoves) {
    const scored = scoreMove(move, random());
    if (scored > bestScore) {
      best = move;
      bestScore = scored;
    }
  }

  return best;
}

export function demoThinkDelayMs(seed: string): number {
  const random = mulberry32(hashSeed(`delay:${seed}`));
  return 90 + Math.floor(random() * 220);
}

export async function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (!signal) {
    await new Promise((resolve) => setTimeout(resolve, ms));
    return;
  }
  if (signal.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal.addEventListener("abort", onAbort, { once: true });
  });
}
