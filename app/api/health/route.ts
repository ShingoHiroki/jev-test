import { NextResponse } from "next/server";
import { detectProvider } from "@/lib/jev";
import type { HealthResponse } from "@/lib/types";

export async function GET() {
  const body: HealthResponse = { provider: detectProvider() };
  return NextResponse.json(body);
}
