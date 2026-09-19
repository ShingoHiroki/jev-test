import { corsJson, corsPreflight } from "@/lib/cors";
import { detectProvider } from "@/lib/jev";
import type { HealthResponse } from "@/lib/types";

export function OPTIONS(request: Request) {
  return corsPreflight(request);
}

export async function GET(request: Request) {
  const body: HealthResponse = { provider: detectProvider() };
  return corsJson(request, body);
}
