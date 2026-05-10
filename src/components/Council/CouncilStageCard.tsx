import { motion } from "framer-motion";
import { AgentCard } from "./AgentCard";
import { JudgeCard } from "./JudgeCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CouncilStage } from "@/types/council";
import { cn } from "@/lib/utils";

interface CouncilStageCardProps {
  stage: CouncilStage;
  highlight?: boolean;
}

export function CouncilStageCard({ stage, highlight }: CouncilStageCardProps) {
  return (
    <motion.section
      layout
      className={cn(
        "space-y-4 rounded-2xl border p-4 md:p-5",
        stage.status === "running" &&
          "border-cyan-400/50 bg-gradient-to-br from-cyan-500/10 to-transparent shadow-[0_0_40px_rgba(34,211,238,0.12)]",
        stage.status === "complete" &&
          "border-emerald-500/25 bg-gradient-to-br from-emerald-500/5 to-transparent",
        stage.status === "pending" && "border-white/5 bg-white/[0.02] opacity-70",
        highlight && "ring-2 ring-cyan-400/60"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-lg text-white">{stage.name}</CardTitle>
            <Badge
              variant={
                stage.status === "complete"
                  ? "success"
                  : stage.status === "running"
                    ? "glow"
                    : "secondary"
              }
            >
              {stage.status}
            </Badge>
            <span className="font-mono text-xs text-muted-foreground">
              score {stage.score || "—"}
            </span>
          </div>
          <CardDescription className="mt-1 max-w-3xl">
            {stage.description}
          </CardDescription>
          {stage.sponsorConnection && (
            <p className="mt-2 text-xs font-medium text-cyan-200/90">
              Sponsor layer: {stage.sponsorConnection}
            </p>
          )}
        </div>
        <div className="text-right text-xs text-muted-foreground">
          Risk ·{" "}
          <span className="font-semibold uppercase text-foreground">
            {stage.riskLevel}
          </span>
        </div>
      </div>
      {stage.agents.length > 0 && (
        <div className="grid gap-3 lg:grid-cols-2">
          {stage.agents.map((a, i) => (
            <AgentCard key={a.id} agent={a} index={i} />
          ))}
        </div>
      )}
      {stage.judge.judgeName !== "Pending" && <JudgeCard judge={stage.judge} />}
      {stage.stageVerdict.headline && (
        <Card className="border-white/10 bg-black/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">Stage verdict</CardTitle>
            <CardDescription>{stage.stageVerdict.headline}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {stage.stageVerdict.rationale}
          </CardContent>
        </Card>
      )}
    </motion.section>
  );
}
