import type { Color, GameStatus } from "@/lib/types";
import { formatMs } from "@/lib/timing";
import { ChessBoard } from "./ChessBoard";

function statusText(status: GameStatus, thinking: boolean, color: Color): string {
  if (status.type === "checkmate") {
    return `チェックメイト — ${status.winner === "white" ? "白" : "黒"}の勝ち`;
  }
  if (status.type === "draw") {
    return `引き分け（${status.reason}）`;
  }
  if (thinking) {
    return `${color === "white" ? "白" : "黒"}の Jev が考えています`;
  }
  if (status.inCheck) {
    return `${color === "white" ? "白" : "黒"}の番（チェック）`;
  }
  return `${color === "white" ? "白" : "黒"}の番`;
}

export function BoardPanel({
  fen,
  lastMove,
  status,
  turn,
  thinking,
  thinkMs,
  lastSan,
  lastLatencyMs,
}: {
  fen: string;
  lastMove: { from: string; to: string } | null;
  status: GameStatus;
  turn: Color;
  thinking: boolean;
  thinkMs: number;
  lastSan: string | null;
  lastLatencyMs: number | null;
}) {
  return (
    <section className="panel board-panel">
      <header className="panel-head">
        <div>
          <p className="eyebrow">対局</p>
          <h2>Jev vs Jev</h2>
        </div>
        <p className="status-pill">{statusText(status, thinking, turn)}</p>
      </header>

      <PlayerRow
        color="black"
        active={turn === "black" && status.type === "in_progress"}
        thinking={thinking && turn === "black"}
        thinkMs={thinkMs}
      />

      <div className="board-wrap">
        <ChessBoard fen={fen} lastMove={lastMove} />
      </div>

      <PlayerRow
        color="white"
        active={turn === "white" && status.type === "in_progress"}
        thinking={thinking && turn === "white"}
        thinkMs={thinkMs}
      />

      <footer className="board-foot">
        <div>
          <span className="muted">直前の手</span>
          <strong>{lastSan ?? "—"}</strong>
        </div>
        <div>
          <span className="muted">直前の判断時間</span>
          <strong>{lastLatencyMs == null ? "—" : formatMs(lastLatencyMs)}</strong>
        </div>
      </footer>
    </section>
  );
}

function PlayerRow({
  color,
  active,
  thinking,
  thinkMs,
}: {
  color: Color;
  active: boolean;
  thinking: boolean;
  thinkMs: number;
}) {
  const isWhite = color === "white";
  return (
    <div className={`player ${active ? "active" : ""}`}>
      <span className={`dot ${color}`} />
      <div>
        <strong>{isWhite ? "白 · Jev" : "黒 · Jev"}</strong>
        <span>{isWhite ? "White" : "Black"}</span>
      </div>
      {thinking ? <strong className="pulse">{formatMs(thinkMs)}</strong> : null}
    </div>
  );
}
