export const REPO_NAME = "jev-test";

export function publicBasePath(): string {
  return process.env.NEXT_PUBLIC_BASE_PATH ?? "";
}

export function apiUrl(path: string): string {
  const apiBase = (process.env.NEXT_PUBLIC_API_BASE ?? "").replace(/\/$/, "");
  const siteBase = publicBasePath();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (apiBase) return `${apiBase}${normalized}`;
  return `${siteBase}${normalized}`;
}
