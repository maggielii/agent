import { Check, Circle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { CouncilStage } from "@/types/council";

interface CouncilTimelineProps {
  stages: CouncilStage[];
  activeId?: string;
}

export function CouncilTimeline({ stages, activeId }: CouncilTimelineProps) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max gap-2">
        {stages.map((s, idx) => {
          const active = s.id === activeId;
          const done = s.status === "complete";
          const run = s.status === "running";
          return (
            <motion.div
              key={s.id}
              className={cn(
                "flex min-w-[160px] flex-col gap-1 rounded-xl border px-3 py-2 text-xs transition-all",
                done && "border-emerald-500/40 bg-emerald-500/10",
                run && "animate-pulse-glow border-cyan-400/60 bg-cyan-500/15",
                !done && !run && "border-white/10 bg-white/5"
              )}
              layout
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] text-muted-foreground">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                {done ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : run ? (
                  <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
                ) : (
                  <Circle className="h-4 w-4 text-white/30" />
                )}
              </div>
              <span
                className={cn(
                  "font-semibold leading-tight text-white",
                  active && "drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                )}
              >
                {s.name.replace(" Council", "")}
              </span>
              <span className="text-[10px] text-muted-foreground line-clamp-2">
                {s.description}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
