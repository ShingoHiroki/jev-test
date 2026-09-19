import { corsJson, corsPreflight } from "@/lib/cors";
import { playNextMove } from "@/lib/play";
import { allowJevMove } from "@/lib/rate-limit";
import type { EngineMode } from "@/lib/types";

export function OPTIONS(request: Request) {
  return corsPreflight(request);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { fen?: string; mode?: EngineMode };
    if (!body.fen || typeof body.fen !== "string") {
      return corsJson(request, { error: "fen が必要です" }, 400);
    }

    const mode = body.mode === "demo" ? "demo" : "jev";
    if (mode === "jev" && !allowJevMove(request)) {
      return corsJson(
        request,
        { error: "Jev の呼び出しが多すぎます。しばらく待ってから再開してください。" },
        429,
      );
    }

    const result = await playNextMove({ fen: body.fen, mode });
    return corsJson(request, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "指し手の取得に失敗しました";
    return corsJson(request, { error: message }, 500);
  }
}
