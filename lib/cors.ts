const EXTRA_ORIGINS = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const ALLOWED_ORIGINS = new Set([
  "http://localhost:3000",
  "https://shingohiroki.github.io",
  ...EXTRA_ORIGINS,
]);

export function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin");
  const allow =
    origin && (ALLOWED_ORIGINS.has(origin) || origin.endsWith(".vercel.app"))
      ? origin
      : "https://shingohiroki.github.io";

  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

export function corsJson(request: Request, body: unknown, status = 200) {
  return Response.json(body, { status, headers: corsHeaders(request) });
}

export function corsPreflight(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}
