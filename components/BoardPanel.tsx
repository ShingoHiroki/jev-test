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
}: {
  fen: string;
  lastMove: { from: string; to: string } | null;
  status: GameStatus;
  turn: Color;
  thinking: boolean;
  thinkMs: number;
  lastSan: string | null;
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

      <div className="players">
        <div className={`player ${turn === "black" && status.type === "in_progress" ? "active" : ""}`}>
          <span className="dot black" />
          <div>
            <strong>黒 · Jev</strong>
            <span>Black</span>
          </div>
        </div>
        <div className={`player ${turn === "white" && status.type === "in_progress" ? "active" : ""}`}>
          <span className="dot white" />
          <div>
            <strong>白 · Jev</strong>
            <span>White</span>
          </div>
        </div>
      </div>

      <div className="board-wrap">
        <ChessBoard fen={fen} lastMove={lastMove} />
      </div>

      <footer className="board-foot">
        <div>
          <span className="muted">直前の手</span>
          <strong>{lastSan ?? "—"}</strong>
        </div>
        <div>
          <span className="muted">今回の思考時間</span>
          <strong className={thinking ? "pulse" : ""}>
            {thinking ? formatMs(thinkMs) : lastSan ? formatMs(thinkMs) : "—"}
          </strong>
        </div>
      </footer>
    </section>
  );
}
