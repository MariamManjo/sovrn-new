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

/** POST JSON to the playtest API; throws with the server's error message. */
export async function postJson<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(API_BASE + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new Error("The world is unreachable. Try again.");
  }
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error ? data.error[0]!.toUpperCase() + data.error.slice(1) + "." : `Request failed (${res.status}).`);
  return data as T;
}
