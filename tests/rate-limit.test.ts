import { describe, expect, it } from "vitest";
import { allowJevMove } from "@/lib/rate-limit";
import { apiUrl } from "@/lib/public-path";

function requestWithIp(ip: string) {
  return new Request("http://localhost/api/move", {
    headers: { "x-forwarded-for": ip },
  });
}

describe("apiUrl", () => {
  it("prefixes the public base path", () => {
    expect(apiUrl("/api/health")).toBe("/api/health");
  });
});

describe("Jev rate limit", () => {
  it("allows a burst then blocks the same IP", () => {
    const ip = `test-${Math.random()}`;
    let allowed = 0;
    let blocked = false;
    for (let i = 0; i < 91; i += 1) {
      if (allowJevMove(requestWithIp(ip))) allowed += 1;
      else blocked = true;
    }
    expect(allowed).toBe(90);
    expect(blocked).toBe(true);
  });
});
