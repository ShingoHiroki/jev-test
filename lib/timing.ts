import type { PlyRecord, TimingSummary } from "./types";

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function summarizeTiming(plies: PlyRecord[]): TimingSummary {
  const white = plies.filter((ply) => ply.color === "white").map((ply) => ply.latencyMs);
  const black = plies.filter((ply) => ply.color === "black").map((ply) => ply.latencyMs);
  const all = plies.map((ply) => ply.latencyMs);

  return {
    count: plies.length,
    whiteCount: white.length,
    blackCount: black.length,
    whiteAvgMs: average(white),
    blackAvgMs: average(black),
    maxMs: all.length === 0 ? 0 : Math.max(...all),
    totalMs: all.reduce((sum, value) => sum + value, 0),
  };
}

export function formatMs(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export function formatPercent(value: number | null): string {
  if (value == null) return "—";
  return `${Math.round(value * 100)}%`;
}
