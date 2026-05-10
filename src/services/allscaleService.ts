/**
 * AllScale — Parallel agent scale layer (orchestration breadth vs. idea complexity).
 * Env: VITE_ALLSCALE_API_KEY (placeholder)
 */

export interface ScalePlan {
  recommendedAgents: number;
  parallelTasks: number;
  orchestrationMode: "sequential" | "parallel_fanout" | "hierarchical";
  scalingStrategy: string;
}

export function mockScalePlan(idea: string): ScalePlan {
  const complex = idea.length > 120 || /enterprise|governance|multi-tenant/i.test(idea);
  return {
    recommendedAgents: complex ? 28 : 18,
    parallelTasks: complex ? 9 : 5,
    orchestrationMode: complex ? "hierarchical" : "parallel_fanout",
    scalingStrategy: complex
      ? "Spawn specialist squads per subdomain with a routing orchestrator and merge summaries."
      : "Keep a lean council with parallel research and codegen agents behind feature flags.",
  };
}

export async function realAllScaleOrchestration(
  idea: string
): Promise<ScalePlan> {
  if (!import.meta.env.VITE_ALLSCALE_API_KEY) {
    return mockScalePlan(idea);
  }
  // Call AllScale orchestration API for task graph + agent pool sizing.
  return mockScalePlan(idea);
}
