import { motion } from "framer-motion";
import { Brain, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { CouncilAgent } from "@/types/council";
import { cn } from "@/lib/utils";

interface AgentCardProps {
  agent: CouncilAgent;
  index: number;
}

export function AgentCard({ agent, index }: AgentCardProps) {
  const thinking = agent.status === "thinking";
  const complete = agent.status === "complete";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 260, damping: 22 }}
    >
      <Card
        className={cn(
          "border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02]",
          thinking && "animate-pulse-glow border-cyan-400/40 shadow-[0_0_30px_rgba(34,211,238,0.2)]",
          complete && "border-emerald-500/30"
        )}
      >
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Brain className="h-4 w-4 text-cyan-300" />
                <span className="font-semibold text-white">{agent.name}</span>
                {agent.sponsorTool && (
                  <Badge variant="glow" className="text-[10px] normal-case">
                    {agent.sponsorTool}
                  </Badge>
                )}
              </div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {agent.role}
              </p>
            </div>
            <Badge variant={complete ? "success" : thinking ? "glow" : "secondary"}>
              {agent.status}
            </Badge>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {agent.insight}
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            <div>
              <div className="mb-1 flex items-center gap-1 text-xs font-semibold text-foreground">
                <Shield className="h-3.5 w-3.5 text-amber-300" />
                Risk
              </div>
              <p className="text-xs text-amber-100/90">{agent.risk}</p>
            </div>
            <div>
              <div className="mb-1 text-xs font-semibold text-cyan-100">
                Recommendation
              </div>
              <p className="text-xs text-cyan-50/90">{agent.recommendation}</p>
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>Confidence</span>
              <span className="font-mono text-foreground">{agent.confidence}%</span>
            </div>
            <Progress value={agent.confidence} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
