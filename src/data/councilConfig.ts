/** Stage metadata used for timeline + engine; agents are hydrated in councilEngine */

export const COUNCIL_STAGE_IDS = [
  "founder",
  "market",
  "technical",
  "investor",
  "adversarial",
  "governance",
  "ceo",
  "final",
] as const;

export type CouncilStageId = (typeof COUNCIL_STAGE_IDS)[number];

export const STAGE_META: Record<
  CouncilStageId,
  { name: string; description: string; sponsorConnection?: string }
> = {
  founder: {
    name: "Founder Council",
    description: "Vision, problem-solution fit, and curse-of-knowledge screening.",
  },
  market: {
    name: "Market Intelligence Council",
    description: "TAM, demand signals, competitors, and negative market signals.",
    sponsorConnection: "Nia — Market Intelligence Layer",
  },
  technical: {
    name: "Technical Feasibility Council",
    description: "Architecture, MVP scope, code health, and execution plan.",
    sponsorConnection: "Greptile (due diligence) · CLoD (MVP execution)",
  },
  investor: {
    name: "Investor Council",
    description: "Upside, funding risk, expansion, and defensibility.",
  },
  adversarial: {
    name: "Adversarial Council",
    description: "Challenge assumptions, failure modes, security, and adoption friction.",
  },
  governance: {
    name: "Scale & Governance Council",
    description: "Parallel agent scaling and transparent governance ledger.",
    sponsorConnection: "AllScale · BGA (Blockchain for Good)",
  },
  ceo: {
    name: "Executive CEO Council",
    description: "Long-term vision vs. operating realism vs. sustainability vs. PMF.",
  },
  final: {
    name: "Final Judge",
    description: "Venture-style synthesis and binding recommendation.",
  },
};
