import clsx from "clsx";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useStore } from "../../store/useStore";
import { StatusBadge } from "../shared/StatusBadge";

function confidenceClass(value: number) {
  if (value > 70) return "text-emerald-300";
  if (value >= 50) return "text-amber-300";
  return "text-red-300";
}

export function RightRail() {
  const currentConfidence = useStore((state) => state.currentConfidence);
  const currentThesis = useStore((state) => state.currentThesis);
  const confidenceHistory = useStore((state) => state.confidenceHistory);
  const activeRisks = useStore((state) => state.activeRisks);
  const codeReview = useStore((state) => state.codeReview);
  const finalVerdict = useStore((state) => state.finalVerdict);
  const status =
    finalVerdict?.decision === "PROCEED"
      ? "VALIDATED"
      : currentConfidence >= 70
        ? "ON TRACK"
        : currentConfidence >= 50
          ? "PIVOTING"
          : "AT RISK";

  return (
    <aside className="overflow-y-auto border-l border-white/10 bg-court-surface p-4 scrollbar-thin-dark">
      <section>
        <h2 className="text-xs uppercase tracking-wider text-zinc-500">Venture State</h2>
        <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-3">
          <StatusBadge label={status} tone={status === "AT RISK" ? "danger" : status === "PIVOTING" ? "warning" : "success"} />
          <motion.div
            key={Math.round(currentConfidence)}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 18 }}
            className={clsx("mt-3 font-mono text-4xl", confidenceClass(currentConfidence))}
          >
            {Math.round(currentConfidence)}%
          </motion.div>
          <p className="mt-3 text-xs leading-5 text-zinc-400">{currentThesis}</p>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-xs uppercase tracking-wider text-zinc-500">Confidence History</h2>
        <div className="mt-3 space-y-2">
          {confidenceHistory.map((entry, index) => (
            <div key={`${entry.agent}-${index}`} className="flex items-center justify-between gap-3 text-xs">
              <span className="truncate text-zinc-500">{entry.agent}</span>
              <span className="font-mono text-zinc-300">
                {index === 0 ? "--" : `${entry.value}%`}
                {index > 0 && entry.delta !== 0 && (
                  <span className={entry.delta > 0 ? "text-emerald-400" : "text-amber-400"}>
                    {" "}
                    ({entry.delta > 0 ? "+" : ""}
                    {entry.delta})
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-xs uppercase tracking-wider text-zinc-500">Active Risks</h2>
        <div className="mt-3 space-y-2">
          {activeRisks.length === 0 ? (
            <p className="text-xs text-zinc-600">Risk register awaiting agent findings.</p>
          ) : (
            activeRisks.slice(0, 6).map((risk) => (
              <div key={`${risk.severity}-${risk.description}`} className="flex gap-2 text-xs">
                <span
                  className={clsx(
                    "font-mono",
                    risk.severity === "HIGH" && "text-red-300",
                    risk.severity === "MEDIUM" && "text-amber-300",
                    risk.severity === "LOW" && "text-zinc-500"
                  )}
                >
                  {risk.severity}
                </span>
                <span className="text-zinc-400">{risk.description}</span>
              </div>
            ))
          )}
        </div>
      </section>

      {codeReview && (
        <section className="mt-6">
          <h2 className="text-xs uppercase tracking-wider text-zinc-500">Code Review</h2>
          <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <div className={clsx("font-mono text-2xl", confidenceClass(codeReview.overallScore))}>
              {codeReview.overallScore}
            </div>
            <p className="mt-2 text-xs leading-5 text-zinc-300">{codeReview.verdict}</p>
            <div className="mt-3 space-y-2">
              {codeReview.strengths.slice(0, 3).map((strength) => (
                <div key={strength} className="flex gap-2 text-xs text-zinc-400">
                  <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                  <span>{strength}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              {codeReview.concerns.slice(0, 3).map((concern) => (
                <div key={concern.issue} className="text-xs">
                  <StatusBadge label={concern.severity} tone={concern.severity} />
                  <p className="mt-1 text-zinc-400">{concern.issue}</p>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <StatusBadge label={codeReview.recommendation} tone={codeReview.recommendation === "proceed" ? "success" : "warning"} />
            </div>
          </div>
        </section>
      )}
    </aside>
  );
}
