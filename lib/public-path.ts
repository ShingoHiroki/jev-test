export const REPO_NAME = "jev-test";

export function publicBasePath(): string {
  return process.env.NEXT_PUBLIC_BASE_PATH ?? "";
}

export function apiUrl(path: string): string {
  const base = publicBasePath();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
