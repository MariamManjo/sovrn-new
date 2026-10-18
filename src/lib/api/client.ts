import { API_BASE } from "./config";

/** GET JSON from the playtest API; any failure resolves to `fallback` so pages never crash. */
export async function getJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(API_BASE + path, { signal: AbortSignal.timeout(5_000) });
    return res.ok ? ((await res.json()) as T) : fallback;
  } catch {
    return fallback;
  }
}

export const LIVE = { refetchInterval: 10_000, staleTime: 5_000 } as const;
