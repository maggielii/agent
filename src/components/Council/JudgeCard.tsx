import { motion } from "framer-motion";
import { Gavel } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { JudgeOutput } from "@/types/council";

function passVariant(
  p: JudgeOutput["passStatus"]
): "success" | "warn" | "danger" {
  if (p === "proceed") return "success";
  if (p === "caution") return "warn";
  return "danger";
}

interface JudgeCardProps {
  judge: JudgeOutput;
}

export function JudgeCard({ judge }: JudgeCardProps) {
  const label =
    judge.passStatus === "proceed"
      ? "Proceed"
      : judge.passStatus === "caution"
        ? "Caution"
        : "Fail";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card className="border border-violet-500/30 bg-gradient-to-br from-violet-500/15 to-cyan-500/10 shadow-[0_0_34px_rgba(139,92,246,0.2)]">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-base text-white">
              <Gavel className="h-5 w-5 text-violet-200" />
              {judge.judgeName}
            </CardTitle>
            <Badge variant={passVariant(judge.passStatus)} className="text-[11px]">
              {label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="leading-relaxed text-muted-foreground">{judge.summary}</p>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-black/20 p-3">
              <p className="text-xs uppercase text-muted-foreground">Stage score</p>
              <p className="font-mono text-2xl font-bold text-white">{judge.score}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-3">
              <p className="text-xs uppercase text-muted-foreground">Judge confidence</p>
              <p className="font-mono text-2xl font-bold text-cyan-100">
                {judge.confidence}%
              </p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-amber-200">Biggest concern</p>
              <p className="text-sm text-muted-foreground">{judge.biggestConcern}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-200">Next step</p>
              <p className="text-sm text-muted-foreground">{judge.nextStep}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
