"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BoardPanel } from "./BoardPanel";
import { TimingPanel } from "./TimingPanel";
import { STARTING_FEN, colorFromTurn, getGameStatus, parseUci } from "@/lib/chess";
import { playDemoMove } from "@/lib/play-demo";
import { apiUrl } from "@/lib/public-path";
import type { EngineMode, GameStatus, HealthResponse, MoveResponse, PlyRecord } from "@/lib/types";
import { Chess } from "chess.js";

const MAX_PLIES = 200;
type AppState = "idle" | "playing" | "paused" | "finished" | "error";

export function WatchApp() {
  const [fen, setFen] = useState(STARTING_FEN);
  const [plies, setPlies] = useState<PlyRecord[]>([]);
  const [status, setStatus] = useState<GameStatus>({ type: "in_progress", inCheck: false });
  const [appState, setAppState] = useState<AppState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const [thinkMs, setThinkMs] = useState(0);
  const [mode, setMode] = useState<EngineMode>("demo");
  const [provider, setProvider] = useState<HealthResponse["provider"]>("none");
  const [delayMs, setDelayMs] = useState(700);

  const runningRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const fenRef = useRef(fen);
  const pliesRef = useRef(plies);
  const delayRef = useRef(delayMs);
  const modeRef = useRef(mode);

  fenRef.current = fen;
  pliesRef.current = plies;
  delayRef.current = delayMs;
  modeRef.current = mode;

  useEffect(() => {
    fetch(apiUrl("/api/health"))
      .then((res) => {
        if (!res.ok) throw new Error("health unavailable");
        return res.json() as Promise<HealthResponse>;
      })
      .then((health) => {
        setProvider(health.provider);
        if (health.provider !== "none") setMode("jev");
      })
      .catch(() => {
        setProvider("none");
      });
  }, []);

  useEffect(() => {
    if (!thinking) return;
    const started = performance.now();
    const timer = window.setInterval(() => {
      setThinkMs(performance.now() - started);
    }, 50);
    return () => window.clearInterval(timer);
  }, [thinking, fen]);

  const resetBoard = useCallback(() => {
    abortRef.current?.abort();
    runningRef.current = false;
    setFen(STARTING_FEN);
    setPlies([]);
    setStatus({ type: "in_progress", inCheck: false });
    setAppState("idle");
    setError(null);
    setThinking(false);
    setThinkMs(0);
  }, []);

  const playLoop = useCallback(async () => {
    const abort = new AbortController();
    abortRef.current = abort;
    runningRef.current = true;
    setAppState("playing");
    setError(null);

    try {
      while (runningRef.current) {
        const game = new Chess(fenRef.current);
        const current = getGameStatus(game);
        if (current.type !== "in_progress") {
          setStatus(current);
          setAppState("finished");
          break;
        }
        if (pliesRef.current.length >= MAX_PLIES) {
          setAppState("finished");
          setError("200 手に達したので対局を止めました");
          break;
        }

        setThinking(true);
        setThinkMs(0);

        const payload = await requestMove(fenRef.current, modeRef.current, abort.signal);

        const nextPlies: PlyRecord[] = [
          ...pliesRef.current,
          {
            ply: pliesRef.current.length + 1,
            color: payload.color,
            san: payload.san,
            uci: payload.uci,
            latencyMs: payload.latencyMs,
            confidence: payload.confidence,
            probability: payload.probability,
            topMoves: payload.topMoves,
            model: payload.model,
          },
        ];

        setThinking(false);
        setThinkMs(payload.latencyMs);
        setFen(payload.fenAfter);
        setPlies(nextPlies);
        setStatus(payload.status);

        if (payload.status.type !== "in_progress") {
          setAppState("finished");
          break;
        }

        await wait(delayRef.current, abort.signal);
      }
    } catch (err) {
      if (abort.signal.aborted || (err instanceof DOMException && err.name === "AbortError")) {
        return;
      }
      setThinking(false);
      setAppState("error");
      setError(err instanceof Error ? err.message : "対局中にエラーが起きました");
    } finally {
      runningRef.current = false;
      setThinking(false);
    }
  }, []);

  const start = () => {
    if (runningRef.current) return;
    void playLoop();
  };

  const pause = () => {
    runningRef.current = false;
    abortRef.current?.abort();
    setThinking(false);
    setAppState("paused");
  };

  const game = new Chess(fen);
  const turn = colorFromTurn(game.turn());
  const last = plies.at(-1);
  const lastMove = last ? parseUci(last.uci) : null;
  const jevReady = provider !== "none";

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <p className="eyebrow">TypeSafe System One</p>
          <h1>Jev チェス観戦</h1>
        </div>
        <div className="controls">
          <label className="mode">
            エンジン
            <select
              value={mode}
              disabled={appState === "playing"}
              onChange={(event) => setMode(event.target.value as EngineMode)}
            >
              <option value="jev" disabled={!jevReady}>
                Jev {jevReady ? `(${provider})` : "(APIキー未設定)"}
              </option>
              <option value="demo">デモエンジン</option>
            </select>
          </label>
          <label className="mode">
            手と手の間隔
            <input
              type="range"
              min={0}
              max={2000}
              step={100}
              value={delayMs}
              onChange={(event) => setDelayMs(Number(event.target.value))}
            />
            <span>{delayMs} ms</span>
          </label>
          {appState === "playing" ? (
            <button type="button" className="ghost" onClick={pause}>
              一時停止
            </button>
          ) : (
            <button type="button" className="primary" onClick={start} disabled={status.type !== "in_progress"}>
              {appState === "paused" ? "再開" : "対局開始"}
            </button>
          )}
          <button type="button" className="ghost" onClick={resetBoard}>
            リセット
          </button>
        </div>
      </header>

      {!jevReady ? (
        <p className="banner">
          GitHub Pages は静的サイトなので、シークレットの Jev
          キーはここでは使えません。デモ対局は無料です。本物の Jev
          にするには Vercel などにキーを置いてください。
        </p>
      ) : (
        <p className="banner ok">
          Jev 接続先: {provider === "typesafe" ? "TypeSafe API" : "OpenRouter"}。キーはサーバー側にあり、ブラウザには出ていません。
        </p>
      )}

      {error ? <p className="banner error">{error}</p> : null}

      <main className="layout">
        <BoardPanel
          fen={fen}
          lastMove={lastMove}
          status={status}
          turn={turn}
          thinking={thinking}
          thinkMs={thinkMs}
          lastSan={last?.san ?? null}
          lastLatencyMs={last?.latencyMs ?? null}
        />
        <TimingPanel
          plies={plies}
          thinking={thinking}
          thinkMs={thinkMs}
          thinkingColor={turn}
        />
      </main>
    </div>
  );
}

function wait(ms: number, signal: AbortSignal) {
  if (ms <= 0) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      window.clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    if (signal.aborted) {
      onAbort();
      return;
    }
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

async function requestMove(
  fen: string,
  mode: EngineMode,
  signal: AbortSignal,
): Promise<MoveResponse> {
  if (mode === "demo") {
    return playDemoMove(fen, signal);
  }

  const response = await fetch(apiUrl("/api/move"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({ fen, mode }),
  });
  const payload = (await response.json()) as MoveResponse & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? "指し手の取得に失敗しました");
  }
  return payload;
}
