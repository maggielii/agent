import clsx from "clsx";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import type { CodeReview } from "../../types";
import { StatusBadge } from "../shared/StatusBadge";

type CodeReviewPanelProps = {
  review: CodeReview;
};

function scoreClass(score: number) {
  if (score > 70) return "text-emerald-300";
  if (score >= 50) return "text-amber-300";
  return "text-red-300";
}

export function CodeReviewPanel({ review }: CodeReviewPanelProps) {
  return (
    <motion.section
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="border-t border-white/10 bg-court-surface p-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xs uppercase tracking-wider text-zinc-500">Code Review</h2>
          <p className="mt-2 text-sm text-zinc-300">{review.verdict}</p>
        </div>
        <div className={clsx("font-mono text-3xl", scoreClass(review.overallScore))}>{review.overallScore}</div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="text-xs uppercase tracking-wider text-zinc-500">Strengths</h3>
          <div className="mt-2 space-y-2">
            {review.strengths.map((strength) => (
              <div key={strength} className="flex gap-2 text-xs text-zinc-400">
                <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                <span>{strength}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-xs uppercase tracking-wider text-zinc-500">Concerns</h3>
          <div className="mt-2 space-y-2">
            {review.concerns.map((concern) => (
              <div key={concern.issue} className="rounded border border-white/10 bg-white/[0.03] p-2 text-xs">
                <StatusBadge label={concern.severity} tone={concern.severity} />
                <p className="mt-2 text-zinc-300">{concern.issue}</p>
                <p className="mt-1 text-zinc-500">{concern.suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4">
        <StatusBadge label={review.recommendation.toUpperCase()} tone={review.recommendation === "proceed" ? "success" : "warning"} />
      </div>
    </motion.section>
  );
}
