/**
 * Greptile — Technical Due Diligence Layer (code/architecture/maintainability/scalability).
 * Env: VITE_GREPTILE_API_KEY (placeholder)
 */

export interface GreptileReview {
  codeQuality: string;
  architecture: string;
  maintainability: string;
  scalabilityRisks: string[];
  overallTechnicalRisk: "low" | "medium" | "high";
}

export function mockGreptileReview(idea: string): GreptileReview {
  const construction = /construction|site|vendor|project/i.test(idea);
  return {
    codeQuality:
      "Integration surface area is high; prioritize contract tests for vendor and ERP adapters. [Greptile mock]",
    architecture: construction
      ? "Modular monolith with event-driven site updates fits regulated environments."
      : "Start with bounded contexts around core workflows; defer premature microservices.",
    maintainability:
      "Watch for duplicated scheduling logic—centralize policy engine early.",
    scalabilityRisks: [
      "Burst traffic at shift changes if notifications fan out globally.",
      "Attachment-heavy reporting may need async pipelines.",
    ],
    overallTechnicalRisk: construction ? "medium" : "medium",
  };
}

/**
 * Real Greptile API: authenticate with VITE_GREPTILE_API_KEY, point at repo or snippet
 * context Greptile supports, and map response into GreptileReview.
 */
export async function realGreptileReview(_idea: string): Promise<GreptileReview> {
  if (!import.meta.env.VITE_GREPTILE_API_KEY) {
    return mockGreptileReview(_idea);
  }
  // await fetch('https://api.greptile.com/...', { headers: { Authorization: `Bearer ${key}` } })
  return mockGreptileReview(_idea);
}
