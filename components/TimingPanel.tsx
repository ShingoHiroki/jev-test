import type { PlyRecord } from "@/lib/types";
import { formatMs, formatPercent, summarizeTiming } from "@/lib/timing";

export function TimingPanel({
  plies,
  thinking,
  thinkMs,
  thinkingColor,
}: {
  plies: PlyRecord[];
  thinking: boolean;
  thinkMs: number;
  thinkingColor: "white" | "black";
}) {
  const summary = summarizeTiming(plies);
  const chartMax = Math.max(summary.maxMs, thinkMs, 250);

  return (
    <section className="panel timing-panel">
      <header className="panel-head">
        <div>
          <p className="eyebrow">判断時間</p>
          <h2>何ミリ秒で指したか</h2>
        </div>
      </header>

      <div className="stats">
        <Stat label="白 平均" value={summary.whiteCount ? formatMs(summary.whiteAvgMs) : "—"} tone="white" />
        <Stat label="黒 平均" value={summary.blackCount ? formatMs(summary.blackAvgMs) : "—"} tone="black" />
        <Stat label="最長" value={summary.count ? formatMs(summary.maxMs) : "—"} />
        <Stat label="合計" value={summary.count ? formatMs(summary.totalMs) : "—"} />
      </div>

      <div className="chart" aria-label="判断時間の棒グラフ">
        {plies.length === 0 && !thinking ? (
          <p className="empty">対局を始めると、各手の判断時間がここに並びます。</p>
        ) : (
          <>
            {plies.map((ply) => (
              <div className="bar-row" key={`${ply.ply}-${ply.uci}`}>
                <span className="bar-label">
                  {ply.ply}. {ply.san}
                </span>
                <div className="bar-track">
                  <div
                    className={`bar ${ply.color}`}
                    style={{ width: `${Math.max(6, (ply.latencyMs / chartMax) * 100)}%` }}
                  />
                </div>
                <span className="bar-time">{formatMs(ply.latencyMs)}</span>
              </div>
            ))}
            {thinking ? (
              <div className="bar-row thinking">
                <span className="bar-label">
                  {plies.length + 1}. {thinkingColor === "white" ? "白" : "黒"}…
                </span>
                <div className="bar-track">
                  <div
                    className={`bar ${thinkingColor} live`}
                    style={{ width: `${Math.max(6, (thinkMs / chartMax) * 100)}%` }}
                  />
                </div>
                <span className="bar-time">{formatMs(thinkMs)}</span>
              </div>
            ) : null}
          </>
        )}
      </div>

      <div className="score-sheet">
        <h3>スコアシート</h3>
        {plies.length === 0 ? (
          <p className="empty">まだ指し手はありません。</p>
        ) : (
          <ol>
            {groupPairs(plies).map((pair) => (
              <li key={pair.moveNumber}>
                <span className="move-no">{pair.moveNumber}.</span>
                <MoveCell ply={pair.white} />
                <MoveCell ply={pair.black} />
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "white" | "black";
}) {
  return (
    <div className={`stat ${tone ?? ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MoveCell({ ply }: { ply?: PlyRecord }) {
  if (!ply) return <span className="move-cell muted">—</span>;
  return (
    <span className={`move-cell ${ply.color}`} title={ply.uci}>
      <em>{ply.san}</em>
      <small>
        {formatMs(ply.latencyMs)}
        {ply.confidence != null ? ` · 自信 ${formatPercent(ply.confidence)}` : ""}
      </small>
    </span>
  );
}

function groupPairs(plies: PlyRecord[]) {
  const pairs: { moveNumber: number; white?: PlyRecord; black?: PlyRecord }[] = [];
  for (const ply of plies) {
    const moveNumber = Math.ceil(ply.ply / 2);
    let pair = pairs.find((item) => item.moveNumber === moveNumber);
    if (!pair) {
      pair = { moveNumber };
      pairs.push(pair);
    }
    if (ply.color === "white") pair.white = ply;
    else pair.black = ply;
  }
  return pairs;
}
