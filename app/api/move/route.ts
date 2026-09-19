import { NextResponse } from "next/server";
import { playNextMove } from "@/lib/play";
import { allowJevMove } from "@/lib/rate-limit";
import type { EngineMode } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { fen?: string; mode?: EngineMode };
    if (!body.fen || typeof body.fen !== "string") {
      return NextResponse.json({ error: "fen が必要です" }, { status: 400 });
    }

    const mode = body.mode === "demo" ? "demo" : "jev";
    if (mode === "jev" && !allowJevMove(request)) {
      return NextResponse.json(
        { error: "Jev の呼び出しが多すぎます。しばらく待ってから再開してください。" },
        { status: 429 },
      );
    }

    const result = await playNextMove({ fen: body.fen, mode });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "指し手の取得に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
