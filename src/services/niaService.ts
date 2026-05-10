/**
 * Nia — Market Intelligence Layer (research, competitors, trends, negative signals).
 * Env: VITE_NIA_API_KEY (placeholder)
 */

export interface NiaCompetitor {
  name: string;
  positioning: string;
  threat: "low" | "medium" | "high";
}

export interface NiaTrend {
  label: string;
  direction: "up" | "flat" | "down";
}

export interface NiaResearch {
  summary: string;
  competitors: NiaCompetitor[];
  trends: NiaTrend[];
  negativeSignals: string[];
  marketAttractiveness: number;
}

export function mockNiaResearch(idea: string): NiaResearch {
  const construction = /construction|site|vendor/i.test(idea);
  return {
    summary: construction
      ? "Construction digitization tailwinds; buyer concentration among GCs creates long sales cycles. [Nia mock]"
      : "Category momentum depends on wedge; monitor incumbents bundling AI features.",
    competitors: [
      {
        name: construction ? "Procore + bolt-ons" : "Horizontal PM tools",
        positioning: "Workflow lock-in via subs and compliance",
        threat: "high",
      },
      {
        name: "Vertical AI copilots",
        positioning: "Narrow automation on scheduling/RFIs",
        threat: "medium",
      },
    ],
    trends: [
      { label: "AI ops on job sites", direction: "up" },
      { label: "Enterprise procurement scrutiny", direction: "up" },
    ],
    negativeSignals: [
      "Procurement-driven pilots stall without executive sponsor",
      "Data interoperability across subcontractors remains messy",
    ],
    marketAttractiveness: construction ? 72 : 64,
  };
}

export async function realNiaResearch(idea: string): Promise<NiaResearch> {
  if (!import.meta.env.VITE_NIA_API_KEY) {
    return mockNiaResearch(idea);
  }
  // Real Nia web research pipeline would run here.
  return mockNiaResearch(idea);
}
