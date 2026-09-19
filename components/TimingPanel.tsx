"use client";

import { useEffect, useState } from "react";
import type { PlyRecord } from "@/lib/types";
import { rankedProbabilities, toDecisionJson } from "@/lib/decision";
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
  const [selectedPly, setSelectedPly] = useState<number | null>(null);
  const latestPly = plies.at(-1)?.ply ?? null;
  const shownPly =
    plies.find((ply) => ply.ply === selectedPly) ?? plies.at(-1) ?? null;

  useEffect(() => {
    if (selectedPly != null && !plies.some((ply) => ply.ply === selectedPly)) {
      setSelectedPly(null);
    }
  }, [plies, selectedPly]);

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

      <DecisionCard
        ply={shownPly}
        thinking={thinking && shownPly?.ply === latestPly}
        selected={selectedPly != null}
        onShowLatest={() => setSelectedPly(null)}
      />

      <div className="score-sheet">
        <h3>スコアシート</h3>
        {plies.length === 0 ? (
          <p className="empty">まだ指し手はありません。</p>
        ) : (
          <ol>
            {groupPairs(plies).map((pair) => (
              <li key={pair.moveNumber}>
                <span className="move-no">{pair.moveNumber}.</span>
                <MoveCell
                  ply={pair.white}
                  selected={shownPly?.ply === pair.white?.ply}
                  onSelect={setSelectedPly}
                />
                <MoveCell
                  ply={pair.black}
                  selected={shownPly?.ply === pair.black?.ply}
                  onSelect={setSelectedPly}
                />
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

function DecisionCard({
  ply,
  thinking,
  selected,
  onShowLatest,
}: {
  ply: PlyRecord | null;
  thinking: boolean;
  selected: boolean;
  onShowLatest: () => void;
}) {
  const choices = ply ? rankedProbabilities(ply) : [];
  const json = ply ? JSON.stringify(toDecisionJson(ply), null, 2) : "";

  return (
    <div className="decision-card">
      <div className="decision-head">
        <div>
          <h3>Jev の応答</h3>
          <p className="muted">
            {ply
              ? `${ply.ply}. ${ply.color === "white" ? "白" : "黒"} ${ply.san}（${ply.uci}）`
              : "まだ応答はありません。"}
            {thinking ? " · 次の手を計算中" : ""}
          </p>
        </div>
        {selected ? (
          <button type="button" className="ghost compact" onClick={onShowLatest}>
            最新を表示
          </button>
        ) : null}
      </div>

      {!ply ? (
        <p className="empty">対局を始めると、選択肢と確率の JSON がここに出ます。</p>
      ) : (
        <>
          <div className="choice-list" aria-label="選択肢と確率">
            {choices.length === 0 ? (
              <p className="empty">確率データがありません。</p>
            ) : (
              choices.map((choice) => {
                const chosen = choice.uci === ply.uci;
                return (
                  <div className={`choice-row ${chosen ? "chosen" : ""}`} key={choice.uci}>
                    <span className="choice-label">
                      {choice.san}
                      <small>{choice.uci}</small>
                    </span>
                    <div className="bar-track">
                      <div
                        className={`bar ${ply.color}`}
                        style={{ width: `${Math.max(4, choice.probability * 100)}%` }}
                      />
                    </div>
                    <span className="bar-time">{formatPercent(choice.probability)}</span>
                  </div>
                );
              })
            )}
          </div>
          <pre className="json-block" tabIndex={0}>
            {json}
          </pre>
        </>
      )}
    </div>
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

function MoveCell({
  ply,
  selected,
  onSelect,
}: {
  ply?: PlyRecord;
  selected: boolean;
  onSelect: (ply: number) => void;
}) {
  if (!ply) return <span className="move-cell muted">—</span>;
  return (
    <button
      type="button"
      className={`move-cell ${ply.color}${selected ? " selected" : ""}`}
      title={ply.uci}
      onClick={() => onSelect(ply.ply)}
    >
      <em>{ply.san}</em>
      <small>
        {formatMs(ply.latencyMs)}
        {ply.probability != null ? ` · ${formatPercent(ply.probability)}` : ""}
        {ply.confidence != null ? ` · 自信 ${formatPercent(ply.confidence)}` : ""}
      </small>
    </button>
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
