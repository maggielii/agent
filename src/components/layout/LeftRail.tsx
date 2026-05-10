import clsx from "clsx";
import { format } from "date-fns";
import { Check } from "lucide-react";
import { useStore } from "../../store/useStore";
import type { StageState } from "../../types";

interface StageNodeProps {
  stage: StageState;
  isActive: boolean;
}

function StageNode({ stage, isActive }: StageNodeProps) {
  const delta = stage.confidenceAtSeal - 50;
  return (
    <div className="flex gap-3">
      <div
        className={clsx(
          "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
          stage.status === "pending" && "border-white/10 text-zinc-700",
          isActive && "animate-pulse border-indigo-500 text-indigo-300",
          stage.status === "complete" && "border-emerald-400/50 bg-emerald-400/10 text-emerald-300"
        )}
      >
        {stage.status === "complete" && <Check className="h-3 w-3" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className={clsx("text-sm", isActive || stage.status === "complete" ? "text-zinc-100" : "text-zinc-600")}>
          {stage.name}
        </div>
        {stage.status === "complete" ? (
          <div className="mt-1 space-y-1">
            <p className={clsx("font-mono text-xs", delta >= 0 ? "text-emerald-400" : "text-amber-400")}>
              {delta >= 0 ? "+" : ""}
              {delta}% seal
            </p>
            <p className="truncate text-xs text-zinc-500">{stage.stageVerdict}</p>
          </div>
        ) : (
          <p className="mt-1 text-xs text-zinc-700">{stage.status}</p>
        )}
      </div>
    </div>
  );
}

export function LeftRail() {
  const stages = useStore((state) => state.stages);
  const currentStageIndex = useStore((state) => state.currentStageIndex);
  const specialists = useStore((state) => state.specialists);
  const governanceCheckpoints = useStore((state) => state.governanceCheckpoints);

  return (
    <aside className="overflow-y-auto border-r border-white/10 bg-court-surface p-4 scrollbar-thin-dark">
      <section>
        <h2 className="mb-3 text-xs uppercase tracking-wider text-zinc-500">Court Stage Machine</h2>
        <div className="space-y-5">
          {stages.map((stage, index) => (
            <StageNode key={stage.id} stage={stage} isActive={index === currentStageIndex && stage.status === "active"} />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xs uppercase tracking-wider text-zinc-500">Specialists</h2>
        {specialists.length === 0 ? (
          <p className="text-xs italic text-zinc-600">No specialists summoned</p>
        ) : (
          <div className="space-y-3">
            {specialists.map((specialist) => (
              <article key={specialist.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <div className="text-sm font-medium text-zinc-100">{specialist.name}</div>
                <div className="text-xs text-zinc-500">{specialist.domain}</div>
                <p className="mt-2 text-xs leading-5 text-zinc-400">{specialist.finding || "Reviewing domain exposure."}</p>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  {specialist.ventureImpact || "Impact will be incorporated before the next stage."}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xs uppercase tracking-wider text-zinc-500">Governance</h2>
        {governanceCheckpoints.length === 0 ? (
          <p className="text-xs text-zinc-600">No sealed stages yet.</p>
        ) : (
          <div className="space-y-3">
            {governanceCheckpoints.map((checkpoint) => (
              <div key={checkpoint.id} className="rounded border border-white/10 bg-white/[0.03] p-2">
                <div className="text-xs text-zinc-300">{checkpoint.stageId.replace("_", " ")}</div>
                <div className="mt-1 font-mono text-xs text-emerald-400">{checkpoint.hash.slice(0, 8)}...</div>
                <div className="mt-1 text-xs text-zinc-600">{format(checkpoint.timestamp, "HH:mm:ss")}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </aside>
  );
}
