import { format } from "date-fns";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import type { FinalVerdict as FinalVerdictModel } from "../../types";
import { StatusBadge } from "../shared/StatusBadge";
import { ExportButton } from "./ExportButton";

function Section({ index, title, markdown }: { index: number; title: string; markdown: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-lg border border-white/10 bg-court-surface p-4"
    >
      <h2 className="mb-3 text-xs uppercase tracking-wider text-zinc-500">{title}</h2>
      <div className="prose prose-invert max-w-none prose-p:text-sm prose-p:leading-6 prose-li:text-sm prose-strong:text-zinc-100">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
    </motion.section>
  );
}

export function FinalVerdict({ verdict }: { verdict: FinalVerdictModel }) {
  const sections = [
    {
      title: "Institutional Recommendation",
      markdown: verdict.institutionalSummary,
    },
    {
      title: "Final Venture Thesis",
      markdown: verdict.ventureThesis,
    },
    {
      title: "Why This Could Win",
      markdown: verdict.whyItCouldWin.map((item) => `- ${item}`).join("\n") || "- No positive signal recorded.",
    },
    {
      title: "Why This Could Fail",
      markdown: verdict.whyItCouldFail.map((item) => `- ${item}`).join("\n") || "- No failure mode recorded.",
    },
    {
      title: "MVP Wedge + GTM Motion",
      markdown: `**MVP wedge:** ${verdict.mvpWedge}\n\n**GTM motion:** ${verdict.gtmMotion}`,
    },
    {
      title: "Risk Register",
      markdown:
        verdict.risks.map((risk) => `- **${risk.severity}:** ${risk.description}`).join("\n") ||
        "- No active risks recorded.",
    },
    {
      title: "30-Day Action Plan",
      markdown: verdict.actionPlan30Days.map((item, index) => `${index + 1}. ${item}`).join("\n"),
    },
  ];

  return (
    <div className="space-y-4 p-4 pb-24">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-white/15 bg-court-raised p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-zinc-500">Verdict</span>
              <StatusBadge
                label={verdict.decision}
                tone={verdict.decision === "PROCEED" ? "success" : verdict.decision === "PIVOT" ? "warning" : "danger"}
              />
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-zinc-50">
              {verdict.decision} <span className="font-mono text-zinc-500">{verdict.confidence}%</span>
            </h1>
            <p className="mt-2 font-mono text-xs text-zinc-600">Session: {verdict.sessionId}</p>
          </div>
          <ExportButton verdict={verdict} />
        </div>
      </motion.header>

      {sections.map((section, index) => (
        <Section key={section.title} index={index + 1} title={section.title} markdown={section.markdown} />
      ))}

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="rounded-lg border border-white/10 bg-court-surface p-4"
      >
        <h2 className="mb-3 text-xs uppercase tracking-wider text-zinc-500">Agent Positions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-zinc-600">
              <tr>
                <th className="py-2 pr-3">Agent</th>
                <th className="py-2 pr-3">Position</th>
                <th className="py-2">Claim</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {verdict.agentSummaries.map((summary) => (
                <tr key={`${summary.agent}-${summary.claim}`}>
                  <td className="py-2 pr-3 text-zinc-300">{summary.agent}</td>
                  <td className="py-2 pr-3">
                    <StatusBadge label={summary.position} tone={summary.position} />
                  </td>
                  <td className="py-2 text-zinc-400">{summary.claim}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="rounded-lg border border-white/10 bg-court-surface p-4"
      >
        <h2 className="mb-3 text-xs uppercase tracking-wider text-zinc-500">Governance Audit Trail</h2>
        <div className="space-y-2">
          {verdict.governanceTrail.map((checkpoint) => (
            <div key={checkpoint.id} className="grid grid-cols-[120px_1fr_120px] gap-3 text-xs">
              <span className="font-mono text-emerald-400">{checkpoint.hash}</span>
              <span className="text-zinc-400">{checkpoint.stageId.replace("_", " ")}</span>
              <span className="text-zinc-600">{format(checkpoint.timestamp, "HH:mm:ss")}</span>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
