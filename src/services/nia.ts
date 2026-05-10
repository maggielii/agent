import type { NiaResult } from "../types";
import { parseJSON, streamAgent } from "./claude";

function localMarketFallback(idea: string): NiaResult {
  const lower = idea.toLowerCase();
  const domain = lower.includes("health")
    ? "healthcare operations"
    : lower.includes("construction")
      ? "construction management"
      : lower.includes("manufacturing")
        ? "manufacturing operations"
        : lower.includes("blockchain")
          ? "transparent finance"
          : "vertical SaaS";

  return {
    competitors: [
      { name: "Incumbent workflow suites", positioning: `Broad ${domain} platforms with heavy implementation cycles.` },
      { name: "Point solution startups", positioning: "Narrow automation tools focused on one workflow step." },
      { name: "Internal spreadsheets and ops teams", positioning: "Default manual alternative with low software switching cost." },
    ],
    failedStartups: [
      { name: "Generic AI copilots", reason: "Insufficient workflow ownership and weak buyer-specific ROI." },
      { name: "Horizontal automation tools", reason: "Failed to prove urgency inside a specific budget line." },
    ],
    marketSignals: [
      "Buyers increasingly expect auditability from AI-assisted decisions.",
      "Vertical workflows favor narrow wedges with measurable cycle-time reduction.",
      "Procurement scrutiny is high for tools touching regulated or mission-critical operations.",
    ],
    tamEstimate: `Representative ${domain} wedge suggests a focused initial market before horizontal expansion.`,
  };
}

async function niaFallback(idea: string): Promise<NiaResult> {
  try {
    const raw = await streamAgent(
      "cmo",
      `You are producing market research for a venture council. Return valid JSON only matching:
{
  "competitors": [{"name": "string", "positioning": "string"}],
  "failedStartups": [{"name": "string", "reason": "string"}],
  "marketSignals": ["string"],
  "tamEstimate": "string"
}
No markdown fences. No preamble.`,
      `Research competitors, failed startups, market signals, and TAM for: ${idea}`
    );
    return parseJSON<NiaResult>(raw) ?? localMarketFallback(idea);
  } catch {
    return localMarketFallback(idea);
  }
}

export async function niaScan(idea: string): Promise<NiaResult> {
  try {
    const res = await fetch("https://api.nia.so/v1/research", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_NIA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `Market research, competitors, failed startups for: ${idea}`,
        depth: "standard",
      }),
    });
    if (!res.ok) throw new Error("Nia unavailable");
    return (await res.json()) as NiaResult;
  } catch {
    return niaFallback(idea);
  }
}
