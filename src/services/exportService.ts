import type { CouncilRunResult } from "@/types/council";

export function buildExportPayload(result: CouncilRunResult) {
  return {
    exportedAt: new Date().toISOString(),
    product: "CouncilOS",
    idea: result.idea,
    finalVerdict: result.finalVerdict,
    stages: result.stages.map((s) => ({
      id: s.id,
      name: s.name,
      score: s.score,
      riskLevel: s.riskLevel,
      sponsorConnection: s.sponsorConnection,
      agents: s.agents.map((a) => ({
        id: a.id,
        name: a.name,
        role: a.role,
        sponsorTool: a.sponsorTool,
        insight: a.insight,
        confidence: a.confidence,
        risk: a.risk,
        recommendation: a.recommendation,
      })),
      judge: s.judge,
      stageVerdict: s.stageVerdict,
    })),
  };
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportVerdictFilename() {
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  return `councilos-verdict-${ts}.json`;
}
