import { Blocks, Cpu, Globe, Layers, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const layers = [
  {
    name: "Nia",
    role: "Market Intelligence Layer",
    detail: "Web research, competitor discovery, trends, and negative market signals.",
    icon: Globe,
  },
  {
    name: "Greptile",
    role: "Technical Due Diligence Layer",
    detail:
      "Code quality, architecture, maintainability, and scalability risk detection.",
    icon: Cpu,
  },
  {
    name: "CLoD",
    role: "Autonomous MVP Execution Layer",
    detail: "Implementation planning, MVP scaffolds, and execution-ready build plans.",
    icon: Layers,
  },
  {
    name: "AllScale",
    role: "Parallel Agent Scale Layer",
    detail: "Agent pool sizing, parallel tasks, and orchestration strategy.",
    icon: Blocks,
  },
  {
    name: "BGA",
    role: "Governance Ledger · Blockchain for Good",
    detail:
      "Transparent decision ledger and tamper-evident verdict trail for high-stakes ideas.",
    icon: Shield,
  },
];

export function SponsorEngine() {
  return (
    <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-cyan-500/5">
      <CardHeader>
        <CardTitle className="text-lg text-white">Sponsor engine topology</CardTitle>
        <p className="text-sm text-muted-foreground">
          Each sponsor maps to a council system layer — visible in-stage and in export JSON.
        </p>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {layers.map((l) => (
          <div
            key={l.name}
            className="flex gap-3 rounded-xl border border-white/10 bg-black/30 p-4"
          >
            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-500/10">
              <l.icon className="h-5 w-5 text-cyan-200" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">
                {l.name}{" "}
                <span className="text-xs font-normal text-cyan-100/90">→ {l.role}</span>
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">{l.detail}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
