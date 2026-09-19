import type { ReactNode } from "react";
import type { Color } from "@/lib/types";

const UNICODE: Record<string, string> = {
  wK: "♔",
  wQ: "♕",
  wR: "♖",
  wB: "♗",
  wN: "♘",
  wP: "♙",
  bK: "♚",
  bQ: "♛",
  bR: "♜",
  bB: "♝",
  bN: "♞",
  bP: "♟",
};

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

type Piece = { type: string; color: "w" | "b" };

export function ChessBoard({
  fen,
  lastMove,
  orientation = "white",
}: {
  fen: string;
  lastMove?: { from: string; to: string } | null;
  orientation?: Color;
}) {
  const placement = fen.split(" ")[0];
  const ranks = placement.split("/");
  const rows =
    orientation === "white" ? ranks : [...ranks].reverse().map((rank) => [...rank].reverse().join(""));

  return (
    <div className="board" role="img" aria-label="チェス盤">
      {rows.flatMap((rank, rankIndex) => {
        const squares: ReactNode[] = [];
        let fileIndex = 0;
        for (const char of rank) {
          if (char >= "1" && char <= "8") {
            const empty = Number(char);
            for (let i = 0; i < empty; i += 1) {
              squares.push(
                renderSquare({
                  rankIndex,
                  fileIndex,
                  piece: null,
                  lastMove,
                  orientation,
                }),
              );
              fileIndex += 1;
            }
          } else {
            const color = char === char.toUpperCase() ? "w" : "b";
            squares.push(
              renderSquare({
                rankIndex,
                fileIndex,
                piece: { type: char.toLowerCase(), color },
                lastMove,
                orientation,
              }),
            );
            fileIndex += 1;
          }
        }
        return squares;
      })}
    </div>
  );
}

function squareName(rankIndex: number, fileIndex: number, orientation: Color): string {
  const file = orientation === "white" ? FILES[fileIndex] : FILES[7 - fileIndex];
  const rank = orientation === "white" ? 8 - rankIndex : rankIndex + 1;
  return `${file}${rank}`;
}

function renderSquare({
  rankIndex,
  fileIndex,
  piece,
  lastMove,
  orientation,
}: {
  rankIndex: number;
  fileIndex: number;
  piece: Piece | null;
  lastMove?: { from: string; to: string } | null;
  orientation: Color;
}) {
  const name = squareName(rankIndex, fileIndex, orientation);
  const isDark = (rankIndex + fileIndex) % 2 === 1;
  const isLast = lastMove?.from === name || lastMove?.to === name;
  const showFile = rankIndex === 7;
  const showRank = fileIndex === 0;

  return (
    <div
      key={name}
      className={`square ${isDark ? "dark" : "light"}${isLast ? " last" : ""}`}
    >
      {piece ? (
        <span className={`piece ${piece.color === "w" ? "white-piece" : "black-piece"}`}>
          {UNICODE[`${piece.color}${piece.type.toUpperCase()}`]}
        </span>
      ) : null}
      {showFile ? <span className="coord file">{name[0]}</span> : null}
      {showRank ? <span className="coord rank">{name[1]}</span> : null}
    </div>
  );
}
