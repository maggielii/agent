import { Activity, Gauge, Scale, ShieldAlert, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { CouncilStage } from "@/types/council";

interface ScorePanelProps {
  stages: CouncilStage[];
  overallScore: number;
}

function scoreFor(stages: CouncilStage[], id: string) {
  return stages.find((s) => s.id === id)?.score ?? 0;
}

export function ScorePanel({ stages, overallScore }: ScorePanelProps) {
  const market = scoreFor(stages, "market");
  const technical = scoreFor(stages, "technical");
  const investor = scoreFor(stages, "investor");
  const governance = scoreFor(stages, "governance");
  const adversarial = scoreFor(stages, "adversarial");
  const riskScore = Math.max(0, 100 - adversarial);

  const rows = [
    { label: "Market intelligence", value: market, icon: TrendingUp },
    { label: "Technical feasibility", value: technical, icon: Activity },
    { label: "Investor thesis", value: investor, icon: Gauge },
    { label: "Governance & scale", value: governance, icon: Scale },
    { label: "Risk resilience (inverse adversarial)", value: riskScore, icon: ShieldAlert },
  ];

  return (
    <Card className="border-white/10 bg-white/[0.04] backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-base text-white">Venture scoreboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.map((r) => (
          <div key={r.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-2 font-medium text-foreground">
                <r.icon className="h-4 w-4 text-cyan-300" />
                {r.label}
              </span>
              <span className="font-mono text-foreground">{r.value}%</span>
            </div>
            <Progress value={r.value} />
          </div>
        ))}
        <div className="rounded-lg border border-cyan-500/40 bg-gradient-to-r from-cyan-500/15 to-violet-600/15 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Overall council score</span>
            <span className="font-mono text-2xl font-bold text-cyan-100">{overallScore}</span>
          </div>
          <Progress value={overallScore} className="mt-2" />
        </div>
      </CardContent>
    </Card>
  );
}
