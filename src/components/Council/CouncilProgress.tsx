import { COUNCIL_STAGE_IDS } from "@/data/councilConfig";
import type { CouncilStage } from "@/types/council";

interface CouncilProgressProps {
  stages: CouncilStage[];
}

export function CouncilProgress({ stages }: CouncilProgressProps) {
  const done = stages.filter((s) => s.status === "complete").length;
  const pct = Math.round((done / COUNCIL_STAGE_IDS.length) * 100);

  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span className="font-mono text-foreground">{pct}%</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span>
        {done}/{COUNCIL_STAGE_IDS.length} councils
      </span>
    </div>
  );
}
