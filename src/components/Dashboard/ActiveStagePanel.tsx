import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CouncilStage } from "@/types/council";

interface ActiveStagePanelProps {
  stage?: CouncilStage | null;
}

export function ActiveStagePanel({ stage }: ActiveStagePanelProps) {
  if (!stage || stage.status !== "running") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
    >
      <Card className="border-cyan-400/50 bg-cyan-500/10 shadow-[0_0_40px_rgba(34,211,238,0.15)]">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base text-cyan-50">
            <Zap className="h-5 w-5 animate-pulse text-cyan-200" />
            Active deliberation · {stage.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <AnimatePresence mode="popLayout">
            {stage.agents.filter((a) => a.status === "thinking").map((a) => (
              <motion.p
                key={a.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="font-mono text-xs text-cyan-100"
              >
                Reasoning · {a.name}…
              </motion.p>
            ))}
          </AnimatePresence>
          {stage.agents.length === 0 && (
            <p className="text-xs">Spawning specialist agents…</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
