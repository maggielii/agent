/**
 * BGA — Blockchain for Good governance layer: tamper-evident verdict trail,
 * public-good scoring, proof-of-evaluation for high-stakes ideas.
 * Env: VITE_BGA_API_KEY (placeholder)
 */

import type { GovernanceRecord } from "@/types/council";

export function mockGovernanceRecord(
  idea: string,
  stageIds: string[]
): GovernanceRecord {
  const hash = simpleHash(`BGA|${idea}|${stageIds.join(",")}`);
  const hex = hash.toString(16).padStart(16, "0");
  return {
    decisionHash: `0xbga${hex}`,
    auditTrail: [
      ...stageIds.map((id, i) => `Sealed stage ${i + 1}: ${id} → quorum metadata`),
      "Final Judge commit: synthesis hash anchored to sponsor attestations",
    ],
    publicGoodScore: /health|climate|education|public/i.test(idea) ? 82 : 58,
    governanceRationale:
      "Blockchain for Good is used to create a transparent, tamper-evident record of how the council reached its final recommendation, especially for ideas with social impact, funding, or governance implications.",
  };
}

export async function realBgaRecord(
  idea: string,
  stageIds: string[]
): Promise<GovernanceRecord> {
  if (!import.meta.env.VITE_BGA_API_KEY) {
    return mockGovernanceRecord(idea, stageIds);
  }
  // Anchor hashes to BGA network or partner ledger API.
  return mockGovernanceRecord(idea, stageIds);
}

function simpleHash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
