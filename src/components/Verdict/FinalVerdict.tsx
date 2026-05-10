import type { ComponentType } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Cpu, Scale, Sparkles } from "lucide-react";
import { DisagreementPanel } from "@/components/Dashboard/DisagreementPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { FinalVerdict as FinalVerdictType } from "@/types/council";
import { VerdictBadge } from "./VerdictBadge";

interface FinalVerdictProps {
  verdict: FinalVerdictType;
}

export function FinalVerdict({ verdict }: FinalVerdictProps) {
  const conflicts = verdict.disagreements;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      className="space-y-6"
    >
      <Card className="overflow-hidden border-cyan-400/40 bg-gradient-to-br from-slate-900/90 via-slate-950 to-black shadow-[0_0_60px_rgba(34,211,238,0.18)]">
        <div className="grid gap-6 p-6 md:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Sparkles className="h-6 w-6 text-cyan-300" />
              <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                Final venture verdict
              </h2>
              <VerdictBadge decision={verdict.decision} />
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Binding council synthesis across Founder, Market, Technical, Investor,
              Adversarial, Governance, CEO, and Final Judge stages — with sponsor attestations
              and governance trail.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase text-muted-foreground">Confidence</p>
                <p className="font-mono text-3xl font-bold text-cyan-100">
                  {verdict.confidenceScore}%
                </p>
                <Progress value={verdict.confidenceScore} className="mt-2" />
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase text-muted-foreground">Overall score</p>
                <p className="font-mono text-3xl font-bold text-white">
                  {verdict.overallScore}
                </p>
                <Progress value={verdict.overallScore} className="mt-2" />
              </div>
            </div>
          </div>
          <div className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
            <div className="flex items-center gap-2 text-amber-100">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-semibold">Biggest risk</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {verdict.biggestRisk}
            </p>
            <div className="flex items-center gap-2 text-emerald-200">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-semibold">Best next step</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {verdict.bestNextStep}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-white/10 bg-black/40">
          <CardHeader>
            <CardTitle className="text-base text-white">MVP recommendation</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground">
            {verdict.mvpRecommendation}
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-black/40">
          <CardHeader>
            <CardTitle className="text-base text-white">3 action items</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
              {verdict.actionItems.map((a) => (
                <li key={a} className="leading-relaxed">
                  {a}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      {conflicts.length > 0 && <DisagreementPanel items={conflicts} />}

      <Card className="border-violet-500/30 bg-violet-500/[0.07]">
        <CardHeader>
          <CardTitle className="text-base text-white">Sponsor integration summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <SummaryLine title="Greptile" body={verdict.sponsorSummary.greptile} icon={Cpu} />
          <SummaryLine title="Nia" body={verdict.sponsorSummary.nia} icon={Sparkles} />
          <SummaryLine title="CLoD" body={verdict.sponsorSummary.clod} icon={CheckCircle2} />
          <SummaryLine title="AllScale" body={verdict.sponsorSummary.allscale} icon={Sparkles} />
          <SummaryLine title="BGA" body={verdict.sponsorSummary.bga} icon={Scale} />
        </CardContent>
      </Card>

      <Card className="border-emerald-500/30 bg-emerald-500/[0.05]">
        <CardHeader>
          <CardTitle className="text-base text-emerald-100">
            BGA governance · proof of evaluation
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {verdict.governanceRecord.governanceRationale}
          </p>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-md border border-white/10 bg-black/40 px-2 py-1 font-mono text-xs text-cyan-100">
              {verdict.governanceRecord.decisionHash}
            </span>
            <span className="rounded-md border border-white/10 bg-black/40 px-2 py-1 text-xs">
              Public-good score:{" "}
              <strong className="text-white">{verdict.governanceRecord.publicGoodScore}</strong>
              /100
            </span>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              Council audit trail
            </p>
            <ul className="space-y-1 font-mono text-xs text-muted-foreground">
              {verdict.governanceRecord.auditTrail.map((line) => (
                <li key={line} className="rounded border border-white/5 bg-black/30 px-2 py-1">
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SummaryLine({
  title,
  body,
  icon: Icon,
}: {
  title: string;
  body: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex gap-3 rounded-lg border border-white/10 bg-black/30 p-3">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-cyan-200" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">
          {title}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}
