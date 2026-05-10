import type { GovernanceCheckpoint } from "../types";

export async function bgaSeal(stageId: string, verdict: string, confidence: number): Promise<GovernanceCheckpoint> {
  const timestamp = new Date();
  const payload = `${stageId}|${verdict}|${confidence}|${timestamp.toISOString()}`;

  try {
    const res = await fetch("https://api.bga.network/v1/seal", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_BGA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payload, stageId }),
    });
    if (res.ok) {
      const data = (await res.json()) as { hash?: string };
      if (data.hash) {
        return { id: crypto.randomUUID(), stageId, timestamp, hash: data.hash, confidence, verdict };
      }
    }
  } catch {
    // Fall through to a browser-native checkpoint hash.
  }

  const buffer = new TextEncoder().encode(payload);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hash = Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);

  return { id: crypto.randomUUID(), stageId, timestamp, hash, confidence, verdict };
}
